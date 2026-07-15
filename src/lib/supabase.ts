import { createBrowserClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from '$lib/database.types';

export function createClient() {
	return createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		auth: {
			flowType: 'implicit', // no PKCE verifier needed — works across any browser
			detectSessionInUrl: true // auto-reads tokens from the magic link hash
		}
	});
}
