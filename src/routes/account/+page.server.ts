import { redirect, fail } from '@sveltejs/kit';
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
	signIn: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = String(formData.get('email') ?? '')
			.trim()
			.toLowerCase();
		const password = String(formData.get('password') ?? '');

		if (!email.includes('@')) return fail(400, { error: 'Enter a valid email', mode: 'login' });
		if (password.length < 8)
			return fail(400, { error: 'Password must be at least 8 characters', mode: 'login' });

		const { error } = await supabase.auth.signInWithPassword({ email, password });
		if (error) return fail(400, { error: error.message, mode: 'login' });

		throw redirect(303, '/account');
	},

	signUp: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = String(formData.get('email') ?? '')
			.trim()
			.toLowerCase();
		const password = String(formData.get('password') ?? '');
		const fullName = String(formData.get('full_name') ?? '').trim();
		const phone = String(formData.get('phone') ?? '').trim();

		if (!fullName) return fail(400, { error: 'Enter your full name', mode: 'register' });
		if (!email.includes('@')) return fail(400, { error: 'Enter a valid email', mode: 'register' });
		if (password.length < 8)
			return fail(400, { error: 'Password must be at least 8 characters', mode: 'register' });

		const phoneDigits = phone.replace(/\D/g, '').replace(/^0+/, '');
		if (phoneDigits.length !== 10)
			return fail(400, { error: 'Enter a valid 10-digit phone number', mode: 'register' });

		const { error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: { full_name: fullName, phone: `+91${phoneDigits}` },
				emailRedirectTo: `${new URL(request.url).origin}/auth/callback`
			}
		});

		if (error) return fail(400, { error: error.message, mode: 'register' });

		return { registered: true, email };
	},

	resetPassword: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = String(formData.get('email') ?? '')
			.trim()
			.toLowerCase();

		if (!email.includes('@')) return fail(400, { error: 'Enter a valid email', mode: 'reset' });

		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${new URL(request.url).origin}/auth/reset-password`
		});

		if (error) return fail(400, { error: error.message, mode: 'reset' });

		return { resetSent: true, email };
	},

	checkEmail: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = String(formData.get('email') ?? '')
			.trim()
			.toLowerCase();

		const { data: exists } = await supabase.rpc('check_email_exists', { check_email: email });
		return { exists: exists ?? true };
	},

	signOut: async ({ locals: { supabase } }) => {
		await supabase.auth.signOut();
		throw redirect(303, '/');
	}
};
