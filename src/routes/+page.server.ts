import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import type { Product, Category } from '$lib/types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const [{ data: categories }, { data: featuredProducts }] = await Promise.all([
		supabase.from('categories').select('*').order('display_order'),
		supabase
			.from('products')
			.select('*, category:categories(name, slug)')
			.eq('is_featured', true)
			.order('created_at', { ascending: false })
			.limit(8)
	]);

	return {
		categories: (categories ?? []) as unknown as Category[],
		featuredProducts: (featuredProducts ?? []) as unknown as Product[]
	};
};

export const actions: Actions = {
	subscribe: async ({ request, locals: { supabase } }) => {
		const data = await request.formData();
		const email = (data.get('email') as string)?.trim().toLowerCase();

		// Strict email validation
		const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
		if (!email || !emailRegex.test(email) || email.length > 254) {
			return fail(400, { error: 'Valid email required' });
		}

		// newsletter_subscribers is not yet in the generated database.types.ts snapshot,
		// so we cast through `any` until types are regenerated from Supabase.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		await (supabase as any)
			.from('newsletter_subscribers')
			.upsert({ email }, { onConflict: 'email' });

		return { success: true };
	}
};
