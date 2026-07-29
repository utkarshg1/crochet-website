import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { safeGetSession, supabase } }) => {
	const { session, user } = await safeGetSession();

	let orders = null;
	let profile = null;
	let addresses = null;

	if (user) {
		const [{ data: o }, { data: p }, { data: a }] = await Promise.all([
			supabase
				.from('orders')
				.select('*')
				.eq('user_id', user.id)
				.order('created_at', { ascending: false }),
			supabase.from('profiles').select('*').eq('id', user.id).single(),
			supabase
				.from('addresses')
				.select('*')
				.eq('user_id', user.id)
				.order('created_at', { ascending: false })
		]);
		orders = o ?? [];
		profile = p;
		addresses = a ?? [];
	}

	return { session, user, orders, profile, addresses };
};

export const actions: Actions = {
	resendConfirmation: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = String(formData.get('email') ?? '')
			.trim()
			.toLowerCase();

		if (!email.includes('@')) return fail(400, { error: 'Enter a valid email' });

		const { error } = await supabase.auth.resend({
			type: 'signup',
			email,
			options: {
				emailRedirectTo: `${new URL(request.url).origin}/auth/callback`
			}
		});

		if (error) return fail(400, { error: error.message });
		return { resendSuccess: true, email };
	},
	signIn: async ({ request, locals: { supabase }, url }) => {
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

		const redirectTo = url.searchParams.get('redirectTo') || '/account';
		throw redirect(303, redirectTo);
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

		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: { full_name: fullName, phone: `+91${phoneDigits}` },
				emailRedirectTo: `${new URL(request.url).origin}/auth/callback`
			}
		});

		if (error) return fail(400, { error: error.message, mode: 'register' });

		// data.user is null when the email already exists (Supabase returns no error)
		if (!data.user) {
			return fail(400, {
				error: 'An account with this email already exists. Please sign in.',
				mode: 'register'
			});
		}

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

	saveAddress: async ({ request, locals: { supabase, safeGetSession } }) => {
		const { user } = await safeGetSession();
		if (!user) return fail(401, { error: 'Unauthorized' });

		const data = await request.formData();
		const addressId = data.get('address_id') as string;
		const isDefault = data.get('is_default') === 'true';
		const rawPhone = (data.get('phone') as string).replace(/\D/g, '').replace(/^0+/, '');
		const phone = rawPhone.length === 12 && rawPhone.startsWith('91') ? rawPhone.slice(2) : rawPhone;
		if (phone.length !== 10) return fail(400, { error: 'Enter a valid 10-digit phone number' });

		const address = {
			user_id: user.id,
			full_name: data.get('full_name') as string,
			phone,
			address_line1: data.get('address_line1') as string,
			address_line2: (data.get('address_line2') as string) || '',
			city: data.get('city') as string,
			state: data.get('state') as string,
			pincode: data.get('pincode') as string,
			is_default: isDefault
		};

		if (
			!address.full_name ||
			!address.address_line1 ||
			!address.city ||
			!address.state ||
			!address.pincode
		) {
			return fail(400, { error: 'All required fields must be filled' });
		}

		if (isDefault) {
			await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
		}

		let saved;
		if (addressId) {
			const { data: updated } = await supabase
				.from('addresses')
				.update(address)
				.eq('id', addressId)
				.eq('user_id', user.id)
				.select()
				.single();
			saved = updated;
		} else {
			const { data: inserted } = await supabase.from('addresses').insert(address).select().single();
			saved = inserted;
		}

		if (!saved) return fail(500, { error: 'Could not save address' });
		return { address: saved };
	},

	deleteAddress: async ({ request, locals: { supabase, safeGetSession } }) => {
		const { user } = await safeGetSession();
		if (!user) return fail(401, { error: 'Unauthorized' });

		const data = await request.formData();
		const addressId = data.get('address_id') as string;
		if (!addressId) return fail(400, { error: 'Missing address ID' });

		const { error } = await supabase
			.from('addresses')
			.delete()
			.eq('id', addressId)
			.eq('user_id', user.id);
		if (error) return fail(500, { error: 'Could not delete address' });
		return { deleted: true };
	},

	signOut: async ({ locals: { supabase } }) => {
		await supabase.auth.signOut();
		throw redirect(303, '/');
	}
};
