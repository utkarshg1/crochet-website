import { redirect } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/admin';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession, supabase }, url }) => {
	// Let the login page load without auth — it handles itself
	if (url.pathname === '/admin/login') {
		return { session: null, user: null, unauthorized: false };
	}

	const { session, user } = await safeGetSession();

	if (!user) {
		throw redirect(303, '/admin/login');
	}

	const adminCheck = await requireAdmin(supabase, user);
	if (!adminCheck.ok) {
		return { session, user, profile: null, unauthorized: true };
	}

	const { data: profile } = await supabase
		.from('profiles')
		.select('is_admin, full_name')
		.eq('id', user.id)
		.single();

	return { session, user, profile, unauthorized: false };
};
