<script lang="ts">
	import { onMount } from 'svelte';
	import { cart } from '$lib/cart.svelte';
	import { formatPrice } from '$lib/types';
	import ProductCard from '$lib/components/ProductCard.svelte';
	import CategoryChip from '$lib/components/CategoryChip.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import type { PageData } from './$types';
	import type { Product, ProductImage } from '$lib/types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	// Shorthand aliases — explicit types resolve Supabase join inference issues
	const product: Product = $derived(data.product as Product);
	const related: Product[] = $derived(data.related as Product[]);

	// ─── Image gallery state ──────────────────────────────────────────────────
	let activeImageIndex = $state(0);

	// Reset gallery when the product changes (e.g. navigating from related)
	$effect(() => {
		// Accessing product.id registers the dependency; the effect fires on change
		void product.id;
		activeImageIndex = 0;
	});

	// ─── Derived product flags ────────────────────────────────────────────────
	const isSale = $derived(
		product.compare_at_price_paise !== null &&
			product.compare_at_price_paise > product.price_paise
	);
	const isLowStock = $derived(product.stock > 0 && product.stock <= 5);
	const isOutOfStock = $derived(product.stock === 0);
	// Normalize: admin stores plain URL strings; older data may be {url,alt} objects
	const normImages = $derived<ProductImage[]>(
		(product.images ?? [])
			.map((img: unknown) =>
				typeof img === 'string' ? { url: img, alt: product.title } : (img as ProductImage)
			)
			.filter((img) => Boolean(img.url))
	);
	const hasImages = $derived(normImages.length > 0);
	const activeImage = $derived(hasImages ? normImages[activeImageIndex] : null);

	// Discount percentage — shown next to strikethrough price when on sale
	const discountPercent = $derived(
		isSale && product.compare_at_price_paise
			? Math.round(
					((product.compare_at_price_paise - product.price_paise) /
						product.compare_at_price_paise) *
						100
				)
			: 0
	);

	// ─── Color selector state ─────────────────────────────────────────────────
	let selectedColor = $state<string>(product.colors[0] ?? '');

	// ─── Quantity stepper state ───────────────────────────────────────────────
	let qty = $state(1);

	// Clamp qty to stock whenever stock changes (e.g. SPA nav to different product)
	$effect(() => {
		if (qty > product.stock) qty = Math.max(1, product.stock);
	});

	function decrementQty() {
		if (qty > 1) qty--;
	}

	function incrementQty() {
		if (qty < product.stock) qty++;
	}

	// ─── Add to bag state ─────────────────────────────────────────────────────
	// Three states: idle | adding | added
	// "adding" gives a brief loading feel; "added" shows the checkmark confirmation.
	let addState = $state<'idle' | 'adding' | 'added'>('idle');
	let addTimer: ReturnType<typeof setTimeout> | null = null;

	function handleAddToCart() {
		if (isOutOfStock || addState !== 'idle') return;

		addState = 'adding';

		// Micro-delay so "Adding…" flicker feels intentional, not instant
		setTimeout(() => {
			cart.add(
				{
					product_id: product.id,
					slug: product.slug,
					title: product.title,
					price_paise: product.price_paise,
					image_url: activeImage?.url ?? '',
					image_alt: activeImage?.alt ?? product.title,
					color: selectedColor || null,
					stock: product.stock
				},
				qty
			);

			addState = 'added';

			// Return to idle after 1.5s — long enough to read, short enough to re-add
			addTimer = setTimeout(() => {
				addState = 'idle';
			}, 1500);
		}, 400);
	}

	// Clean up the timer if the component unmounts mid-animation
	onMount(() => {
		return () => {
			if (addTimer) clearTimeout(addTimer);
		};
	});

	// ─── Accordion state ──────────────────────────────────────────────────────
	// openSection stores the key of the open panel; null = all closed.
	// Only one panel is open at a time — this is an exclusive accordion.
	let openSection = $state<string | null>(null);

	function toggleSection(key: string) {
		openSection = openSection === key ? null : key;
	}

	// Accordion data — separated from template to keep the markup clean
	const accordionSections = $derived([
		{
			key: 'materials',
			title: 'Materials & Care',
			content: [product.materials, product.care_instructions]
				.filter(Boolean)
				.join('\n\n') || 'Details coming soon.'
		},
		{
			key: 'dimensions',
			title: 'Dimensions',
			content: product.dimensions ?? 'Dimensions vary slightly as each piece is handmade.'
		},
		{
			key: 'handmade',
			title: 'About Handmade',
			content:
				'Every Krafted Loops piece is made to order by hand. Slight variations in texture, colour, and size are a natural part of the process — these are features, not flaws. No two pieces are ever exactly alike.'
		}
	]);
</script>

<svelte:head>
	<title>{product.title} — Krafted Loops Studio</title>
	<meta
		name="description"
		content={product.description.slice(0, 160)}
	/>
	<!-- Open Graph -->
	<meta property="og:title" content="{product.title} — Krafted Loops Studio" />
	<meta property="og:description" content={product.description.slice(0, 160)} />
	{#if hasImages}
		<meta property="og:image" content={normImages[0].url} />
	{/if}
</svelte:head>

<!-- ─── Breadcrumb ──────────────────────────────────────────────────────────── -->
<div class="bg-surface-low border-b border-on-surface/5">
	<div class="max-w-7xl mx-auto px-4 py-4">
		<nav aria-label="Breadcrumb">
			<ol class="flex items-center gap-2 text-sm font-body text-on-surface-muted flex-wrap">
				<li>
					<a href="/" class="hover:text-primary transition-colors duration-200">Home</a>
				</li>
				<li aria-hidden="true" class="text-on-surface-muted/40">/</li>
				<li>
					<a href="/shop" class="hover:text-primary transition-colors duration-200">Shop</a>
				</li>
				<li aria-hidden="true" class="text-on-surface-muted/40">/</li>
				<li>
					<span class="text-on-surface font-medium line-clamp-1" aria-current="page">
						{product.title}
					</span>
				</li>
			</ol>
		</nav>
	</div>
</div>

<!-- ─── Main Product Section ──────────────────────────────────────────────────── -->
<section class="max-w-7xl mx-auto px-4 py-10 lg:py-16">
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

		<!-- ─── Left: Image Gallery ──────────────────────────────────────────── -->
		<div class="flex flex-col gap-4">
			<!-- Main image -->
			<div class="relative rounded-3xl overflow-hidden bg-surface-low aspect-square shadow-ambient">
				{#if hasImages && activeImage}
					<img
						src={activeImage.url}
						alt={activeImage.alt}
						class="w-full h-full object-cover mask-organic transition-opacity duration-300"
						loading="eager"
					/>
				{:else}
					<!--
						Gradient placeholder — uses brand colors so even without a photo
						the page feels intentional and on-brand rather than broken.
					-->
					<div
						class="w-full h-full bg-gradient-to-br from-primary-container/40 to-secondary-container rounded-3xl flex items-center justify-center"
						aria-label="Product image coming soon"
					>
						<span class="text-8xl opacity-60" role="img" aria-label="Yarn ball">🧶</span>
					</div>
				{/if}

				<!-- Badge overlay on main image -->
				<div class="absolute top-4 left-4 flex flex-col gap-2">
					{#if product.is_new}
						<Badge variant="new">New Arrival</Badge>
					{/if}
					{#if isSale && discountPercent > 0}
						<Badge variant="sale">{discountPercent}% off</Badge>
					{/if}
				</div>
			</div>

			<!-- Thumbnail strip — only rendered when there are multiple images -->
			{#if hasImages && product.images.length > 1}
				<div class="flex gap-3 overflow-x-auto pb-1" role="list" aria-label="Product images">
					{#each normImages as image, i (image.url)}
						<button
							role="listitem"
							onclick={() => (activeImageIndex = i)}
							class="
								flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden
								transition-all duration-200
								{activeImageIndex === i
									? 'ring-2 ring-primary ring-offset-2 ring-offset-surface'
									: 'opacity-60 hover:opacity-100'}
							"
							aria-label="View image {i + 1}"
							aria-pressed={activeImageIndex === i}
						>
							<img
								src={image.url}
								alt={image.alt}
								class="w-full h-full object-cover"
								loading="lazy"
							/>
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- ─── Right: Product Details ───────────────────────────────────────── -->
		<div class="flex flex-col gap-5">

			<!-- Category + new badge row -->
			<div class="flex items-center gap-2 flex-wrap">
				{#if product.category}
					<CategoryChip category={product.category} />
				{/if}
				{#if product.is_new}
					<Badge variant="new">New Arrival</Badge>
				{/if}
			</div>

			<!-- Product title -->
			<h1 class="font-display text-4xl sm:text-5xl text-on-surface leading-tight">
				{product.title}
			</h1>

			<!-- Price row -->
			<div class="flex items-baseline gap-3 flex-wrap">
				<span class="font-body font-bold text-primary text-3xl">
					{formatPrice(product.price_paise)}
				</span>
				{#if isSale && product.compare_at_price_paise}
					<span class="font-body text-on-surface-muted line-through text-lg">
						{formatPrice(product.compare_at_price_paise)}
					</span>
					<Badge variant="sale">SALE</Badge>
				{/if}
			</div>

			<!-- Stock status -->
			<div>
				{#if isOutOfStock}
					<Badge variant="low-stock">Out of Stock</Badge>
				{:else if isLowStock}
					<!--
						Urgency without alarm — the low-stock badge is warm coral, not red.
						"Only N left!" is factual and motivating rather than manipulative.
					-->
					<Badge variant="low-stock">Only {product.stock} left!</Badge>
				{:else}
					<span class="inline-flex items-center gap-1.5 font-body text-sm text-secondary font-medium">
						<span class="w-2 h-2 rounded-full bg-secondary inline-block"></span>
						In Stock
					</span>
				{/if}
			</div>

			<!-- Description -->
			<p class="font-body text-on-surface-muted leading-relaxed">
				{product.description}
			</p>

			<!-- ─── Color Selector ────────────────────────────────────────────── -->
			{#if product.colors.length > 0}
				<div class="flex flex-col gap-2">
					<p class="font-body text-sm font-semibold text-on-surface">
						Colour: <span class="font-normal text-on-surface-muted">{selectedColor}</span>
					</p>
					<div class="flex flex-wrap gap-2" role="group" aria-label="Select colour">
						{#each product.colors as color (color)}
							<button
								onclick={() => (selectedColor = color)}
								class="
									rounded-full px-4 py-1.5 border text-sm font-body cursor-pointer
									transition-all duration-200
									{selectedColor === color
										? 'bg-primary text-white border-primary shadow-ambient'
										: 'bg-surface-high border-on-surface/20 text-on-surface hover:border-primary/50 hover:bg-surface-card'}
								"
								aria-pressed={selectedColor === color}
							>
								{color}
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- ─── Quantity Stepper ───────────────────────────────────────────── -->
			{#if !isOutOfStock}
				<div class="flex items-center gap-4">
					<span class="font-body text-sm font-semibold text-on-surface">Qty:</span>
					<!--
						The stepper uses rounded-full on the outer container and individual
						buttons to give it a satisfying pill shape. Shadow on the +/- buttons
						makes them feel physically pressable.
					-->
					<div
						class="bg-surface-high rounded-full flex items-center shadow-ambient"
						role="group"
						aria-label="Quantity"
					>
						<button
							onclick={decrementQty}
							disabled={qty <= 1}
							class="
								w-9 h-9 rounded-full bg-surface-card shadow-ambient
								flex items-center justify-center text-on-surface
								hover:bg-surface-low transition-colors duration-150
								disabled:opacity-40 disabled:cursor-not-allowed
								focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1
							"
							aria-label="Decrease quantity"
						>
							<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
								<path d="M5 12h14" />
							</svg>
						</button>

						<span
							class="w-10 text-center font-body font-semibold text-on-surface tabular-nums"
							aria-live="polite"
							aria-label="Quantity: {qty}"
						>
							{qty}
						</span>

						<button
							onclick={incrementQty}
							disabled={qty >= product.stock}
							class="
								w-9 h-9 rounded-full bg-surface-card shadow-ambient
								flex items-center justify-center text-on-surface
								hover:bg-surface-low transition-colors duration-150
								disabled:opacity-40 disabled:cursor-not-allowed
								focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1
							"
							aria-label="Increase quantity"
						>
							<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
								<path d="M12 5v14M5 12h14" />
							</svg>
						</button>
					</div>
				</div>
			{/if}

			<!-- ─── Add to Bag Button ─────────────────────────────────────────── -->
			<!--
				Three-state button: idle → adding (brief spinner) → added (checkmark).
				The 1.5s "Added" state gives users clear confirmation without blocking
				repeat adds. Spring-feel comes from the CSS scale on active state.
			-->
			<button
				onclick={handleAddToCart}
				disabled={isOutOfStock || addState !== 'idle'}
				class="
					w-full flex items-center justify-center gap-2.5
					bg-gradient-to-r from-primary to-primary-dim text-white
					rounded-full font-body font-semibold text-lg
					px-8 py-4
					shadow-ambient hover:shadow-ambient-lg
					hover:brightness-110 active:scale-[0.98]
					transition-all duration-200
					disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100
					focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
				"
				aria-live="polite"
			>
				{#if addState === 'adding'}
					<!-- Spinner -->
					<svg
						class="w-5 h-5 animate-spin"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						aria-hidden="true"
					>
						<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
					</svg>
					Adding…
				{:else if addState === 'added'}
					<!-- Checkmark -->
					<svg
						class="w-5 h-5"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M20 6 9 17l-5-5" />
					</svg>
					Added to Bag
				{:else if isOutOfStock}
					Out of Stock
				{:else}
					<!-- Shopping bag icon -->
					<svg
						class="w-5 h-5"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
						<line x1="3" y1="6" x2="21" y2="6" />
						<path d="M16 10a4 4 0 0 1-8 0" />
					</svg>
					Add to Bag
				{/if}
			</button>

			<!-- Shipping note -->
			<p class="font-body text-sm text-on-surface-muted text-center leading-relaxed">
				Free shipping on orders above ₹500 &nbsp;•&nbsp; Made to order in 3–5 days
			</p>

			<!-- ─── Accordion: Product Details ───────────────────────────────── -->
			<div class="border-t border-on-surface/10 mt-2" role="list">
				{#each accordionSections as section (section.key)}
					<div class="border-b border-on-surface/10" role="listitem">
						<!--
							Exclusive accordion: clicking an open panel closes it, clicking
							a closed one opens it and closes the previous. The chevron rotates
							180° via CSS transform — no JS needed for that visual.
						-->
						<button
							onclick={() => toggleSection(section.key)}
							class="
								w-full flex items-center justify-between
								py-4 text-left
								font-body font-semibold text-on-surface text-base
								hover:text-primary transition-colors duration-200
								focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 focus-visible:rounded
							"
							aria-expanded={openSection === section.key}
							aria-controls="accordion-{section.key}"
						>
							<span>{section.title}</span>
							<!-- Chevron arrow, rotates when open -->
							<svg
								class="
									w-4 h-4 text-on-surface-muted flex-shrink-0
									transition-transform duration-300
									{openSection === section.key ? 'rotate-180' : ''}
								"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								aria-hidden="true"
							>
								<path d="m6 9 6 6 6-6" />
							</svg>
						</button>

						<!--
							CSS max-height transition: 0 → 24rem.
							Using max-h rather than height so we don't need JS to measure
							the natural height. The content rarely exceeds 24rem, and the
							transition eases out so it feels natural even when short.
						-->
						<div
							id="accordion-{section.key}"
							class="
								overflow-hidden transition-all duration-300 ease-out
								{openSection === section.key ? 'max-h-96 pb-4' : 'max-h-0'}
							"
						>
							<p class="font-body text-on-surface-muted text-sm leading-relaxed whitespace-pre-line">
								{section.content}
							</p>
						</div>
					</div>
				{/each}
			</div>

			<!-- Tags — shown at the bottom of details if present -->
			{#if product.tags && product.tags.length > 0}
				<div class="flex flex-wrap gap-2 pt-2">
					{#each product.tags as tag (tag)}
						<span class="font-body text-xs bg-surface-high text-on-surface-muted rounded-full px-3 py-1">
							#{tag}
						</span>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</section>

<!-- ─── Related Products ──────────────────────────────────────────────────────── -->
{#if related.length > 0}
	<section class="bg-surface-low py-16 px-4" aria-labelledby="related-heading">
		<div class="max-w-7xl mx-auto">
			<div class="flex items-end justify-between mb-8 gap-4">
				<h2 id="related-heading" class="font-display text-4xl text-on-surface">
					You might also love
				</h2>
				<Button variant="ghost" href="/shop" class="flex-shrink-0 text-sm">
					View all
				</Button>
			</div>

			<!--
				2-col on mobile, 4-col on desktop — matching the homepage feature grid.
				Gap-6 gives each card breathing room without wasting horizontal space.
			-->
			<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
				{#each related as relatedProduct (relatedProduct.id)}
					<ProductCard product={relatedProduct} />
				{/each}
			</div>
		</div>
	</section>
{/if}
