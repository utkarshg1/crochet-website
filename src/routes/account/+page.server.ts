import { redirect } from '@sveltejs/kit';
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
	signOut: async ({ locals: { supabase } }) => {
		await supabase.auth.signOut();
		throw redirect(303, '/');
	}
};
