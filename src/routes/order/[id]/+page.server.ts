import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase }, params }) => {
	const { data: order, error: err } = await supabase
		.from('orders')
		.select('*')
		.eq('id', params.id)
		.single();

	if (err || !order) throw error(404, 'Order not found');

	return { order };
};
