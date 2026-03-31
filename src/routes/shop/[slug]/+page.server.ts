import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase }, params }) => {
	const [{ data: product }, { data: related }] = await Promise.all([
		supabase
			.from('products')
			.select('*, category:categories(id, name, slug, description, image_url, display_order, created_at)')
			.eq('slug', params.slug)
			.single(),
		supabase
			.from('products')
			.select('*, category:categories(id, name, slug, description, image_url, display_order, created_at)')
			.neq('slug', params.slug)
			.limit(4)
	]);

	if (!product) {
		throw error(404, 'Product not found');
	}

	return {
		product,
		related: related ?? []
	};
};
