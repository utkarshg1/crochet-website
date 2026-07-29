import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { WishlistItem } from '$lib/types';

export const load: PageServerLoad = async ({ locals: { safeGetSession, supabase } }) => {
	const { session, user } = await safeGetSession();

	let wishlistItems: WishlistItem[] = [];

	if (user) {
		const { data } = await supabase
			.from('wishlists')
			.select('*, product:products(*)')
			.eq('user_id', user.id)
			.order('created_at', { ascending: false });

		wishlistItems = (data ?? []) as unknown as WishlistItem[];
	}

	return { session, user, wishlistItems };
};

export const actions: Actions = {
	toggleWishlist: async ({ request, locals, url }) => {
		const formData = await request.formData();
		const { user } = await locals.safeGetSession();

		if (!user) {
			const redirectTo = (formData.get('redirectTo') as string) || url.pathname;
			throw redirect(303, `/account?redirectTo=${encodeURIComponent(redirectTo)}`);
		}

		const productId = formData.get('productId') as string;

		if (!productId) {
			return fail(400, { error: 'Product ID is required.' });
		}

		// Check current wishlist state
		const { data: existing } = await locals.supabase
			.from('wishlists')
			.select('id')
			.eq('user_id', user.id)
			.eq('product_id', productId)
			.single();

		if (existing) {
			await locals.supabase.from('wishlists').delete().eq('id', existing.id);
			return { success: true, productId, wishlisted: false };
		} else {
			await locals.supabase.from('wishlists').insert({ product_id: productId, user_id: user.id });
			return { success: true, productId, wishlisted: true };
		}
	}
};
