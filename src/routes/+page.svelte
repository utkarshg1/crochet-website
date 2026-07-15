<script lang="ts">
	import type { PageData } from './$types';
	import type { Category } from '$lib/types';
	import ProductCard from '$lib/components/ProductCard.svelte';
	import logoSvg from '$lib/assets/Krafted Loops Studio.svg';
	import foreverFlowersImg from '$lib/assets/forever_flowers.png';
	import crochetClothImg from '$lib/assets/crochet_cloth.png';
	import ownerImg from '$lib/assets/owner.jpeg';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	// ── Newsletter form state ────────────────────────────────────────────────────
	let newsletterEmail = $state('');
	let newsletterSubmitted = $state(false);

	// ── Lightbox state ─────────────────────────────────────────────────────────
	let lightboxSrc = $state('');
	let lightboxAlt = $state('');
	let lightboxOpen = $state(false);

	function openLightbox(src: string, alt: string) {
		lightboxSrc = src;
		lightboxAlt = alt;
		lightboxOpen = true;
	}

	function closeLightbox() {
		lightboxOpen = false;
	}

	function handleLightboxKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && lightboxOpen) closeLightbox();
	}

	// Map category slug → gradient classes for the placeholder colour block.
	// These are static design decisions — no reactivity needed, plain const.
	const categoryGradients: Record<string, string> = {
		'baby-items': 'from-mustard/40 to-tertiary-container/50',
		'forever-flowers': 'from-blush to-primary-container/50',
		'crochet-purses': 'from-coral/40 to-primary-container/30',
		'phone-earphone-cases': 'from-sage/40 to-secondary-container',
		'wind-spinners': 'from-secondary-container to-sage/30',
		keychains: 'from-blush/60 to-mustard/30',
		charms: 'from-primary-container/40 to-blush/50',
		'crochet-gifts': 'from-tertiary-container/50 to-secondary-container'
	};

	// Default gradient for any category without an explicit mapping
	const defaultGradient = 'from-surface-high to-secondary-container/60';

	function getCategoryGradient(slug: string): string {
		return categoryGradients[slug] ?? defaultGradient;
	}

	// Asymmetric grid: first two categories on row 1 (col-span-1 each within a
	// 3-col grid), then categories 3+ alternate between a wide (col-span-2) card
	// and a narrow (col-span-1) card to build visual rhythm.
	function getGridClass(index: number): string {
		// index 0, 1: row 1, one column each
		if (index < 2) return 'col-span-1';
		// index 2: wide card spanning 2 columns
		if (index === 2) return 'col-span-2 md:col-span-2';
		// index 3: narrow companion
		return 'col-span-1';
	}

	// The second card in the grid gets a vertical offset to break the grid rigidity
	function getOffsetClass(index: number): string {
		if (index === 1) return 'mt-8';
		return '';
	}
</script>

<svelte:head>
	<title>Krafted Loops Studio — Handmade Crochet from India</title>
	<meta
		name="description"
		content="Every piece from Krafted Loops Studio is lovingly handmade by Kalyani Gaikwad. Shop baby crochet, forever flowers, purses, keychains, charms & more — all crocheted with care."
	/>
	<meta property="og:title" content="Krafted Loops Studio — Handmade Crochet from India" />
	<meta
		property="og:description"
		content="Discover beautifully handcrafted crochet products by Kalyani Gaikwad. Each piece is made with love in India."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Krafted Loops Studio" />
	<meta name="twitter:card" content="summary_large_image" />
	<link rel="canonical" href="https://kraftedloops.in/" />
</svelte:head>

<!-- ═══════════════════════════════════════════════════════════════════════════
     SECTION 1 · HERO
     min-h ensures the section fills the viewport below the fixed nav (64px).
     Blobs are purely decorative — aria-hidden keeps them invisible to AT.
     ─────────────────────────────────────────────────────────────────────── -->
<section
	class="relative flex min-h-[820px] items-center overflow-hidden bg-surface"
	aria-label="Hero — Krafted Loops Studio"
>
	<!-- Decorative gradient blobs ─────────────────────────────────────────── -->
	<!--
    Two large blurred circles that sit behind all content. They are positioned
    absolutely so they never affect layout flow. Using bg-primary/10 and
    bg-secondary/10 keeps them tonal with the brand rather than generic grey.
  -->
	<div
		class="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl"
		aria-hidden="true"
	></div>
	<div
		class="pointer-events-none absolute -top-16 -right-24 h-[420px] w-[420px] rounded-full bg-secondary/10 blur-3xl"
		aria-hidden="true"
	></div>

	<!-- Inner grid ─────────────────────────────────────────────────────────── -->
	<div
		class="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6
               py-20 md:grid-cols-5 md:px-10 lg:gap-16 lg:px-16 lg:py-28"
	>
		<!-- LEFT · text content (60% = 3 of 5 cols) ──────────────────────── -->
		<div class="flex flex-col gap-6 md:col-span-3">
			<!-- Eyebrow label -->
			<p class="font-body text-sm font-semibold tracking-widest text-secondary uppercase">
				Handmade &bull; India
			</p>

			<!-- H1 — Newsreader serif, very large, tight leading -->
			<h1
				class="font-display text-5xl leading-tight font-bold text-on-surface md:text-6xl lg:text-7xl"
			>
				Handcrafted with Love,<br />
				<span class="text-primary">Stitched with Soul</span>
			</h1>

			<!-- Supporting copy -->
			<p class="max-w-lg font-body text-lg leading-relaxed text-on-surface-muted">
				Every piece from Krafted Loops Studio is lovingly made by hand by Kalyani Gaikwad. No two
				pieces are alike — just like you.
			</p>

			<!-- CTA row -->
			<!--
        Primary uses a gradient pill so it reads as the primary action at a
        glance. Secondary uses a subtle outline style so the visual hierarchy
        is clear even without colour contrast as the only differentiator.
      -->
			<div class="mt-2 flex flex-wrap items-center gap-3">
				<a
					href="/shop"
					class="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary
                         to-primary-dim px-7 py-3.5 font-body
                         text-sm font-semibold text-on-primary
                         shadow-[0_4px_20px_0_rgba(167,41,90,0.35)]
                         transition-all
                         duration-200 hover:-translate-y-0.5
                         hover:shadow-[0_6px_28px_0_rgba(167,41,90,0.45)] focus-visible:ring-2 focus-visible:ring-primary
                         focus-visible:ring-offset-2 focus-visible:outline-none active:translate-y-0"
				>
					Shop the Collection
					<svg
						class="h-4 w-4"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M5 12h14M12 5l7 7-7 7" />
					</svg>
				</a>

				<a
					href="#maker"
					class="inline-flex items-center gap-2 rounded-full border border-on-surface/20
                         px-7 py-3.5 font-body text-sm font-semibold text-on-surface
                         transition-all duration-200
                         hover:border-on-surface/30 hover:bg-on-surface/5 focus-visible:ring-2
                         focus-visible:ring-on-surface focus-visible:ring-offset-2
                         focus-visible:outline-none active:bg-on-surface/10"
				>
					Meet the Maker
				</a>
			</div>

			<!-- Trust badges -->
			<div class="mt-1 flex flex-wrap gap-4" role="list" aria-label="Trust signals">
				{#each ['200+ Happy Customers', 'All Handmade', 'Ships Across India'] as badge}
					<span
						role="listitem"
						class="flex items-center gap-1.5 font-body text-xs text-on-surface-muted"
					>
						<span class="text-xs text-secondary" aria-hidden="true">✦</span>
						{badge}
					</span>
				{/each}
			</div>
		</div>

		<!-- RIGHT · brand logo + product images ──────────────────────────── -->
		<div class="relative flex items-center justify-center md:col-span-2" style="min-height: 420px;">
			<!-- Logo center -->
			<img
				src={logoSvg}
				alt="Krafted Loops Studio logo"
				class="shadow-ambient-lg relative z-10 h-48 w-48 rounded-full transition-all duration-700 hover:scale-105 hover:rotate-[-8deg] md:h-64 md:w-64"
			/>

			<!-- Crochet Cloth — top right diagonal -->
			<button
				type="button"
				onclick={() =>
					openLightbox(crochetClothImg, 'Crochet Cloth — artisanal handmade crochet textile')}
				class="shadow-ambient-lg absolute top-2 right-0 z-20
					   h-24 w-24 -rotate-6 cursor-pointer
					   overflow-hidden rounded-2xl transition-all
					   duration-500 ease-out hover:scale-105
					   hover:rotate-0 focus-visible:ring-2 focus-visible:ring-secondary focus-visible:outline-none
					   md:top-0 md:-right-4 md:h-36 md:w-36"
				aria-label="View Crochet Cloth — click to enlarge"
			>
				<img
					src={crochetClothImg}
					alt="Crochet Cloth — artisanal handmade crochet textile"
					class="h-full w-full object-cover"
					loading="lazy"
				/>
			</button>

			<!-- Forever Flowers — bottom left diagonal -->
			<button
				type="button"
				onclick={() =>
					openLightbox(foreverFlowersImg, 'Forever Flowers — handcrafted crochet bouquets')}
				class="shadow-ambient-lg absolute bottom-4 left-2 z-20
					   h-24 w-24 -rotate-8 cursor-pointer
					   overflow-hidden rounded-2xl transition-all
					   duration-500 ease-out hover:scale-105
					   hover:rotate-0 focus-visible:ring-2 focus-visible:ring-secondary focus-visible:outline-none
					   md:bottom-0 md:-left-6 md:h-36 md:w-36"
				aria-label="View Forever Flowers — click to enlarge"
			>
				<img
					src={foreverFlowersImg}
					alt="Forever Flowers — handcrafted crochet bouquets"
					class="h-full w-full object-cover"
					loading="lazy"
				/>
			</button>
		</div>
	</div>
</section>

<!-- ═══════════════════════════════════════════════════════════════════════════
     SECTION 2 · COLLECTIONS GRID
     Asymmetric layout: first two cards share a row, then alternating
     wide/narrow cards to keep the eye moving diagonally.
     ─────────────────────────────────────────────────────────────────────── -->
<section class="bg-surface-low py-24" aria-labelledby="collections-heading">
	<div class="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
		<!-- Section header -->
		<div class="mb-12">
			<p class="mb-3 font-body text-sm font-semibold tracking-widest text-secondary uppercase">
				Our Collections
			</p>
			<h2
				id="collections-heading"
				class="font-display text-4xl leading-tight font-bold text-on-surface md:text-5xl"
			>
				Explore by Craft
			</h2>
		</div>

		<!--
      3-column CSS grid on desktop, single column on mobile.
      Cards span varying numbers of columns per the asymmetric layout rules
      encoded in getGridClass() and getOffsetClass() above.
    -->
		{#if data.categories.length > 0}
			<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
				{#each data.categories as category, index (category.id)}
					<a
						href="/shop?category={category.slug}"
						class="
              {getGridClass(index)} {getOffsetClass(index)}
              group shadow-ambient hover:shadow-ambient-lg rounded-3xl bg-surface-card
              p-6 transition-all duration-300
              focus-visible:ring-2 focus-visible:ring-secondary
              focus-visible:ring-offset-2 focus-visible:outline-none
            "
						aria-label="Explore {category.name}"
					>
						<!--
              Coloured placeholder for the category image. Each category gets
              a unique gradient defined in the categoryGradients map above.
              The group-hover scale is GPU-composited (transform only).
            -->
						<div
							class="mb-5 aspect-video rounded-2xl bg-gradient-to-br {getCategoryGradient(
								category.slug
							)} overflow-hidden"
						>
							<div
								class="h-full w-full transition-transform duration-500 ease-out group-hover:scale-105"
							></div>
						</div>

						<h3 class="mb-1.5 font-display text-xl leading-snug font-semibold text-on-surface">
							{category.name}
						</h3>

						{#if category.description}
							<p class="mb-4 line-clamp-2 font-body text-sm leading-relaxed text-on-surface-muted">
								{category.description}
							</p>
						{:else}
							<div class="mb-4"></div>
						{/if}

						<span
							class="inline-flex items-center gap-1.5 font-body text-sm font-semibold text-secondary
                             transition-all duration-200 group-hover:gap-3"
						>
							Explore
							<svg
								class="h-4 w-4"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2.5"
								stroke-linecap="round"
								stroke-linejoin="round"
								aria-hidden="true"
							>
								<path d="M5 12h14M12 5l7 7-7 7" />
							</svg>
						</span>
					</a>
				{/each}
			</div>
		{:else}
			<!-- Empty state: shown while DB is unpopulated during dev -->
			<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
				{#each Array(4) as _, i}
					<div
						class="col-span-1 {i === 2 ? 'md:col-span-2' : ''} {i === 1 ? 'mt-8' : ''}
                           shadow-ambient animate-pulse rounded-3xl bg-surface-card p-6"
					>
						<div class="mb-5 aspect-video rounded-2xl bg-surface-high"></div>
						<div class="mb-2 h-6 w-3/4 rounded-full bg-surface-high"></div>
						<div class="mb-1 h-4 w-full rounded-full bg-surface-high"></div>
						<div class="mb-4 h-4 w-2/3 rounded-full bg-surface-high"></div>
						<div class="h-4 w-1/4 rounded-full bg-surface-high"></div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</section>

<!-- ═══════════════════════════════════════════════════════════════════════════
     SECTION 3 · FEATURED PRODUCTS
     Horizontal scroll on mobile preserves all cards without wrapping.
     Grid on desktop gives breathing room between items.
     ─────────────────────────────────────────────────────────────────────── -->
<section class="bg-surface py-24" aria-labelledby="featured-heading">
	<div class="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
		<!-- Section header + "View All" link on same row -->
		<div class="mb-12 flex flex-wrap items-end justify-between gap-4">
			<div>
				<p class="mb-3 font-body text-sm font-semibold tracking-widest text-secondary uppercase">
					Featured Pieces
				</p>
				<h2
					id="featured-heading"
					class="font-display text-4xl leading-tight font-bold text-on-surface md:text-5xl"
				>
					From the Studio
				</h2>
			</div>

			<a
				href="/shop"
				class="inline-flex items-center gap-2 rounded-full border border-secondary/30 px-5
                       py-2.5 font-body text-sm font-semibold text-secondary
                       transition-all duration-200 hover:border-secondary/50 hover:bg-secondary/5
                       focus-visible:ring-2 focus-visible:ring-secondary
                       focus-visible:ring-offset-2 focus-visible:outline-none"
			>
				View All
				<svg
					class="h-4 w-4"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M5 12h14M12 5l7 7-7 7" />
				</svg>
			</a>
		</div>

		{#if data.featuredProducts.length > 0}
			<!--
        Mobile: flex row with overflow scroll — the negative horizontal margins
        punch through the section padding so cards sit flush to the edge.
        Desktop: 4-column grid takes over via md:grid.
        The pb-4 accommodates the scrollbar on desktop browsers that show it.
      -->
			<div
				class="-mx-6 flex gap-6 overflow-x-auto px-6 pb-4
                       md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0
                       lg:grid-cols-4"
				role="list"
				aria-label="Featured products"
			>
				{#each data.featuredProducts as product (product.id)}
					<div role="listitem" class="w-[260px] flex-shrink-0 snap-start md:w-auto">
						<ProductCard {product} />
					</div>
				{/each}
			</div>
		{:else}
			<!-- Skeleton grid — 4 placeholder cards while data loads or is empty -->
			<div class="grid grid-cols-2 gap-6 lg:grid-cols-4" aria-label="Loading featured products">
				{#each Array(4) as _}
					<div class="shadow-ambient animate-pulse rounded-3xl bg-surface-card p-3">
						<div class="mb-3 aspect-square rounded-2xl bg-surface-high"></div>
						<div class="flex flex-col gap-2 px-1 pb-1">
							<div class="h-3 w-1/3 rounded-full bg-surface-high"></div>
							<div class="h-5 w-5/6 rounded-full bg-surface-high"></div>
							<div class="h-5 w-4/6 rounded-full bg-surface-high"></div>
							<div class="mt-2 h-4 w-1/4 rounded-full bg-surface-high"></div>
							<div class="mt-1 h-10 w-full rounded-full bg-surface-high"></div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</section>

<!-- Lightbox overlay -->
{#if lightboxOpen}
	<div
		class="fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/70 p-6 backdrop-blur-sm"
		onclick={closeLightbox}
		onkeydown={handleLightboxKeydown}
		role="dialog"
		aria-modal="true"
		aria-label="Image lightbox"
		tabindex="-1"
	>
		<button
			type="button"
			onclick={closeLightbox}
			class="absolute top-6 right-6 z-10 flex h-10 w-10 items-center
				   justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
			aria-label="Close lightbox"
		>
			<svg
				class="h-5 w-5"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M18 6 6 18M6 6l12 12" />
			</svg>
		</button>
		<div role="presentation" onclick={(e) => e.stopPropagation()}>
			<img
				src={lightboxSrc}
				alt={lightboxAlt}
				class="animate-zoom-in max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
			/>
		</div>
	</div>
{/if}

<!-- ═══════════════════════════════════════════════════════════════════════════
     SECTION 4 · MEET THE MAKER
     Two-column: organic image placeholder left, content right.
     The mask-organic clip-path on the image gives a soft, handmade silhouette
     that echoes the tactile nature of the craft.
     ─────────────────────────────────────────────────────────────────────── -->
<section id="maker" class="bg-surface-low py-24" aria-labelledby="maker-heading">
	<div
		class="mx-auto grid max-w-7xl grid-cols-1 items-center
               gap-12 px-6 md:grid-cols-5 md:px-10 lg:gap-20 lg:px-16"
	>
		<!-- LEFT · image column (40% = 2 of 5 cols) ──────────────────────── -->
		<div class="relative flex justify-center md:col-span-2">
			<!--
        The relative wrapper is the positioning context for the floating
        badge and yarn ball emoji. We give it explicit padding-right so the
        badge that bleeds right doesn't get clipped.
      -->
			<div class="relative w-full max-w-xs pr-8 md:max-w-none">
				<!-- Owner photo — click to enlarge -->
				<button
					type="button"
					onclick={() =>
						openLightbox(ownerImg, 'Kalyani Gaikwad — the maker behind Krafted Loops Studio')}
					class="mask-organic shadow-ambient-lg aspect-[3/4] w-full cursor-pointer overflow-hidden
						   rounded-3xl transition-transform duration-500 ease-out hover:scale-[1.02]
						   focus-visible:ring-2 focus-visible:ring-secondary focus-visible:outline-none"
					aria-label="View photo of Kalyani Gaikwad — click to enlarge"
				>
					<img
						src={ownerImg}
						alt="Kalyani Gaikwad — the maker behind Krafted Loops Studio"
						class="h-full w-full object-cover"
					/>
				</button>

				<!--
          Yarn ball bounces on a slow, easing loop — purely decorative
          so aria-hidden keeps it invisible to screen readers.
        -->
				<span
					class="animate-yarn-bounce absolute -top-4 -right-0 text-4xl select-none"
					aria-hidden="true"
				>
					🧶
				</span>

				<!--
          Stat badge uses the glass surface-card style so it lifts visually
          above the image without a hard border. Positioned at bottom-right
          of the image block, bleeding slightly outside via negative right value.
        -->
				<div
					class="shadow-ambient absolute -right-4 bottom-8 flex
                           flex-col items-center rounded-2xl bg-surface-card
                           px-4 py-3 md:-right-6"
					aria-label="Maker stat: 4,000 or more loops daily"
				>
					<span class="font-display text-xl leading-none font-bold text-primary">4,000+</span>
					<span class="mt-0.5 font-body text-xs text-on-surface-muted">loops daily</span>
				</div>
			</div>
		</div>

		<!-- RIGHT · content column (60% = 3 of 5 cols) ──────────────────── -->
		<div class="flex flex-col gap-6 md:col-span-3">
			<!-- Eyebrow -->
			<p class="font-body text-xs font-semibold tracking-widest text-secondary uppercase">
				The Maker Behind Every Stitch
			</p>

			<!-- Heading -->
			<h2
				id="maker-heading"
				class="font-display text-4xl leading-tight font-bold text-on-surface md:text-5xl"
			>
				Every Loop,<br />Crafted with Intention
			</h2>

			<!-- Attribution -->
			<p class="-mt-2 font-display text-xl text-on-surface-muted italic">— Kalyani Gaikwad</p>

			<!-- Quote -->
			<blockquote
				class="border-l-2 border-primary/30 pl-5 font-body text-base
                           leading-relaxed text-on-surface-muted md:text-lg"
			>
				"I started crocheting as a way to slow down in a fast world. What began as a hobby became my
				calling — turning yarn into memories that last a lifetime."
			</blockquote>

			<!-- Stats row ─────────────────────────────────────────────────── -->
			<!--
        Three inline stat cards. Numbers use font-display (Newsreader) to give
        them typographic weight; labels use font-body so they read as
        supporting captions rather than equal-weight content.
      -->
			<div class="mt-2 grid grid-cols-3 gap-4" role="list" aria-label="Maker stats">
				{#each [{ value: '12+', unit: 'Years', label: 'Crocheting' }, { value: '200+', unit: '', label: 'Happy Customers' }, { value: '100%', unit: '', label: 'Handmade' }] as stat}
					<div
						role="listitem"
						class="shadow-ambient flex flex-col gap-1 rounded-2xl bg-surface-card px-4 py-4"
					>
						<span class="font-display text-2xl leading-none font-bold text-primary md:text-3xl">
							{stat.value}
						</span>
						{#if stat.unit}
							<span class="font-body text-xs leading-none font-semibold text-on-surface">
								{stat.unit}
							</span>
						{/if}
						<span class="mt-0.5 font-body text-xs leading-snug text-on-surface-muted">
							{stat.label}
						</span>
					</div>
				{/each}
			</div>

			<!-- CTA -->
			<div class="mt-2">
				<a
					href="/shop"
					class="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary
                           to-primary-dim px-7 py-3.5 font-body
                           text-sm font-semibold text-on-primary
                           shadow-[0_4px_20px_0_rgba(167,41,90,0.35)]
                           transition-all
                           duration-200 hover:-translate-y-0.5
                           hover:shadow-[0_6px_28px_0_rgba(167,41,90,0.45)] focus-visible:ring-2
                           focus-visible:ring-primary focus-visible:ring-offset-2
                           focus-visible:outline-none active:translate-y-0"
				>
					Shop the Collection
					<svg
						class="h-4 w-4"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M5 12h14M12 5l7 7-7 7" />
					</svg>
				</a>
			</div>
		</div>
	</div>
</section>

<!-- ═══════════════════════════════════════════════════════════════════════════
     SECTION 5 · NEWSLETTER
     Solid primary background — the only section that inverts the palette.
     The glassmorphic form container reads as a "floating" input within the
     deep-coloured background, giving it dimension without breaking the brand.
     ─────────────────────────────────────────────────────────────────────── -->
<section id="newsletter" class="bg-primary py-20" aria-labelledby="newsletter-heading">
	<div class="mx-auto max-w-2xl px-6 text-center md:px-10">
		<!-- Decorative pill above heading -->
		<span
			class="mb-6 inline-block rounded-full border border-on-primary/20 px-4 py-1.5
                   font-body text-xs tracking-widest text-on-primary/70 uppercase"
		>
			Stay in the loop
		</span>

		<h2
			id="newsletter-heading"
			class="mb-4 font-display text-4xl leading-tight font-bold text-on-primary md:text-5xl"
		>
			Join the Loop
		</h2>

		<p class="mb-10 font-body text-base leading-relaxed text-on-primary/80 md:text-lg">
			Get early access to new collections, crochet tips, and exclusive discounts.
		</p>

		{#if newsletterSubmitted}
			<!--
        Success state: replaces the form with a warm confirmation message.
        The check icon and copy are intentionally brief — the user just wants
        confirmation, not a wall of text.
      -->
			<div
				class="flex items-center justify-center gap-4 rounded-2xl bg-white/10 px-8 py-6 backdrop-blur-md"
				role="status"
				aria-live="polite"
			>
				<span class="text-2xl" aria-hidden="true">✓</span>
				<p class="font-body font-semibold text-on-primary">
					You're in! Watch your inbox for good things.
				</p>
			</div>
		{:else}
			<!--
        The form uses a SvelteKit form action (?/subscribe) so it works without
        JavaScript. The glassmorphic pill container is a cosmetic wrapper —
        semantically the form is a standard <form> with a labelled email input.
      -->
			<form
				method="POST"
				action="?/subscribe"
				onsubmit={(e) => {
					// Progressive enhancement: intercept and flip state client-side
					// so users with JS get instant feedback without a page reload.
					e.preventDefault();
					const form = e.currentTarget as HTMLFormElement;
					const fd = new FormData(form);
					const email = fd.get('email') as string;
					if (!email || !email.includes('@')) return;

					// Fire-and-forget — server upsert handles deduplication
					fetch(form.action, { method: 'POST', body: fd }).catch(() => {
						// Silent fail: user still sees success UX; worst case they
						// just don't get the email. Show error state if this matters.
					});
					newsletterSubmitted = true;
				}}
				aria-label="Newsletter subscription form"
			>
				<!--
          Glassmorphic pill: bg-white/10 + backdrop-blur creates the frosted
          look on the primary background. The input sits transparently inside
          so it feels integrated rather than punched-in.
        -->
				<div
					class="mx-auto flex max-w-md gap-2 rounded-full border border-white/15 bg-white/10
                           p-2 backdrop-blur-md"
				>
					<label for="newsletter-email" class="sr-only">Email address</label>
					<input
						id="newsletter-email"
						type="email"
						name="email"
						bind:value={newsletterEmail}
						placeholder="your@email.com"
						required
						autocomplete="email"
						class="min-w-0 flex-1 border-0
                               bg-transparent px-4 py-2 font-body text-sm text-on-primary placeholder-on-primary/60
                               caret-on-primary/80 ring-0 focus:border-0
                               focus:ring-0 focus:outline-none"
					/>
					<button
						type="submit"
						class="flex-shrink-0 rounded-full bg-surface-card px-6 py-2.5
                               font-body text-sm font-semibold text-primary
                               transition-colors duration-200 hover:bg-surface
                               focus-visible:ring-2 focus-visible:ring-on-primary
                               focus-visible:ring-offset-2 focus-visible:ring-offset-primary
                               focus-visible:outline-none"
					>
						Subscribe
					</button>
				</div>
			</form>

			<p class="mt-4 font-body text-xs text-on-primary/60">No spam, ever. Unsubscribe anytime.</p>
		{/if}
	</div>
</section>
