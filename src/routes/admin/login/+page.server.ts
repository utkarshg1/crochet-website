import { redirect, fail } from '@sveltejs/kit';
import { ADMIN_EMAILS } from '$env/static/private';
import type { PageServerLoad, Actions } from './$types';

// ── Admin email allowlist ──────────────────────────────────────────
// Comma-separated list in env var ADMIN_EMAILS (e.g. "admin@example.com,dev@example.com")
const allowedEmails = new Set(
	(ADMIN_EMAILS ?? '')
		.split(',')
		.map((e) => e.trim().toLowerCase())
		.filter(Boolean)
);

// ── In-memory rate limiter (per server instance) ───────────────────
// Simple Map<key, { count, resetAt }> — survives across requests
// but resets on server restart. Sufficient for single-instance deploys.
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(
	key: string,
	maxRequests: number,
	windowMs: number
): { ok: boolean; retryAfterMs: number } {
	const now = Date.now();
	const bucket = rateBuckets.get(key);

	if (!bucket || now > bucket.resetAt) {
		rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
		return { ok: true, retryAfterMs: 0 };
	}

	bucket.count++;
	if (bucket.count > maxRequests) {
		return { ok: false, retryAfterMs: bucket.resetAt - now };
	}
	return { ok: true, retryAfterMs: 0 };
}

function getClientIp(request: Request): string {
	return (
		request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
		request.headers.get('x-real-ip') ??
		'unknown'
	);
}

export const load: PageServerLoad = async ({ locals: { safeGetSession, supabase } }) => {
	const { user } = await safeGetSession();
	if (user) {
		const { data: profile } = await supabase
			.from('profiles')
			.select('is_admin')
			.eq('id', user.id)
			.single();
		if (profile?.is_admin) throw redirect(303, '/admin');
	}
	return {};
};

export const actions: Actions = {
	sendOtp: async ({ request, locals: { supabase }, url }) => {
		const formData = await request.formData();
		const email = String(formData.get('email') ?? '')
			.trim()
			.toLowerCase();

		// ── Rate limit: 5 OTP requests per IP per 10 minutes ─────────────
		const ip = getClientIp(request);
		const { ok, retryAfterMs } = checkRateLimit(`otp:${ip}`, 5, 10 * 60 * 1000);
		if (!ok) {
			const retryMin = Math.ceil(retryAfterMs / 60_000);
			return fail(429, {
				error: `Too many requests. Try again in ${retryMin} min.`,
				step: 'email'
			});
		}

		// ── Email validation ─────────────────────────────────────────────
		if (!email.includes('@')) return fail(400, { error: 'Enter a valid email', step: 'email' });

		// ── Admin allowlist check ────────────────────────────────────────
		// Return fake success to avoid leaking which emails are admin
		if (allowedEmails.size > 0 && !allowedEmails.has(email)) {
			return { sent: true, email };
		}

		// ── Send OTP (existing users only — no account creation) ─────────
		const { error } = await supabase.auth.signInWithOtp({
			email,
			options: {
				emailRedirectTo: `${url.origin}/auth/admin-callback`
			}
		});

		if (error) return fail(400, { error: error.message, step: 'email' });

		return { sent: true, email };
	},

	verifyOtp: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = String(formData.get('email') ?? '')
			.trim()
			.toLowerCase();
		const token = String(formData.get('token') ?? '').trim();

		// ── Rate limit: 10 failed verifications per IP per 10 minutes ────
		const ip = getClientIp(request);
		const rateKey = `verify:${ip}`;
		const { ok, retryAfterMs } = checkRateLimit(rateKey, 10, 10 * 60 * 1000);
		if (!ok) {
			const retryMin = Math.ceil(retryAfterMs / 60_000);
			return fail(429, {
				error: `Too many attempts. Try again in ${retryMin} min.`,
				step: 'otp',
				email
			});
		}

		const { error } = await supabase.auth.verifyOtp({
			email,
			token,
			type: 'magiclink'
		});

		if (error) {
			// Reset rate bucket on success only — failures keep counting
			return fail(400, {
				error: `${error.message} (${error.status})`,
				step: 'otp',
				email
			});
		}

		// Clear rate bucket on successful verification
		rateBuckets.delete(rateKey);

		throw redirect(303, '/admin');
	}
};
