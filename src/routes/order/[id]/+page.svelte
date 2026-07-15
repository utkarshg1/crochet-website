<script lang="ts">
	import { onMount } from 'svelte';
	import { cart } from '$lib/cart.svelte';
	import { formatPrice } from '$lib/types';
	import type { PageData } from './$types';
	import type { CartItem, ShippingAddress } from '$lib/types';

	let { data }: { data: PageData } = $props();

	const order = $derived(data.order);
	const items = $derived(order.items as unknown as CartItem[]);
	const address = $derived(order.shipping_address as unknown as ShippingAddress);

	const statusMap: Record<string, { label: string; color: string }> = {
		pending: { label: 'Pending', color: 'bg-mustard/40 text-tertiary' },
		processing: { label: 'Processing', color: 'bg-secondary-container text-secondary' },
		shipped: { label: 'Shipped', color: 'bg-blue-100 text-blue-700' },
		delivered: { label: 'Delivered', color: 'bg-secondary-container text-secondary' },
		cancelled: { label: 'Cancelled', color: 'bg-primary/10 text-primary' }
	};
	const statusInfo = $derived(statusMap[order.status] ?? statusMap.pending);

	onMount(() => {
		cart.clear();
	});
</script>

<svelte:head>
	<title>Order Confirmed — Krafted Loops Studio</title>
	<meta
		name="description"
		content="Your order has been placed successfully. Thank you for supporting handmade!"
	/>
</svelte:head>

<!-- ── Success hero ──────────────────────────────────────────────────────────── -->
<section class="bg-surface-low py-16 text-center">
	<div class="mx-auto max-w-xl px-4">
		<!-- Animated checkmark -->
		<div
			class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary/10"
		>
			<svg viewBox="0 0 52 52" class="h-10 w-10" fill="none">
				<circle cx="26" cy="26" r="25" stroke="#00675d" stroke-width="2" />
				<path
					d="M14 27 L22 35 L38 19"
					stroke="#00675d"
					stroke-width="3"
					stroke-linecap="round"
					stroke-linejoin="round"
					style="stroke-dasharray: 30; stroke-dashoffset: 30; animation: draw-check 0.6s 0.3s ease forwards;"
				/>
			</svg>
		</div>
		<h1 class="font-display text-4xl font-semibold text-primary">
			Thank You, {order.guest_name ?? 'Friend'}!
		</h1>
		<p class="mt-3 font-body text-base text-on-surface-muted">
			Your order has been placed successfully. We're already getting the yarn ready!
		</p>
		<span
			class="chip mt-4 inline-block bg-secondary-container px-5 py-2 font-body text-sm font-semibold text-on-secondary-container"
		>
			Order #{order.order_number}
		</span>
	</div>
</section>

<!-- ── Order details ──────────────────────────────────────────────────────────── -->
<div class="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
	<div class="grid gap-6 md:grid-cols-2">
		<!-- Order items -->
		<div class="shadow-ambient rounded-3xl bg-surface-card p-6 md:col-span-2">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="font-display text-xl font-semibold text-on-surface">Items Ordered</h2>
				<span
					class="chip bg-{statusInfo.color.split(
						' '
					)[0]} px-3 py-1 font-body text-xs font-semibold {statusInfo.color}"
				>
					{statusInfo.label}
				</span>
			</div>

			<ul class="space-y-4 divide-y-0">
				{#each items as item (item.product_id + (item.color ?? ''))}
					<li class="flex items-center gap-4 py-3">
						<div
							class="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-surface-high"
						>
							{#if item.image_url && !item.image_url.startsWith('/placeholder')}
								<img src={item.image_url} alt={item.image_alt} class="h-full w-full object-cover" />
							{:else}
								<span class="text-2xl" aria-hidden="true">🧶</span>
							{/if}
						</div>
						<div class="min-w-0 flex-1">
							<p class="font-body font-medium text-on-surface">{item.title}</p>
							{#if item.color}
								<p class="font-body text-xs text-on-surface-muted">Colour: {item.color}</p>
							{/if}
							<p class="font-body text-xs text-on-surface-muted">
								Qty: {item.qty} × {formatPrice(item.price_paise)}
							</p>
						</div>
						<p class="font-body font-semibold text-primary">
							{formatPrice(item.price_paise * item.qty)}
						</p>
					</li>
				{/each}
			</ul>

			<hr class="my-4 border-surface-high" />
			<div class="space-y-2">
				<div class="flex justify-between font-body text-sm text-on-surface">
					<span>Subtotal</span><span>{formatPrice(order.subtotal_paise)}</span>
				</div>
				<div class="flex justify-between font-body text-sm text-on-surface">
					<span>Shipping</span>
					<span class={order.shipping_paise === 0 ? 'font-semibold text-secondary' : ''}>
						{order.shipping_paise === 0 ? 'FREE' : formatPrice(order.shipping_paise)}
					</span>
				</div>
				<hr class="border-surface-high" />
				<div class="flex justify-between">
					<span class="font-body font-semibold text-on-surface">Total</span>
					<span class="font-display text-xl font-semibold text-on-surface"
						>{formatPrice(order.total_paise)}</span
					>
				</div>
			</div>
		</div>

		<!-- Shipping address -->
		<div class="shadow-ambient rounded-3xl bg-surface-card p-6">
			<h2 class="mb-3 font-display text-lg font-semibold text-on-surface">Shipping To</h2>
			<address class="font-body text-sm leading-relaxed text-on-surface-muted not-italic">
				<p class="font-semibold text-on-surface">{address.full_name}</p>
				<p>{address.address_line1}</p>
				{#if address.address_line2}<p>{address.address_line2}</p>{/if}
				<p>{address.city}, {address.state} — {address.pincode}</p>
				<p class="mt-1">📱 +91{address.phone}</p>
			</address>
		</div>

		<!-- Dispatch note -->
		<div class="shadow-ambient rounded-3xl bg-secondary-container p-6">
			<h2 class="mb-2 font-display text-lg font-semibold text-on-secondary-container">
				What's Next?
			</h2>
			<p class="font-body text-sm leading-relaxed text-on-secondary-container/80">
				🧶 Your item is being handcrafted with love by Kalyani.<br />
				Allow <strong>3–5 business days</strong> for dispatch. You'll receive a shipping notification
				via email.
			</p>
			{#if order.guest_email}
				<p class="mt-3 font-body text-xs text-on-secondary-container/70">
					Confirmation sent to <strong>{order.guest_email}</strong>
				</p>
			{/if}
		</div>
	</div>

	<!-- CTAs -->
	<div class="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
		<a
			href="/shop"
			class="shadow-ambient rounded-full bg-gradient-to-r from-primary to-primary-dim px-8 py-3 font-body font-semibold text-white transition-all hover:brightness-110 active:scale-95"
		>
			Continue Shopping
		</a>
		<a
			href="/account"
			class="rounded-full bg-surface-high px-8 py-3 font-body font-medium text-on-surface transition-colors hover:bg-surface-low"
		>
			View My Orders
		</a>
	</div>

	<!-- Share section -->
	<div class="mt-10 rounded-3xl bg-surface-low p-6 text-center">
		<p class="font-display text-lg text-on-surface">Loved your experience?</p>
		<p class="mt-1 font-body text-sm text-on-surface-muted">
			Share the love with friends who appreciate handmade!
		</p>
		<div class="mt-4 flex justify-center gap-3">
			<a
				href="https://wa.me/?text=Just%20ordered%20from%20Krafted%20Loops%20Studio%20-%20beautiful%20handmade%20crochet!%20Check%20them%20out!"
				target="_blank"
				rel="noopener"
				class="shadow-ambient hover:shadow-ambient-lg rounded-full bg-surface-card px-4 py-2 font-body text-sm font-medium text-on-surface transition-all"
			>
				📲 WhatsApp
			</a>
			<a
				href="https://www.instagram.com/"
				target="_blank"
				rel="noopener"
				class="shadow-ambient hover:shadow-ambient-lg rounded-full bg-surface-card px-4 py-2 font-body text-sm font-medium text-on-surface transition-all"
			>
				📸 Instagram
			</a>
		</div>
	</div>
</div>

<style>
	@keyframes draw-check {
		to {
			stroke-dashoffset: 0;
		}
	}
</style>
