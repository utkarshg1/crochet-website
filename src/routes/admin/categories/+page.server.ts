import { fail } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/admin';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const { data: categories } = await supabase.from('categories').select('*').order('display_order');
	return { categories: categories ?? [] };
};

export const actions: Actions = {
	create: async ({ request, locals: { supabase, safeGetSession } }) => {
		// ── Verify admin ──────────────────────────────────────────────────
		const { user } = await safeGetSession();
		if (!user) return fail(401, { error: 'Unauthorized' });
		const adminCheck = await requireAdmin(supabase, user);
		if (!adminCheck.ok) return fail(adminCheck.status, { error: adminCheck.error });

		const data = await request.formData();
		const name = data.get('name') as string;
		const slug = name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');
		const { error } = await supabase.from('categories').insert({
			name,
			slug,
			description: (data.get('description') as string) || null,
			tagline: (data.get('tagline') as string) || null,
			image_url: (data.get('image_url') as string) || null,
			display_order: parseInt(data.get('display_order') as string, 10) || 0
		});
		if (error) return fail(500, { error: 'Failed to create category' });
		return { success: true };
	},
	update: async ({ request, locals: { supabase, safeGetSession } }) => {
		// ── Verify admin ──────────────────────────────────────────────────
		const { user } = await safeGetSession();
		if (!user) return fail(401, { error: 'Unauthorized' });
		const adminCheck = await requireAdmin(supabase, user);
		if (!adminCheck.ok) return fail(adminCheck.status, { error: adminCheck.error });

		const data = await request.formData();
		const id = data.get('id') as string;
		const name = data.get('name') as string;
		const slug = name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');
		const { error } = await supabase
			.from('categories')
			.update({
				name,
				slug,
				description: (data.get('description') as string) || null,
				tagline: (data.get('tagline') as string) || null,
				image_url: (data.get('image_url') as string) || null,
				display_order: parseInt(data.get('display_order') as string, 10) || 0
			})
			.eq('id', id);
		if (error) return fail(500, { error: 'Failed to update category' });
		return { updated: true };
	},
	delete: async ({ request, locals: { supabase, safeGetSession } }) => {
		// ── Verify admin ──────────────────────────────────────────────────
		const { user } = await safeGetSession();
		if (!user) return fail(401, { error: 'Unauthorized' });
		const adminCheck = await requireAdmin(supabase, user);
		if (!adminCheck.ok) return fail(adminCheck.status, { error: adminCheck.error });

		const data = await request.formData();
		const { error } = await supabase
			.from('categories')
			.delete()
			.eq('id', data.get('id') as string);
		if (error) return fail(500, { error: 'Failed to delete category' });
		return { deleted: true };
	}
};
