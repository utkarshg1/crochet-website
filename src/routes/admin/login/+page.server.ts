import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

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
	sendOtp: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = String(formData.get('email') ?? '').trim();

		if (!email.includes('@')) return fail(400, { error: 'Enter a valid email', step: 'email' });

		const { error } = await supabase.auth.signInWithOtp({
			email,
			options: { shouldCreateUser: true }
		});

		if (error) return fail(400, { error: error.message, step: 'email' });

		return { sent: true, email };
	},

	verifyOtp: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = String(formData.get('email') ?? '').trim();
		const token = String(formData.get('token') ?? '').trim();

		const { error } = await supabase.auth.verifyOtp({
			email,
			token,
			type: 'magiclink'
		});

		if (error) return fail(400, { error: `${error.message} (${error.status})`, step: 'otp', email });

		throw redirect(303, '/admin');
	}
};
