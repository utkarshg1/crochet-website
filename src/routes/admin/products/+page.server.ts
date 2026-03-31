import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const [{ data: products }, { data: categories }] = await Promise.all([
		supabase
			.from('products')
			.select('*, category:categories(name, slug)')
			.order('created_at', { ascending: false }),
		supabase.from('categories').select('*').order('display_order')
	]);

	return { products: products ?? [], categories: categories ?? [] };
};

export const actions: Actions = {
	create: async ({ request, locals: { supabase } }) => {
		const data = await request.formData();

		const slug = (data.get('title') as string)
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');

		const { error } = await supabase.from('products').insert({
			slug,
			title: data.get('title') as string,
			description: data.get('description') as string,
			price_paise: Math.round(parseFloat(data.get('price') as string) * 100),
			compare_at_price_paise: data.get('compare_price')
				? Math.round(parseFloat(data.get('compare_price') as string) * 100)
				: null,
			stock: parseInt(data.get('stock') as string, 10),
			category_id: (data.get('category_id') as string) || null,
			colors: (data.get('colors') as string)
				.split(',')
				.map((c) => c.trim())
				.filter(Boolean),
			materials: (data.get('materials') as string) || null,
			dimensions: (data.get('dimensions') as string) || null,
			care_instructions: (data.get('care_instructions') as string) || null,
			is_featured: data.get('is_featured') === 'on',
			is_new: data.get('is_new') === 'on',
			tags: (data.get('tags') as string)
				.split(',')
				.map((t) => t.trim())
				.filter(Boolean)
		});

		if (error) return fail(500, { error: error.message });
		return { success: true };
	},

	delete: async ({ request, locals: { supabase } }) => {
		const data = await request.formData();
		const id = data.get('id') as string;

		const { error } = await supabase.from('products').delete().eq('id', id);
		if (error) return fail(500, { error: error.message });
		return { deleted: true };
	},

	updateStock: async ({ request, locals: { supabase } }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		const stock = parseInt(data.get('stock') as string, 10);

		const { error } = await supabase.from('products').update({ stock }).eq('id', id);
		if (error) return fail(500, { error: error.message });
		return { updated: true };
	}
};
