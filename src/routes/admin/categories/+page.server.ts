import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const { data: categories } = await supabase.from('categories').select('*').order('display_order');
	return { categories: categories ?? [] };
};

export const actions: Actions = {
	create: async ({ request, locals: { supabase } }) => {
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
		if (error) return fail(500, { error: error.message });
		return { success: true };
	},
	update: async ({ request, locals: { supabase } }) => {
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
		if (error) return fail(500, { error: error.message });
		return { updated: true };
	},
	delete: async ({ request, locals: { supabase } }) => {
		const data = await request.formData();
		const { error } = await supabase
			.from('categories')
			.delete()
			.eq('id', data.get('id') as string);
		if (error) return fail(500, { error: error.message });
		return { deleted: true };
	}
};
