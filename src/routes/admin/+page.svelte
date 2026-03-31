<script lang="ts">
	import { formatPrice } from '$lib/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const statusColors: Record<string, string> = {
		pending: 'bg-mustard/40 text-tertiary',
		processing: 'bg-secondary-container text-secondary',
		shipped: 'bg-blue-100 text-blue-700',
		delivered: 'bg-green-100 text-green-700',
		cancelled: 'bg-primary/10 text-primary'
	};
</script>

<svelte:head><title>Dashboard — Admin</title></svelte:head>

<div class="p-8">
	<h1 class="font-display text-3xl font-semibold text-on-surface">Dashboard</h1>
	<p class="mt-1 font-body text-sm text-on-surface-muted">Welcome back, Kalyani!</p>

	<!-- Stats -->
	<div class="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
		<div class="rounded-3xl bg-surface-card p-6 shadow-ambient">
			<p class="font-body text-sm text-on-surface-muted">Total Orders</p>
			<p class="mt-2 font-display text-4xl font-semibold text-on-surface">{data.stats.totalOrders}</p>
		</div>
		<div class="rounded-3xl bg-surface-card p-6 shadow-ambient">
			<p class="font-body text-sm text-on-surface-muted">Total Revenue</p>
			<p class="mt-2 font-display text-4xl font-semibold text-primary">{formatPrice(data.stats.totalRevenue)}</p>
		</div>
		<div class="rounded-3xl bg-surface-card p-6 shadow-ambient">
			<p class="font-body text-sm text-on-surface-muted">Products Listed</p>
			<p class="mt-2 font-display text-4xl font-semibold text-on-surface">{data.stats.totalProducts}</p>
			{#if data.lowStock.length > 0}
				<p class="mt-1 font-body text-xs text-primary">{data.lowStock.length} low stock ⚠️</p>
			{/if}
		</div>
	</div>

	<div class="mt-8 grid gap-6 lg:grid-cols-2">
		<!-- Recent orders -->
		<div class="rounded-3xl bg-surface-card p-6 shadow-ambient">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="font-display text-lg font-semibold text-on-surface">Recent Orders</h2>
				<a href="/admin/orders" class="font-body text-sm text-secondary hover:underline">View all</a>
			</div>
			{#if data.recentOrders.length === 0}
				<p class="font-body text-sm text-on-surface-muted">No orders yet.</p>
			{:else}
				<ul class="space-y-3">
					{#each data.recentOrders as order}
						<li class="flex items-center justify-between gap-3">
							<div>
								<p class="font-body text-sm font-medium text-on-surface">#{order.order_number}</p>
								<p class="font-body text-xs text-on-surface-muted">{order.guest_name ?? 'Customer'}</p>
							</div>
							<div class="flex items-center gap-2">
								<span class="chip px-2.5 py-0.5 font-body text-xs font-semibold {statusColors[order.status] ?? ''}">
									{order.status}
								</span>
								<span class="font-body text-sm font-semibold text-on-surface">{formatPrice(order.total_paise)}</span>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<!-- Low stock -->
		<div class="rounded-3xl bg-surface-card p-6 shadow-ambient">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="font-display text-lg font-semibold text-on-surface">Low Stock Alert</h2>
				<a href="/admin/products" class="font-body text-sm text-secondary hover:underline">Manage</a>
			</div>
			{#if data.lowStock.length === 0}
				<p class="font-body text-sm text-secondary">All products well stocked ✓</p>
			{:else}
				<ul class="space-y-3">
					{#each data.lowStock as product}
						<li class="flex items-center justify-between">
							<p class="font-body text-sm text-on-surface">{product.title}</p>
							<span class="rounded-full px-3 py-0.5 font-body text-xs font-semibold {product.stock === 0 ? 'bg-primary/10 text-primary' : 'bg-mustard/40 text-tertiary'}">
								{product.stock === 0 ? 'Out of stock' : `${product.stock} left`}
							</span>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
</div>
