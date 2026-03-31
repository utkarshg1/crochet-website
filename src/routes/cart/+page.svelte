<script lang="ts">
	import { onMount } from 'svelte';
	import { cart } from '$lib/cart.svelte';
	import {
		formatPrice,
		FREE_SHIPPING_THRESHOLD_PAISE,
		SHIPPING_PAISE,
		calculateShipping
	} from '$lib/types';

	// ── Coupon state ──────────────────────────────────────────────────────────
	let couponCode = $state('');
	let couponStatus = $state<'idle' | 'success' | 'error'>('idle');
	let couponMessage = $state('');

	// ── Derived cart values ───────────────────────────────────────────────────
	const subtotal = $derived(cart.subtotal);
	const shipping = $derived(calculateShipping(subtotal));
	const total = $derived(subtotal + shipping);
	const isFreeShipping = $derived(subtotal >= FREE_SHIPPING_THRESHOLD_PAISE);
	const remaining = $derived(
		isFreeShipping ? 0 : FREE_SHIPPING_THRESHOLD_PAISE - subtotal
	);
	// Progress toward free shipping (0–100)
	const freeShippingPercent = $derived(
		Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD_PAISE) * 100))
	);

	onMount(() => {
		cart.init();
	});

	// ── Coupon handler ────────────────────────────────────────────────────────
	function applyCoupon() {
		if (!couponCode.trim()) {
			couponStatus = 'error';
			couponMessage = 'Please enter a coupon code.';
			return;
		}
		// Placeholder — wire to real discount logic later
		couponStatus = 'error';
		couponMessage = `"${couponCode.trim()}" is not a valid coupon code.`;
	}

	function handleCouponKey(e: KeyboardEvent) {
		if (e.key === 'Enter') applyCoupon();
	}
</script>

<svelte:head>
	<title>Your Bag — Krafted Loops Studio</title>
	<meta
		name="description"
		content="Review your bag and proceed to checkout at Krafted Loops Studio."
	/>
</svelte:head>

<!-- ── Page header ──────────────────────────────────────────────────────────── -->
<section class="bg-surface-low py-12">
	<div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
		<h1 class="font-display text-4xl font-semibold text-on-surface">Your Bag</h1>
		<p class="mt-1 font-body text-base text-on-surface-muted">
			{#if cart.count === 0}
				Nothing here yet — start exploring!
			{:else}
				{cart.count}
				{cart.count === 1 ? 'item' : 'items'} waiting for you
			{/if}
		</p>
	</div>
</section>

<!-- ── Main layout ───────────────────────────────────────────────────────────── -->
<div class="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
	<div class="flex flex-col gap-8 lg:flex-row lg:items-start">

		<!-- ═══ Cart items column (60%) ═══════════════════════════════════════ -->
		<div class="flex-1 lg:basis-[60%]">
			<div class="bg-surface-card rounded-3xl shadow-ambient p-6">
				<h2 class="mb-6 font-body text-lg font-semibold text-on-surface">
					Your Bag
					{#if cart.count > 0}
						<span class="text-on-surface-muted">({cart.count} {cart.count === 1 ? 'item' : 'items'})</span>
					{/if}
				</h2>

				{#if cart.items.length === 0}
					<!-- ── Empty state ──────────────────────────────────────────────────── -->
					<div class="flex flex-col items-center py-16 text-center">
						<span class="mb-4 text-6xl" aria-hidden="true">🧶</span>
						<p class="font-display text-2xl text-on-surface">Your bag is empty</p>
						<p class="mt-2 font-body text-sm text-on-surface-muted">
							Discover something beautiful for your home or loved ones.
						</p>
						<a
							href="/shop"
							class="mt-6 inline-block rounded-full bg-primary px-8 py-3 font-body font-semibold text-white shadow-ambient transition-all duration-200 hover:bg-primary-dim active:scale-95"
						>
							Start Shopping
						</a>
					</div>
				{:else}
					<!-- ── Item list ─────────────────────────────────────────────────────── -->
					<ul class="divide-y-0 space-y-0" aria-label="Cart items">
						{#each cart.items as item, i (item.product_id + (item.color ?? ''))}
							<li class="flex items-start gap-4 py-6 {i !== 0 ? 'border-t border-surface-high' : ''}">
								<!-- Thumbnail -->
								{#if item.image_url}
									<img
										src={item.image_url}
										alt={item.image_alt || item.title}
										class="h-20 w-20 flex-shrink-0 rounded-2xl object-cover bg-surface-high"
									/>
								{:else}
									<!-- Colored placeholder when no image -->
									<div
										class="h-20 w-20 flex-shrink-0 rounded-2xl bg-surface-high flex items-center justify-center"
										aria-hidden="true"
									>
										<span class="text-2xl">🧶</span>
									</div>
								{/if}

								<!-- Item details -->
								<div class="flex min-w-0 flex-1 flex-col gap-1">
									<a
										href="/shop/{item.slug}"
										class="font-display text-base font-medium text-on-surface leading-snug hover:text-primary transition-colors line-clamp-2"
									>
										{item.title}
									</a>

									<!-- Color chip -->
									{#if item.color}
										<span
											class="chip inline-flex w-fit items-center bg-secondary-container text-on-secondary-container px-2 py-0.5 text-xs font-body font-medium"
										>
											{item.color}
										</span>
									{/if}

									<!-- Unit price -->
									<p class="font-body text-sm text-on-surface-muted">
										{formatPrice(item.price_paise)} each
									</p>

									<!-- Qty + remove row -->
									<div class="mt-2 flex items-center justify-between gap-4">
										<!-- Quantity stepper -->
										<div
											class="inline-flex items-center gap-1 rounded-full bg-surface-high px-1 py-1"
											role="group"
											aria-label="Quantity for {item.title}"
										>
											<button
												onclick={() => cart.update(item.product_id, item.color, item.qty - 1)}
												class="flex h-7 w-7 items-center justify-center rounded-full font-body text-base font-semibold text-on-surface transition-colors hover:bg-surface-low disabled:opacity-40"
												aria-label="Decrease quantity"
												disabled={item.qty <= 1}
											>
												−
											</button>
											<span
												class="min-w-[1.75rem] text-center font-body text-sm font-semibold text-on-surface"
												aria-live="polite"
												aria-label="Quantity: {item.qty}"
											>
												{item.qty}
											</span>
											<button
												onclick={() => cart.update(item.product_id, item.color, item.qty + 1)}
												class="flex h-7 w-7 items-center justify-center rounded-full font-body text-base font-semibold text-on-surface transition-colors hover:bg-surface-low disabled:opacity-40"
												aria-label="Increase quantity"
												disabled={item.qty >= item.stock}
											>
												+
											</button>
										</div>

										<!-- Line total + remove -->
										<div class="flex items-center gap-3">
											<span class="font-body text-sm font-semibold text-primary">
												{formatPrice(item.price_paise * item.qty)}
											</span>
											<button
												onclick={() => cart.remove(item.product_id, item.color)}
												class="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-muted transition-colors hover:bg-primary/10 hover:text-primary"
												aria-label="Remove {item.title} from bag"
											>
												<!-- Trash icon -->
												<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 20 20"
													fill="currentColor"
													class="h-4 w-4"
													aria-hidden="true"
												>
													<path
														fill-rule="evenodd"
														d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
														clip-rule="evenodd"
													/>
												</svg>
											</button>
										</div>
									</div>
								</div>
							</li>
						{/each}
					</ul>

					<!-- ── Coupon code row ──────────────────────────────────────────────── -->
					<div class="mt-6 border-t border-surface-high pt-6">
						<label for="coupon-input" class="mb-2 block font-body text-sm font-medium text-on-surface">
							Have a coupon?
						</label>
						<div class="flex gap-2">
							<input
								id="coupon-input"
								type="text"
								bind:value={couponCode}
								onkeydown={handleCouponKey}
								placeholder="Enter code"
								class="flex-1 rounded-xl border border-on-surface/10 bg-surface-high px-4 py-2 font-body text-sm text-on-surface placeholder:text-on-surface-muted focus:border-primary/50 focus:outline-none"
								aria-describedby={couponStatus !== 'idle' ? 'coupon-message' : undefined}
							/>
							<button
								onclick={applyCoupon}
								class="rounded-xl bg-primary px-5 py-2 font-body text-sm font-semibold text-white transition-colors hover:bg-primary-dim active:scale-95"
							>
								Apply
							</button>
						</div>
						{#if couponStatus !== 'idle'}
							<p
								id="coupon-message"
								class="mt-2 font-body text-xs {couponStatus === 'success'
									? 'text-secondary'
									: 'text-primary'}"
								role="alert"
							>
								{couponMessage}
							</p>
						{/if}
					</div>
				{/if}
			</div>
		</div>

		<!-- ═══ Order summary column (40%) ════════════════════════════════════ -->
		{#if cart.items.length > 0}
			<aside class="lg:basis-[40%]">
				<div class="bg-surface-card rounded-3xl shadow-ambient p-6 lg:sticky lg:top-24">
					<h2 class="font-display text-xl font-semibold text-on-surface">Order Summary</h2>

					<div class="mt-5 space-y-3">
						<!-- Subtotal -->
						<div class="flex items-center justify-between font-body text-sm text-on-surface">
							<span>Subtotal</span>
							<span class="font-medium">{formatPrice(subtotal)}</span>
						</div>

						<!-- Shipping -->
						<div class="flex items-center justify-between font-body text-sm text-on-surface">
							<span>Shipping</span>
							{#if isFreeShipping}
								<span class="font-semibold text-secondary">FREE 🎉</span>
							{:else}
								<span class="font-medium">{formatPrice(SHIPPING_PAISE)}</span>
							{/if}
						</div>
					</div>

					<!-- Free shipping progress -->
					{#if !isFreeShipping}
						<div class="mt-4">
							<p class="mb-1.5 font-body text-xs text-on-surface-muted">
								Add <span class="font-semibold text-secondary">{formatPrice(remaining)}</span> more for
								free shipping!
							</p>
							<div
								class="h-2 w-full overflow-hidden rounded-full bg-surface-high"
								role="progressbar"
								aria-valuenow={freeShippingPercent}
								aria-valuemin={0}
								aria-valuemax={100}
								aria-label="Free shipping progress"
							>
								<div
									class="h-full rounded-full bg-secondary transition-all duration-500 ease-out"
									style="width: {freeShippingPercent}%"
								></div>
							</div>
						</div>
					{/if}

					<!-- Divider -->
					<hr class="my-5 border-surface-high" />

					<!-- Total -->
					<div class="flex items-center justify-between">
						<span class="font-body text-base font-semibold text-on-surface">Total</span>
						<span class="font-display text-2xl font-semibold text-on-surface">
							{formatPrice(total)}
						</span>
					</div>

					<p class="mt-1 font-body text-xs text-on-surface-muted">
						Inclusive of all taxes
					</p>

					<!-- CTA -->
					<a
						href="/checkout"
						class="mt-6 block w-full rounded-full bg-primary py-3.5 text-center font-body font-semibold text-white shadow-ambient transition-all duration-200 hover:bg-primary-dim active:scale-95"
					>
						Proceed to Checkout
					</a>

					<a
						href="/shop"
						class="mt-3 block w-full rounded-full py-2.5 text-center font-body text-sm font-medium text-on-surface-muted transition-colors hover:text-primary"
					>
						Continue Shopping
					</a>

					<!-- Trust badges -->
					<div
						class="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-surface-high pt-5"
					>
						<span class="font-body text-xs text-on-surface-muted">🔒 Secure Checkout</span>
						<span class="font-body text-xs text-on-surface-muted">🇮🇳 Made in India</span>
						<span class="font-body text-xs text-on-surface-muted">🧶 100% Handmade</span>
					</div>
				</div>
			</aside>
		{/if}

	</div>
</div>
