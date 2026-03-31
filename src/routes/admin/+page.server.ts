import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const [
		{ count: totalOrders },
		{ count: totalProducts },
		{ data: recentOrders },
		{ data: lowStock }
	] = await Promise.all([
		supabase.from('orders').select('*', { count: 'exact', head: true }),
		supabase.from('products').select('*', { count: 'exact', head: true }),
		supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
		supabase.from('products').select('id, title, stock').lt('stock', 5).order('stock')
	]);

	// Revenue: sum total_paise of processing/shipped/delivered orders
	const { data: revenueOrders } = await supabase
		.from('orders')
		.select('total_paise')
		.in('status', ['processing', 'shipped', 'delivered']);

	const totalRevenue = (revenueOrders ?? []).reduce(
		(s: number, o: { total_paise: number }) => s + o.total_paise,
		0
	);

	return {
		stats: {
			totalOrders: totalOrders ?? 0,
			totalProducts: totalProducts ?? 0,
			totalRevenue
		},
		recentOrders: recentOrders ?? [],
		lowStock: lowStock ?? []
	};
};
