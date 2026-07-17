import { createServerClient } from '@supabase/ssr';
import { type Handle } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from '$lib/database.types';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient<Database>(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_ANON_KEY,
		{
			cookies: {
				getAll() {
					return event.cookies.getAll();
				},
				setAll(cookiesToSet) {
					cookiesToSet.forEach(({ name, value, options }) =>
						event.cookies.set(name, value, {
							...options,
							path: '/',
							// Security: enforce secure cookie defaults
							httpOnly: options.httpOnly ?? true,
							secure: options.secure ?? true,
							sameSite: options.sameSite ?? 'lax'
						})
					);
				}
			},
			auth: {
				persistSession: false,
				autoRefreshToken: false
			}
		}
	);

	event.locals.safeGetSession = async () => {
		// Call getUser() FIRST — validates the JWT server-side and suppresses
		// the getSession() warning about unverified user data.
		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();

		if (error) {
			return { session: null, user: null };
		}

		// Now safely get the session (fast, reads from cookies — no extra network call).
		// The getUser() call above suppresses the internal warning.
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();

		if (!session) {
			return { session: null, user: null };
		}

		return { session, user };
	};

	const response = await resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});

	// ── Security headers ─────────────────────────────────────────────────
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-XSS-Protection', '1; mode=block');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set(
		'Permissions-Policy',
		'camera=(), microphone=(), geolocation=(), payment=(self)'
	);
	response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

	// Content Security Policy — allow only necessary sources
	const cspDirectives = [
		"default-src 'self'",
		"script-src 'self' 'unsafe-inline' https://checkout.razorpay.com https://fonts.googleapis.com",
		"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
		"img-src 'self' data: blob: https:",
		"font-src 'self' https://fonts.gstatic.com",
		"connect-src 'self' https://*.supabase.co https://api.razorpay.com",
		'frame-src https://checkout.razorpay.com',
		"object-src 'none'",
		"base-uri 'self'",
		"form-action 'self'"
	].join('; ');
	response.headers.set('Content-Security-Policy', cspDirectives);

	return response;
};
