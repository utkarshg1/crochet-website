<script lang="ts">
	import { cart } from '$lib/cart.svelte';
	import { formatPrice, calculateShipping, FREE_SHIPPING_THRESHOLD_PAISE } from '$lib/types';
	import Button from '$lib/components/ui/Button.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
	}

	let { open, onClose }: Props = $props();

	// Derived financials — recalculate whenever cart changes
	const subtotal = $derived(cart.subtotal);
	const shipping = $derived(calculateShipping(subtotal));
	const total = $derived(subtotal + shipping);
	const amountToFreeShipping = $derived(
		subtotal < FREE_SHIPPING_THRESHOLD_PAISE ? FREE_SHIPPING_THRESHOLD_PAISE - subtotal : 0
	);

	// Progress toward free shipping — drives the visual bar (0–1)
	const freeShippingProgress = $derived(
		Math.min(subtotal / FREE_SHIPPING_THRESHOLD_PAISE, 1)
	);

	function handleBackdropClick(e: MouseEvent) {
		// Only close if the click landed directly on the backdrop, not the panel
		if (e.target === e.currentTarget) onClose();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onClose();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!--
    Backdrop: semi-transparent on-surface overlay rather than pure black.
    Using on-surface tint keeps it in-palette and prevents harsh contrast
    against the minty/white surfaces behind the drawer.
  -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 bg-on-surface/20 backdrop-blur-sm"
		onclick={handleBackdropClick}
		role="presentation"
	>
		<!--
      Drawer panel: slides in from the right via .animate-slide-in-right
      (defined in layout.css as a cubic-bezier ease-out keyframe).
      max-w-md keeps it from being a full takeover on wide screens.
    -->
		<div
			class="
        absolute right-0 top-0 bottom-0 w-full max-w-md
        bg-surface-card animate-slide-in-right
        flex flex-col
        shadow-ambient-lg
      "
			role="dialog"
			aria-modal="true"
			aria-label="Shopping bag"
		>
			<!-- ── Header ─────────────────────────────────────────────────────── -->
			<div class="flex items-center justify-between px-6 py-5">
				<h2 class="font-display text-2xl text-on-surface">
					Your Bag
					{#if cart.count > 0}
						<span class="ml-2 font-body text-sm font-semibold text-on-surface-muted">
							({cart.count} {cart.count === 1 ? 'item' : 'items'})
						</span>
					{/if}
				</h2>
				<button
					onclick={onClose}
					class="
            w-9 h-9 rounded-full bg-surface-high flex items-center justify-center
            text-on-surface-muted hover:text-on-surface hover:bg-surface-low
            transition-colors duration-150
          "
					aria-label="Close bag"
				>
					<svg
						viewBox="0 0 24 24"
						class="w-5 h-5"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
					>
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
			</div>

			<!-- Free shipping progress nudge — motivates upsell naturally -->
			{#if cart.count > 0 && freeShippingProgress < 1}
				<div class="px-6 pb-4">
					<p class="text-xs text-on-surface-muted mb-2">
						Add <span class="font-semibold text-secondary">{formatPrice(amountToFreeShipping)}</span> more for free shipping
					</p>
					<div class="h-1.5 rounded-full bg-surface-high overflow-hidden">
						<div
							class="h-full rounded-full bg-gradient-to-r from-secondary to-secondary-container transition-all duration-500"
							style="width: {freeShippingProgress * 100}%"
						></div>
					</div>
				</div>
			{:else if freeShippingProgress >= 1 && cart.count > 0}
				<div class="px-6 pb-4">
					<p class="text-xs font-semibold text-secondary">
						You've unlocked free shipping!
					</p>
				</div>
			{/if}

			<!-- ── Items list (scrollable) ────────────────────────────────────── -->
			<div class="flex-1 overflow-y-auto px-6 pb-4">
				{#if cart.items.length === 0}
					<!--
            Empty state: playful, on-brand. Large emoji + short copy
            beats a verbose "nothing here yet" paragraph.
          -->
					<div class="flex flex-col items-center justify-center h-full gap-4 py-16 text-center">
						<span class="text-6xl animate-yarn-bounce" role="img" aria-label="Yarn ball">🧶</span>
						<p class="font-display text-xl text-on-surface">Your bag is empty</p>
						<p class="text-sm text-on-surface-muted max-w-xs">
							Time to treat yourself — every stitch is made with love.
						</p>
						<Button href="/shop" variant="primary" size="md" onclick={onClose}>
							Shop Now
						</Button>
					</div>
				{:else}
					<ul class="flex flex-col gap-4" role="list">
						{#each cart.items as item (item.product_id + (item.color ?? ''))}
							<li class="flex gap-4 rounded-2xl bg-surface p-3">
								<!-- Product thumbnail -->
								<a href="/shop/{item.slug}" onclick={onClose} class="shrink-0">
									<img
										src={item.image_url}
										alt={item.image_alt}
										class="w-20 h-20 object-cover rounded-xl"
										loading="lazy"
									/>
								</a>

								<!-- Item details -->
								<div class="flex flex-col flex-1 gap-1 min-w-0">
									<a
										href="/shop/{item.slug}"
										onclick={onClose}
										class="font-display text-sm leading-snug text-on-surface hover:text-primary transition-colors line-clamp-2"
									>
										{item.title}
									</a>

									{#if item.color}
										<p class="text-xs text-on-surface-muted capitalize">{item.color}</p>
									{/if}

									<p class="text-sm font-bold text-primary mt-auto">
										{formatPrice(item.price_paise * item.qty)}
									</p>

									<!-- Controls row: qty stepper + remove -->
									<div class="flex items-center gap-3 mt-1">
										<!-- Qty stepper -->
										<div class="flex items-center rounded-full bg-surface-high">
											<button
												onclick={() => cart.update(item.product_id, item.color, item.qty - 1)}
												class="w-7 h-7 flex items-center justify-center text-on-surface-muted hover:text-on-surface transition-colors"
												aria-label="Decrease quantity"
											>
												<svg viewBox="0 0 24 24" class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
													<line x1="5" y1="12" x2="19" y2="12" />
												</svg>
											</button>
											<span class="w-6 text-center text-sm font-semibold text-on-surface tabular-nums">
												{item.qty}
											</span>
											<button
												onclick={() => cart.update(item.product_id, item.color, item.qty + 1)}
												disabled={item.qty >= item.stock}
												class="w-7 h-7 flex items-center justify-center text-on-surface-muted hover:text-on-surface transition-colors disabled:opacity-40"
												aria-label="Increase quantity"
											>
												<svg viewBox="0 0 24 24" class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
													<line x1="12" y1="5" x2="12" y2="19" />
													<line x1="5" y1="12" x2="19" y2="12" />
												</svg>
											</button>
										</div>

										<!-- Remove -->
										<button
											onclick={() => cart.remove(item.product_id, item.color)}
											class="text-xs text-on-surface-muted hover:text-primary transition-colors"
											aria-label="Remove {item.title} from bag"
										>
											Remove
										</button>
									</div>
								</div>
							</li>
						{/each}
					</ul>
				{/if}
			</div>

			<!-- ── Footer: totals + checkout ─────────────────────────────────── -->
			{#if cart.items.length > 0}
				<!--
          Background shift replaces a horizontal rule — the surface-high band
          creates visual separation without the hard line. Stays consistent
          with the "no dividers" design rule.
        -->
				<div class="bg-surface px-6 py-5 flex flex-col gap-3">
					<!-- Subtotal row -->
					<div class="flex justify-between text-sm text-on-surface-muted">
						<span>Subtotal</span>
						<span class="font-semibold text-on-surface">{formatPrice(subtotal)}</span>
					</div>

					<!-- Shipping row -->
					<div class="flex justify-between text-sm text-on-surface-muted">
						<span>Shipping</span>
						<span class="font-semibold {shipping === 0 ? 'text-secondary' : 'text-on-surface'}">
							{shipping === 0 ? 'Free' : formatPrice(shipping)}
						</span>
					</div>

					<!--
            Total uses Newsreader display font at larger scale —
            matches the grandeur of the checkout moment
          -->
					<div class="flex justify-between items-baseline pt-2">
						<span class="font-display text-xl text-on-surface">Total</span>
						<span class="font-display text-2xl font-semibold text-on-surface">
							{formatPrice(total)}
						</span>
					</div>

					<Button href="/checkout" variant="primary" size="lg" class="w-full mt-1" onclick={onClose}>
						Checkout
						<svg
							viewBox="0 0 24 24"
							class="w-4 h-4"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<line x1="5" y1="12" x2="19" y2="12" />
							<polyline points="12 5 19 12 12 19" />
						</svg>
					</Button>

					<button onclick={() => { cart.clear(); }} class="text-xs text-on-surface-muted hover:text-primary transition-colors text-center mt-1">
						Clear bag
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}
