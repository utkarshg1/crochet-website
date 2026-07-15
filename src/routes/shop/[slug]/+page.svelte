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
		product.compare_at_price_paise !== null && product.compare_at_price_paise > product.price_paise
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
	let selectedColor = $state('');

	// Sync selectedColor when product changes
	$effect(() => {
		selectedColor = product.colors[0] ?? '';
	});

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
			content:
				[product.materials, product.care_instructions].filter(Boolean).join('\n\n') ||
				'Details coming soon.'
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
	<meta name="description" content={product.description.slice(0, 160)} />
	<!-- Open Graph -->
	<meta property="og:title" content="{product.title} — Krafted Loops Studio" />
	<meta property="og:description" content={product.description.slice(0, 160)} />
	{#if hasImages}
		<meta property="og:image" content={normImages[0].url} />
	{/if}
</svelte:head>

<!-- ─── Breadcrumb ──────────────────────────────────────────────────────────── -->
<div class="border-b border-on-surface/5 bg-surface-low">
	<div class="mx-auto max-w-7xl px-4 py-4">
		<nav aria-label="Breadcrumb">
			<ol class="flex flex-wrap items-center gap-2 font-body text-sm text-on-surface-muted">
				<li>
					<a href="/" class="transition-colors duration-200 hover:text-primary">Home</a>
				</li>
				<li aria-hidden="true" class="text-on-surface-muted/40">/</li>
				<li>
					<a href="/shop" class="transition-colors duration-200 hover:text-primary">Shop</a>
				</li>
				<li aria-hidden="true" class="text-on-surface-muted/40">/</li>
				<li>
					<span class="line-clamp-1 font-medium text-on-surface" aria-current="page">
						{product.title}
					</span>
				</li>
			</ol>
		</nav>
	</div>
</div>

<!-- ─── Main Product Section ──────────────────────────────────────────────────── -->
<section class="mx-auto max-w-7xl px-4 py-10 lg:py-16">
	<div class="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16">
		<!-- ─── Left: Image Gallery ──────────────────────────────────────────── -->
		<div class="flex flex-col gap-4">
			<!-- Main image -->
			<div class="shadow-ambient relative aspect-square overflow-hidden rounded-3xl bg-surface-low">
				{#if hasImages && activeImage}
					<img
						src={activeImage.url}
						alt={activeImage.alt}
						class="mask-organic h-full w-full object-cover transition-opacity duration-300"
						loading="eager"
					/>
				{:else}
					<!--
						Gradient placeholder — uses brand colors so even without a photo
						the page feels intentional and on-brand rather than broken.
					-->
					<div
						class="flex h-full w-full items-center justify-center rounded-3xl bg-gradient-to-br from-primary-container/40 to-secondary-container"
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
				<ul class="flex gap-3 overflow-x-auto pb-1" aria-label="Product images">
					{#each normImages as image, i (image.url)}
						<li>
							<button
								onclick={() => (activeImageIndex = i)}
								class="
									h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl
									transition-all duration-200
									{activeImageIndex === i
									? 'ring-2 ring-primary ring-offset-2 ring-offset-surface'
									: 'opacity-60 hover:opacity-100'}
								"
								aria-label="View image {i + 1}"
							>
								<img
									src={image.url}
									alt={image.alt}
									class="h-full w-full object-cover"
									loading="lazy"
								/>
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<!-- ─── Right: Product Details ───────────────────────────────────────── -->
		<div class="flex flex-col gap-5">
			<!-- Category + new badge row -->
			<div class="flex flex-wrap items-center gap-2">
				{#if product.category}
					<CategoryChip category={product.category} />
				{/if}
				{#if product.is_new}
					<Badge variant="new">New Arrival</Badge>
				{/if}
			</div>

			<!-- Product title -->
			<h1 class="font-display text-4xl leading-tight text-on-surface sm:text-5xl">
				{product.title}
			</h1>

			<!-- Price row -->
			<div class="flex flex-wrap items-baseline gap-3">
				<span class="font-body text-3xl font-bold text-primary">
					{formatPrice(product.price_paise)}
				</span>
				{#if isSale && product.compare_at_price_paise}
					<span class="font-body text-lg text-on-surface-muted line-through">
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
					<span
						class="inline-flex items-center gap-1.5 font-body text-sm font-medium text-secondary"
					>
						<span class="inline-block h-2 w-2 rounded-full bg-secondary"></span>
						In Stock
					</span>
				{/if}
			</div>

			<!-- Description -->
			<p class="font-body leading-relaxed text-on-surface-muted">
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
									cursor-pointer rounded-full border px-4 py-1.5 font-body text-sm
									transition-all duration-200
									{selectedColor === color
									? 'shadow-ambient border-primary bg-primary text-white'
									: 'border-on-surface/20 bg-surface-high text-on-surface hover:border-primary/50 hover:bg-surface-card'}
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
						class="shadow-ambient flex items-center rounded-full bg-surface-high"
						role="group"
						aria-label="Quantity"
					>
						<button
							onclick={decrementQty}
							disabled={qty <= 1}
							class="
								shadow-ambient flex h-9 w-9 items-center
								justify-center rounded-full bg-surface-card text-on-surface
								transition-colors duration-150 hover:bg-surface-low
								focus-visible:outline-2 focus-visible:outline-offset-1
								focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40
							"
							aria-label="Decrease quantity"
						>
							<svg
								class="h-3.5 w-3.5"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2.5"
								stroke-linecap="round"
								aria-hidden="true"
							>
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
								shadow-ambient flex h-9 w-9 items-center
								justify-center rounded-full bg-surface-card text-on-surface
								transition-colors duration-150 hover:bg-surface-low
								focus-visible:outline-2 focus-visible:outline-offset-1
								focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40
							"
							aria-label="Increase quantity"
						>
							<svg
								class="h-3.5 w-3.5"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2.5"
								stroke-linecap="round"
								aria-hidden="true"
							>
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
					shadow-ambient hover:shadow-ambient-lg flex w-full items-center
					justify-center gap-2.5 rounded-full bg-gradient-to-r
					from-primary to-primary-dim px-8 py-4
					font-body text-lg
					font-semibold text-white
					transition-all duration-200
					hover:brightness-110 focus-visible:outline-2
					focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98]
					disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100
				"
				aria-live="polite"
			>
				{#if addState === 'adding'}
					<!-- Spinner -->
					<svg
						class="h-5 w-5 animate-spin"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						aria-hidden="true"
					>
						<path
							d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
						/>
					</svg>
					Adding…
				{:else if addState === 'added'}
					<!-- Checkmark -->
					<svg
						class="h-5 w-5"
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
						class="h-5 w-5"
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
			<p class="text-center font-body text-sm leading-relaxed text-on-surface-muted">
				Free shipping on orders above ₹500 &nbsp;•&nbsp; Made to order in 3–5 days
			</p>

			<!-- ─── Accordion: Product Details ───────────────────────────────── -->
			<div class="mt-2 border-t border-on-surface/10" role="list">
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
								flex w-full items-center justify-between
								py-4 text-left
								font-body text-base font-semibold text-on-surface
								transition-colors duration-200 hover:text-primary
								focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
							"
							aria-expanded={openSection === section.key}
							aria-controls="accordion-{section.key}"
						>
							<span>{section.title}</span>
							<!-- Chevron arrow, rotates when open -->
							<svg
								class="
									h-4 w-4 flex-shrink-0 text-on-surface-muted
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
							<p
								class="font-body text-sm leading-relaxed whitespace-pre-line text-on-surface-muted"
							>
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
						<span
							class="rounded-full bg-surface-high px-3 py-1 font-body text-xs text-on-surface-muted"
						>
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
	<section class="bg-surface-low px-4 py-16" aria-labelledby="related-heading">
		<div class="mx-auto max-w-7xl">
			<div class="mb-8 flex items-end justify-between gap-4">
				<h2 id="related-heading" class="font-display text-4xl text-on-surface">
					You might also love
				</h2>
				<Button variant="ghost" href="/shop" class="flex-shrink-0 text-sm">View all</Button>
			</div>

			<!--
				2-col on mobile, 4-col on desktop — matching the homepage feature grid.
				Gap-6 gives each card breathing room without wasting horizontal space.
			-->
			<div class="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
				{#each related as relatedProduct (relatedProduct.id)}
					<ProductCard product={relatedProduct} />
				{/each}
			</div>
		</div>
	</section>
{/if}
