import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const [
		{ count: totalOrders, error: ordersErr },
		{ count: totalProducts, error: productsErr },
		{ data: recentOrders },
		{ data: lowStock }
	] = await Promise.all([
		supabase.from('orders').select('*', { count: 'exact', head: true }),
		supabase.from('products').select('*', { count: 'exact', head: true }),
		supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
		supabase.from('products').select('id, title, stock').lt('stock', 5).order('stock')
	]);

	if (ordersErr) console.error('Dashboard orders count failed:', ordersErr.message);
	if (productsErr) console.error('Dashboard products count failed:', productsErr.message);

	// Revenue: sum total_paise of processing/shipped/delivered orders
	const { data: revenueOrders, error: revenueErr } = await supabase
		.from('orders')
		.select('total_paise')
		.in('status', ['processing', 'shipped', 'delivered']);

	if (revenueErr) console.error('Dashboard revenue query failed:', revenueErr.message);

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
