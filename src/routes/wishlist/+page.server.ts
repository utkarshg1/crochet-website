import type { PageServerLoad } from './$types';
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
