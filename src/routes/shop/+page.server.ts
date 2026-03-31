import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase }, url }) => {
	const category = url.searchParams.get('category');
	const sort = url.searchParams.get('sort') ?? 'newest';
	const q = url.searchParams.get('q') ?? '';

	// Build base query — always include category relation for chips/filters
	let query = supabase
		.from('products')
		.select('*, category:categories(id, name, slug, description, image_url, display_order, created_at)');

	// Category filter: filter by the slug of the joined category row
	// Using .eq on the foreign table column requires PostgREST dot-notation
	if (category) {
		query = query.eq('categories.slug', category);
	}

	// Full-text search on title (case-insensitive LIKE)
	if (q) {
		query = query.ilike('title', `%${q}%`);
	}

	// Sort
	switch (sort) {
		case 'price_asc':
			query = query.order('price_paise', { ascending: true });
			break;
		case 'price_desc':
			query = query.order('price_paise', { ascending: false });
			break;
		case 'featured':
			query = query.eq('is_featured', true);
			break;
		default:
			// newest — most recently created first
			query = query.order('created_at', { ascending: false });
	}

	const [{ data: products }, { data: categories }] = await Promise.all([
		query,
		supabase.from('categories').select('*').order('display_order')
	]);

	return {
		products: products ?? [],
		categories: categories ?? [],
		category,
		sort,
		q
	};
};
