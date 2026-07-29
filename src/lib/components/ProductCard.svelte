<script lang="ts">
	import type { Product } from '$lib/types';
	import { formatPrice } from '$lib/types';
	import { cart } from '$lib/cart.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { get } from 'svelte/store';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	interface Props {
		product: Product;
		wishlisted?: boolean;
		onToggleWishlist?: (productId: string, wishlisted: boolean) => void;
	}

	let { product, wishlisted = false, onToggleWishlist }: Props = $props();

	// Derived helpers — keep template clean
	// Normalize: admin stores plain URL strings; older data may be {url,alt} objects
	const rawImage = $derived(product.images?.[0]);
	const primaryImage = $derived(
		rawImage
			? typeof rawImage === 'string'
				? { url: rawImage, alt: product.title }
				: rawImage
			: null
	);
	const isSale = $derived(
		product.compare_at_price_paise !== null && product.compare_at_price_paise > product.price_paise
	);
	const isLowStock = $derived(product.stock > 0 && product.stock <= 5);
	const isOutOfStock = $derived(product.stock === 0);

	let adding = $state(false);
	let togglingWishlist = $state(false);

	let wishlistFormId = $derived(`wl-${product.id}`);

	// Client-side auth pre-check — redirect to login if not authenticated
	function handleWishlistClick(e: MouseEvent) {
		e.stopPropagation();
		if (!get(page).data?.user) {
			e.preventDefault();
			const currentUrl = get(page).url.pathname + get(page).url.search;
			goto(`/account?redirectTo=${encodeURIComponent(currentUrl)}`);
		}
	}

	// Form action enhancement — submits to /wishlist?/toggleWishlist
	function submitEnhance() {
		togglingWishlist = true;
		return async ({ result }: { result: { type: string; data?: Record<string, unknown> } }) => {
			togglingWishlist = false;
			if (result.type === 'success' && result.data) {
				const { productId, wishlisted: isWishlisted } = result.data;
				onToggleWishlist?.(productId as string, isWishlisted as boolean);
			}
		};
	}

	async function handleAddToCart() {
		if (isOutOfStock || adding) return;

		adding = true;

		// Pick first color name if any — user can change in product detail
		const color = product.colors?.[0]?.name ?? null;

		cart.add({
			product_id: product.id,
			slug: product.slug,
			title: product.title,
			price_paise: product.price_paise,
			image_url: primaryImage?.url ?? '',
			image_alt: primaryImage?.alt ?? product.title,
			color,
			stock: product.stock
		});

		// Brief visual confirmation before resetting
		await new Promise((r) => setTimeout(r, 900));
		adding = false;
	}
</script>

<!--
  Card uses ambient shadow that elevates on hover — the shadow is tonal (green-tinted)
  so it feels warmer than a grey drop shadow. Scale is subtle (1.01) so it reads as
  a response, not a dramatic effect.
-->
<article
	class="
  group shadow-ambient hover:shadow-ambient-lg relative flex flex-col overflow-hidden
  rounded-3xl bg-surface-card transition-shadow duration-300
"
>
	<!-- Image area: anchor wraps only the image + badges -->
	<div class="relative m-3 mb-0 overflow-hidden rounded-2xl">
		<a href="/shop/{product.slug}" class="block">
			{#if primaryImage}
				<img
					src={primaryImage.url}
					alt={primaryImage.alt}
					class="
              mask-organic aspect-square w-full object-cover
              transition-transform duration-500 ease-out group-hover:scale-105
            "
					loading="lazy"
				/>
			{:else}
				<div
					class="mask-organic flex aspect-square w-full items-center justify-center bg-surface-high text-5xl"
				>
					🧶
				</div>
			{/if}

			<!-- Stacked badges — absolute overlay on image, top-left -->
			<div class="absolute top-3 left-3 flex flex-col gap-1.5">
				{#if product.is_new}
					<Badge variant="new">New</Badge>
				{/if}
				{#if isSale}
					<Badge variant="sale">Sale</Badge>
				{/if}
				{#if isLowStock}
					<Badge variant="low-stock">Only {product.stock} left</Badge>
				{/if}
				{#if isOutOfStock}
					<Badge variant="low-stock">Sold out</Badge>
				{/if}
			</div>
		</a>

		<!-- Wishlist heart button — top-right, outside the anchor -->
		<button
			type="submit"
			form={wishlistFormId}
			onclick={handleWishlistClick}
			disabled={togglingWishlist}
			class="absolute top-3 right-3 flex h-9 w-9 items-center justify-center
				   rounded-full bg-surface/80 backdrop-blur-sm
				   transition-colors duration-200 hover:bg-surface
				   focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
			aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
		>
			<svg
				class="h-5 w-5 transition-colors duration-200 {wishlisted
					? 'fill-primary text-primary'
					: 'text-on-surface-muted'}"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path
					d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
				/>
			</svg>
		</button>
	</div>

	<!-- Card body -->
	<div class="flex flex-1 flex-col gap-3 p-4 pt-3">
		<!-- Category chip — only shown when category data is present -->
		{#if product.category}
			<Badge variant="category">{product.category.name}</Badge>
		{/if}

		<!-- Title links to product page -->
		<a href="/shop/{product.slug}" class="group/title">
			<h3
				class="
          line-clamp-2 font-display text-lg leading-snug
          text-on-surface transition-colors duration-200
          group-hover/title:text-primary
        "
			>
				{product.title}
			</h3>
		</a>

		<!-- Price row — grows to push button to bottom -->
		<div class="mt-auto flex items-baseline gap-2">
			<span class="font-body text-lg font-bold text-primary">
				{formatPrice(product.price_paise)}
			</span>
			{#if isSale && product.compare_at_price_paise}
				<!--
          Strikethrough uses muted color, not primary, so the red-ish primary
          reads as the new (better) price and the crossed-out reads as past
        -->
				<span class="font-body text-sm text-on-surface-muted line-through">
					{formatPrice(product.compare_at_price_paise)}
				</span>
			{/if}
		</div>

		<!-- Add to bag button — full width, compact, primary pill -->
		<Button
			variant="primary"
			size="sm"
			disabled={isOutOfStock || adding}
			onclick={handleAddToCart}
			class="mt-1 w-full"
		>
			{#if adding}
				<!-- Simple inline check rather than a heavy animation library import -->
				<svg
					class="h-4 w-4 animate-spin"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
				>
					<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83" />
				</svg>
				Adding…
			{:else if isOutOfStock}
				Sold Out
			{:else}
				<svg
					class="h-4 w-4"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
					<line x1="3" y1="6" x2="21" y2="6" />
					<path d="M16 10a4 4 0 01-8 0" />
				</svg>
				Add to Bag
			{/if}
		</Button>

		<!-- Add to / Remove from Wishlist — ghost button, secondary action -->
		<button
			type="submit"
			form={wishlistFormId}
			onclick={handleWishlistClick}
			disabled={togglingWishlist}
			class="
				mt-1.5 flex w-full items-center justify-center gap-1.5
				font-display text-sm leading-none text-on-surface italic underline decoration-primary
				decoration-2 underline-offset-4 transition-colors duration-200
				hover:text-primary hover:decoration-primary-dim
				disabled:cursor-not-allowed disabled:opacity-50
			"
			aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
		>
			<svg
				class="h-4 w-4 {wishlisted ? 'fill-primary text-primary' : 'text-on-surface-muted'}"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path
					d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
				/>
			</svg>
			{wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
		</button>
	</div>

	<!-- Hidden wishlist form — submitted by either button above -->
	<form
		method="POST"
		action="/wishlist?/toggleWishlist"
		use:enhance={submitEnhance}
		id={wishlistFormId}
		class="hidden"
	>
		<input type="hidden" name="productId" value={product.id} />
		<input type="hidden" name="redirectTo" value={$page.url.pathname + $page.url.search} />
	</form>
</article>
