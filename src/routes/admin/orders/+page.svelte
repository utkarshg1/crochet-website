<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { formatPrice } from '$lib/types';
	import type { PageData } from './$types';
	import type { CartItem, ShippingAddress } from '$lib/types';

	let { data }: { data: PageData } = $props();

	const statuses = ['', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];
	const statusLabels: Record<string, string> = {
		'': 'All',
		pending: 'Pending',
		processing: 'Processing',
		shipped: 'Shipped',
		delivered: 'Delivered',
		cancelled: 'Cancelled'
	};
	const statusColors: Record<string, string> = {
		pending: 'bg-mustard/40 text-tertiary',
		processing: 'bg-secondary-container text-secondary',
		shipped: 'bg-blue-100 text-blue-700',
		delivered: 'bg-green-100 text-green-700',
		cancelled: 'bg-primary/10 text-primary'
	};

	let expandedOrder = $state<string | null>(null);
</script>

<svelte:head><title>Orders — Admin</title></svelte:head>

<div class="p-8">
	<h1 class="mb-6 font-display text-3xl font-semibold text-on-surface">Orders</h1>

	<!-- Status filter tabs -->
	<div class="mb-6 flex flex-wrap gap-2">
		{#each statuses as s}
			<a
				href="/admin/orders{s ? `?status=${s}` : ''}"
				class="chip px-4 py-1.5 font-body text-sm font-medium transition-colors
					{data.status === s || (s === '' && !data.status)
					? 'bg-primary text-white'
					: 'bg-surface-card text-on-surface-muted shadow-ambient hover:bg-surface-low'}"
			>
				{statusLabels[s]}
			</a>
		{/each}
	</div>

	<!-- Orders -->
	{#if data.orders.length === 0}
		<div class="rounded-3xl bg-surface-card p-10 text-center shadow-ambient">
			<p class="font-body text-sm text-on-surface-muted">No orders found.</p>
		</div>
	{:else}
		<div class="space-y-4">
			{#each data.orders as order}
				{@const items = order.items as unknown as CartItem[]}
				{@const address = order.shipping_address as unknown as ShippingAddress}
				<div class="rounded-3xl bg-surface-card shadow-ambient overflow-hidden">
					<!-- Order header row -->
					<div class="flex items-center gap-4 p-5">
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-3 flex-wrap">
								<p class="font-body font-semibold text-on-surface">#{order.order_number}</p>
								<span class="chip px-2.5 py-0.5 font-body text-xs font-semibold {statusColors[order.status] ?? ''}">
									{order.status}
								</span>
							</div>
							<p class="mt-0.5 font-body text-xs text-on-surface-muted">
								{order.guest_name ?? 'Customer'} · {order.guest_email ?? ''} ·
								{new Date(order.created_at!).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
							</p>
						</div>
						<div class="text-right flex-shrink-0">
							<p class="font-display text-lg font-semibold text-on-surface">{formatPrice(order.total_paise)}</p>
							<p class="font-body text-xs text-on-surface-muted">{items.length} item{items.length !== 1 ? 's' : ''}</p>
						</div>
						<!-- Update status -->
						<form method="POST" action="?/updateStatus" use:enhance class="flex-shrink-0">
							<input type="hidden" name="id" value={order.id} />
							<select
								name="status"
								onchange={(e) => (e.currentTarget.form as HTMLFormElement)?.requestSubmit()}
								class="rounded-xl border border-on-surface/10 bg-surface-high px-3 py-1.5 font-body text-xs text-on-surface focus:outline-none focus:border-primary/50"
							>
								{#each ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as s}
									<option value={s} selected={order.status === s}>{statusLabels[s]}</option>
								{/each}
							</select>
						</form>
						<!-- Expand toggle -->
						<button
							onclick={() => expandedOrder = expandedOrder === order.id ? null : order.id}
							class="rounded-xl bg-surface-high p-2 text-on-surface-muted hover:bg-surface-low"
							aria-label="Toggle order details"
						>
							<svg class="h-4 w-4 transition-transform {expandedOrder === order.id ? 'rotate-180' : ''}" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/>
							</svg>
						</button>
					</div>

					<!-- Expanded details -->
					{#if expandedOrder === order.id}
						<div class="border-t border-surface-low px-5 py-4 bg-surface">
							<div class="grid gap-4 sm:grid-cols-2">
								<div>
									<p class="font-body text-xs font-semibold uppercase tracking-wider text-on-surface-muted mb-2">Items</p>
									<ul class="space-y-1.5">
										{#each items as item}
											<li class="font-body text-sm text-on-surface">
												{item.title}{item.color ? ` (${item.color})` : ''} × {item.qty}
												<span class="text-on-surface-muted">— {formatPrice(item.price_paise * item.qty)}</span>
											</li>
										{/each}
									</ul>
								</div>
								<div>
									<p class="font-body text-xs font-semibold uppercase tracking-wider text-on-surface-muted mb-2">Ship To</p>
									<address class="not-italic font-body text-sm text-on-surface leading-relaxed">
										{address.full_name}<br />
										{address.address_line1}{address.address_line2 ? `, ${address.address_line2}` : ''}<br />
										{address.city}, {address.state} {address.pincode}
									</address>
									{#if order.razorpay_payment_id}
										<p class="mt-2 font-body text-xs text-on-surface-muted">
											Payment ID: <code class="font-mono text-secondary">{order.razorpay_payment_id}</code>
										</p>
									{/if}
								</div>
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
