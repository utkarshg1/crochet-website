import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { safeGetSession, supabase } }) => {
	const { user } = await safeGetSession();
	if (user) {
		// Check if already admin — redirect straight to dashboard
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
	default: async ({ request, locals: { supabase } }) => {
		const data = await request.formData();
		const email = (data.get('email') as string)?.trim();
		const password = data.get('password') as string;

		if (!email || !password) {
			return fail(400, { error: 'Email and password required' });
		}

		const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
			email,
			password
		});

		if (signInError || !authData.user) {
			return fail(401, { error: 'Invalid email or password' });
		}

		// Verify is_admin — even if credentials are correct, reject non-admins
		const { data: profile } = await supabase
			.from('profiles')
			.select('is_admin')
			.eq('id', authData.user.id)
			.single();

		if (!profile?.is_admin) {
			await supabase.auth.signOut();
			return fail(403, { error: 'Access denied' });
		}

		throw redirect(303, '/admin');
	}
};
