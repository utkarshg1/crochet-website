import { redirect, fail } from '@sveltejs/kit';
import { ADMIN_EMAILS } from '$env/static/private';
import { requireAdmin } from '$lib/server/admin';
import type { PageServerLoad, Actions } from './$types';

// ── Admin email allowlist ──────────────────────────────────────────
const allowedEmails = new Set(
	(ADMIN_EMAILS ?? '')
		.split(',')
		.map((e) => e.trim().toLowerCase())
		.filter(Boolean)
);

// ── In-memory rate limiter (per server instance) ───────────────────
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
		const adminCheck = await requireAdmin(supabase, user);
		if (adminCheck.ok) throw redirect(303, '/admin');
	}
	return {};
};

export const actions: Actions = {
	signIn: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = String(formData.get('email') ?? '')
			.trim()
			.toLowerCase();
		const password = String(formData.get('password') ?? '');

		// ── Rate limit: 5 sign-in attempts per IP per 10 minutes ────────────
		const ip = getClientIp(request);
		const { ok, retryAfterMs } = checkRateLimit(`signin:${ip}`, 5, 10 * 60 * 1000);
		if (!ok) {
			const retryMin = Math.ceil(retryAfterMs / 60_000);
			return fail(429, {
				error: `Too many requests. Try again in ${retryMin} min.`
			});
		}

		// ── Email validation ─────────────────────────────────────────────
		if (!email.includes('@')) return fail(400, { error: 'Enter a valid email' });
		if (password.length < 8) return fail(400, { error: 'Password must be at least 8 characters' });

		// ── Admin allowlist check ────────────────────────────────────────
		// Return fake success to avoid leaking which emails are admin
		if (allowedEmails.size > 0 && !allowedEmails.has(email)) {
			// Perform a dummy hash to prevent timing attacks
			await supabase.auth.signInWithPassword({
				email,
				password: 'dummy_password_to_prevent_timing'
			});
			return { success: true };
		}

		// ── Sign in with password ────────────────────────────────────────
		const { error } = await supabase.auth.signInWithPassword({ email, password });

		if (error) return fail(400, { error: 'Invalid email or password' });

		throw redirect(303, '/admin');
	}
};
