import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase }, url }) => {
	const status = url.searchParams.get('status') ?? '';

	let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
	if (status) query = query.eq('status', status);

	const { data: orders } = await query;
	return { orders: orders ?? [], status };
};

export const actions: Actions = {
	updateStatus: async ({ request, locals: { supabase } }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		const status = data.get('status') as string;

		const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
		if (!validStatuses.includes(status)) return fail(400, { error: 'Invalid status' });

		const { error } = await supabase.from('orders').update({ status }).eq('id', id);
		if (error) return fail(500, { error: error.message });
		return { updated: true };
	}
};
