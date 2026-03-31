import { redirect } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { safeGetSession, supabase } }) => {
	const { session, user } = await safeGetSession();

	let orders = null;
	let profile = null;

	if (user) {
		const [{ data: o }, { data: p }] = await Promise.all([
			supabase
				.from('orders')
				.select('*')
				.eq('user_id', user.id)
				.order('created_at', { ascending: false }),
			supabase.from('profiles').select('*').eq('id', user.id).single()
		]);
		orders = o ?? [];
		profile = p;
	}

	return { session, user, orders, profile };
};

export const actions: Actions = {
	signIn: async ({ request, url, locals: { supabase } }) => {
		const data = await request.formData();
		const email = (data.get('email') as string)?.trim();

		if (!email || !email.includes('@')) return fail(400, { error: 'Valid email required' });

		const { error } = await supabase.auth.signInWithOtp({
			email,
			options: {
				shouldCreateUser: true,
				emailRedirectTo: `${url.origin}/auth/callback`
			}
		});

		if (error) return fail(400, { error: error.message });
		return { otpSent: true, email };
	},

	verifyOtp: async ({ request, locals: { supabase } }) => {
		const data = await request.formData();
		const email = data.get('email') as string;
		const token = data.get('token') as string;

		if (!token || token.length !== 6) return fail(400, { otpSent: true, email, error: 'Enter the 6-digit code' });

		const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
		if (error) return fail(400, { otpSent: true, email, error: 'Invalid or expired code. Try again.' });

		throw redirect(303, '/account');
	},

	signOut: async ({ locals: { supabase } }) => {
		await supabase.auth.signOut();
		throw redirect(303, '/');
	}
};
