import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession, supabase }, url }) => {
	// Let the login page load without auth — it handles itself
	if (url.pathname === '/admin/login') {
		return { session: null, user: null };
	}

	const { session, user } = await safeGetSession();

	if (!user) {
		throw redirect(303, '/admin/login');
	}

	const { data: profile } = await supabase
		.from('profiles')
		.select('is_admin')
		.eq('id', user.id)
		.single();

	if (!profile?.is_admin) {
		throw redirect(303, '/');
	}

	return { session, user };
};
