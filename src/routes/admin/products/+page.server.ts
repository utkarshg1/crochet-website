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
	create: async ({ request, locals: { supabase, safeGetSession } }) => {
		// ── Verify admin ──────────────────────────────────────────────────
		const { user } = await safeGetSession();
		if (!user) return fail(401, { error: 'Unauthorized' });
		const { data: profile } = await supabase
			.from('profiles')
			.select('is_admin')
			.eq('id', user.id)
			.single();
		if (!profile?.is_admin) return fail(403, { error: 'Forbidden' });

		const data = await request.formData();

		const slug = (data.get('title') as string)
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');

		const pricePaise = Math.round(parseFloat(data.get('price') as string) * 100);
		if (!Number.isFinite(pricePaise) || pricePaise <= 0) {
			return fail(400, { error: 'Invalid price' });
		}

		const stock = parseInt(data.get('stock') as string, 10);
		if (!Number.isFinite(stock) || stock < 0) {
			return fail(400, { error: 'Invalid stock' });
		}

		const comparePriceRaw = data.get('compare_price') as string;
		const comparePricePaise = comparePriceRaw
			? Math.round(parseFloat(comparePriceRaw) * 100)
			: null;
		if (comparePricePaise !== null && !Number.isFinite(comparePricePaise)) {
			return fail(400, { error: 'Invalid compare price' });
		}

		const { error } = await supabase.from('products').insert({
			slug,
			title: data.get('title') as string,
			description: data.get('description') as string,
			price_paise: pricePaise,
			compare_at_price_paise: comparePricePaise,
			stock,
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
				.filter(Boolean),
			images: JSON.parse((data.get('images') as string) || '[]')
		});

		if (error) return fail(500, { error: 'Failed to create product' });
		return { success: true };
	},

	update: async ({ request, locals: { supabase, safeGetSession } }) => {
		// ── Verify admin ──────────────────────────────────────────────────
		const { user } = await safeGetSession();
		if (!user) return fail(401, { error: 'Unauthorized' });
		const { data: profile } = await supabase
			.from('profiles')
			.select('is_admin')
			.eq('id', user.id)
			.single();
		if (!profile?.is_admin) return fail(403, { error: 'Forbidden' });

		const data = await request.formData();
		const id = data.get('id') as string;

		const pricePaise = Math.round(parseFloat(data.get('price') as string) * 100);
		if (!Number.isFinite(pricePaise) || pricePaise <= 0) {
			return fail(400, { error: 'Invalid price' });
		}

		const stock = parseInt(data.get('stock') as string, 10);
		if (!Number.isFinite(stock) || stock < 0) {
			return fail(400, { error: 'Invalid stock' });
		}

		const comparePriceRaw = data.get('compare_price') as string;
		const comparePricePaise = comparePriceRaw
			? Math.round(parseFloat(comparePriceRaw) * 100)
			: null;
		if (comparePricePaise !== null && !Number.isFinite(comparePricePaise)) {
			return fail(400, { error: 'Invalid compare price' });
		}

		const { error } = await supabase
			.from('products')
			.update({
				title: data.get('title') as string,
				description: data.get('description') as string,
				price_paise: pricePaise,
				compare_at_price_paise: comparePricePaise,
				stock,
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
					.filter(Boolean),
				images: JSON.parse((data.get('images') as string) || '[]')
			})
			.eq('id', id);

		if (error) return fail(500, { error: 'Failed to update product' });
		return { updated: true };
	},

	delete: async ({ request, locals: { supabase, safeGetSession } }) => {
		// ── Verify admin ──────────────────────────────────────────────────
		const { user } = await safeGetSession();
		if (!user) return fail(401, { error: 'Unauthorized' });
		const { data: profile } = await supabase
			.from('profiles')
			.select('is_admin')
			.eq('id', user.id)
			.single();
		if (!profile?.is_admin) return fail(403, { error: 'Forbidden' });

		const data = await request.formData();
		const id = data.get('id') as string;

		const { error } = await supabase.from('products').delete().eq('id', id);
		if (error) return fail(500, { error: 'Failed to delete product' });
		return { deleted: true };
	},

	updateStock: async ({ request, locals: { supabase, safeGetSession } }) => {
		// ── Verify admin ──────────────────────────────────────────────────
		const { user } = await safeGetSession();
		if (!user) return fail(401, { error: 'Unauthorized' });
		const { data: profile } = await supabase
			.from('profiles')
			.select('is_admin')
			.eq('id', user.id)
			.single();
		if (!profile?.is_admin) return fail(403, { error: 'Forbidden' });

		const data = await request.formData();
		const id = data.get('id') as string;
		const stock = parseInt(data.get('stock') as string, 10);

		if (!Number.isFinite(stock) || stock < 0) {
			return fail(400, { error: 'Invalid stock' });
		}

		const { error } = await supabase.from('products').update({ stock }).eq('id', id);
		if (error) return fail(500, { error: 'Failed to update stock' });
		return { updated: true };
	}
};
