<script lang="ts">
	import type { Product } from '$lib/types';
	import { formatPrice } from '$lib/types';
	import { cart } from '$lib/cart.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	interface Props {
		product: Product;
	}

	let { product }: Props = $props();

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

	async function handleAddToCart() {
		if (isOutOfStock || adding) return;

		adding = true;

		// Pick first color if any — user can change in product detail
		const color = product.colors?.[0] ?? null;

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
  group relative flex flex-col bg-surface-card rounded-3xl shadow-ambient
  hover:shadow-ambient-lg transition-shadow duration-300 overflow-hidden
"
>
	<!-- Image link wrapper -->
	<a href="/shop/{product.slug}" class="block relative overflow-hidden rounded-2xl m-3 mb-0">
		{#if primaryImage}
			<img
				src={primaryImage.url}
				alt={primaryImage.alt}
				class="
          w-full aspect-square object-cover mask-organic
          group-hover:scale-105 transition-transform duration-500 ease-out
        "
				loading="lazy"
			/>
		{:else}
			<!-- Graceful fallback when no image is attached to the product -->
			<div
				class="w-full aspect-square bg-surface-high flex items-center justify-center text-5xl mask-organic"
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

	<!-- Card body -->
	<div class="flex flex-col flex-1 gap-3 p-4 pt-3">
		<!-- Category chip — only shown when category data is present -->
		{#if product.category}
			<Badge variant="category">{product.category.name}</Badge>
		{/if}

		<!-- Title links to product page -->
		<a href="/shop/{product.slug}" class="group/title">
			<h3
				class="
          font-display text-lg leading-snug text-on-surface
          group-hover/title:text-primary transition-colors duration-200
          line-clamp-2
        "
			>
				{product.title}
			</h3>
		</a>

		<!-- Price row — grows to push button to bottom -->
		<div class="flex items-baseline gap-2 mt-auto">
			<span class="font-body font-bold text-primary text-lg">
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
			class="w-full mt-1"
		>
			{#if adding}
				<!-- Simple inline check rather than a heavy animation library import -->
				<svg
					class="w-4 h-4 animate-spin"
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
					class="w-4 h-4"
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
	</div>
</article>
