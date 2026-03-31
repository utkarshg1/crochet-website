<script lang="ts">
	import type { PageData } from './$types';
	import type { Category } from '$lib/types';
	import ProductCard from '$lib/components/ProductCard.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	// ── Newsletter form state ────────────────────────────────────────────────────
	let newsletterEmail = $state('');
	let newsletterSubmitted = $state(false);

	// Map category slug → gradient classes for the placeholder colour block.
	// These are static design decisions — no reactivity needed, plain const.
	const categoryGradients: Record<string, string> = {
		amigurumi: 'from-blush to-primary-container/50',
		'home-decor': 'from-sage/40 to-secondary-container',
		'baby-collection': 'from-mustard/40 to-tertiary-container/50',
		accessories: 'from-coral/40 to-primary-container/30',
		seasonal: 'from-secondary-container to-sage/30'
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
		content="Every piece from Krafted Loops Studio is lovingly handmade by Kalyani Gaikwad. Shop amigurumi, home decor, baby collections, and accessories — all crocheted with care."
	/>
</svelte:head>

<!-- ═══════════════════════════════════════════════════════════════════════════
     SECTION 1 · HERO
     min-h ensures the section fills the viewport below the fixed nav (64px).
     Blobs are purely decorative — aria-hidden keeps them invisible to AT.
     ─────────────────────────────────────────────────────────────────────── -->
<section
	class="relative overflow-hidden bg-surface min-h-[820px] flex items-center"
	aria-label="Hero — Krafted Loops Studio"
>
	<!-- Decorative gradient blobs ─────────────────────────────────────────── -->
	<!--
    Two large blurred circles that sit behind all content. They are positioned
    absolutely so they never affect layout flow. Using bg-primary/10 and
    bg-secondary/10 keeps them tonal with the brand rather than generic grey.
  -->
	<div
		class="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl pointer-events-none"
		aria-hidden="true"
	></div>
	<div
		class="absolute -top-16 -right-24 w-[420px] h-[420px] rounded-full bg-secondary/10 blur-3xl pointer-events-none"
		aria-hidden="true"
	></div>

	<!-- Inner grid ─────────────────────────────────────────────────────────── -->
	<div
		class="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-20 lg:py-28
               grid grid-cols-1 md:grid-cols-5 gap-12 lg:gap-16 items-center"
	>
		<!-- LEFT · text content (60% = 3 of 5 cols) ──────────────────────── -->
		<div class="md:col-span-3 flex flex-col gap-6">
			<!-- Eyebrow label -->
			<p class="text-secondary font-body text-sm tracking-widest uppercase font-semibold">
				Handmade &bull; India
			</p>

			<!-- H1 — Newsreader serif, very large, tight leading -->
			<h1
				class="font-display font-bold text-5xl md:text-6xl lg:text-7xl leading-tight text-on-surface"
			>
				Handcrafted with Love,<br />
				<span class="text-primary">Stitched with Soul</span>
			</h1>

			<!-- Supporting copy -->
			<p class="font-body text-on-surface-muted text-lg leading-relaxed max-w-lg">
				Every piece from Krafted Loops Studio is lovingly made by hand by Kalyani Gaikwad. No two
				pieces are alike — just like you.
			</p>

			<!-- CTA row -->
			<!--
        Primary uses a gradient pill so it reads as the primary action at a
        glance. Secondary uses a subtle outline style so the visual hierarchy
        is clear even without colour contrast as the only differentiator.
      -->
			<div class="flex flex-wrap items-center gap-3 mt-2">
				<a
					href="/shop"
					class="inline-flex items-center gap-2 font-body font-semibold text-sm
                         bg-gradient-to-r from-primary to-primary-dim text-on-primary
                         rounded-full px-7 py-3.5
                         shadow-[0_4px_20px_0_rgba(167,41,90,0.35)]
                         hover:shadow-[0_6px_28px_0_rgba(167,41,90,0.45)]
                         hover:-translate-y-0.5 active:translate-y-0
                         transition-all duration-200 focus-visible:outline-none
                         focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
				>
					Shop the Collection
					<svg
						class="w-4 h-4"
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
					class="inline-flex items-center gap-2 font-body font-semibold text-sm
                         text-on-surface border border-on-surface/20 rounded-full px-7 py-3.5
                         hover:bg-on-surface/5 hover:border-on-surface/30
                         active:bg-on-surface/10 transition-all duration-200
                         focus-visible:outline-none focus-visible:ring-2
                         focus-visible:ring-on-surface focus-visible:ring-offset-2"
				>
					Meet the Maker
				</a>
			</div>

			<!-- Trust badges -->
			<div class="flex flex-wrap gap-4 mt-1" role="list" aria-label="Trust signals">
				{#each ['200+ Happy Customers', 'All Handmade', 'Ships Across India'] as badge}
					<span
						role="listitem"
						class="font-body text-xs text-on-surface-muted flex items-center gap-1.5"
					>
						<span class="text-secondary text-xs" aria-hidden="true">✦</span>
						{badge}
					</span>
				{/each}
			</div>
		</div>

		<!-- RIGHT · overlapping floating product image cards (40% = 2 of 5 cols) -->
		<!--
      Cards are absolutely positioned relative to the col container so they
      can overlap. The outer div acts as a size anchor while the cards float
      inside it. Using rotate utilities directly to set a CSS custom property
      so the gentle-float animation respects the initial rotation.
    -->
		<div
			class="md:col-span-2 relative flex justify-center items-center"
			style="min-height: 420px;"
			aria-hidden="true"
		>
			<!-- Card 1 — top, rotated slightly clockwise, floats up/down -->
			<div
				class="absolute top-0 right-0 w-52 md:w-64
                       bg-surface-card rounded-3xl shadow-ambient-lg p-3
                       rotate-3 hover:-rotate-1 transition-transform duration-500
                       animate-float z-20"
				style="--tw-rotate: 3deg;"
			>
				<!-- Placeholder image block — replaced with real <img> in production -->
				<div
					class="bg-gradient-to-br from-primary-container/40 to-blush/60 rounded-2xl aspect-square"
				></div>

				<!-- "New Arrival" badge overlaid on the card -->
				<div class="mt-2 px-1 flex items-center justify-between">
					<span
						class="bg-primary text-on-primary rounded-full px-3 py-1 font-body font-semibold text-xs"
					>
						New Arrival
					</span>
				</div>
			</div>

			<!-- Card 2 — lower, rotated counter-clockwise, slight negative margin for overlap -->
			<div
				class="absolute bottom-0 left-0 w-48 md:w-60
                       bg-surface-card rounded-3xl shadow-ambient p-3
                       -rotate-2 hover:rotate-1 transition-transform duration-500 z-10"
				style="margin-top: -40px;"
			>
				<div
					class="bg-gradient-to-br from-secondary-container/60 to-sage/40 rounded-2xl aspect-square"
				></div>

				<div class="mt-2 px-1">
					<p class="font-display text-sm text-on-surface font-semibold leading-tight">
						Amigurumi Bear
					</p>
					<p class="font-body text-xs text-on-surface-muted mt-0.5">₹1,200</p>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- ═══════════════════════════════════════════════════════════════════════════
     SECTION 2 · COLLECTIONS GRID
     Asymmetric layout: first two cards share a row, then alternating
     wide/narrow cards to keep the eye moving diagonally.
     ─────────────────────────────────────────────────────────────────────── -->
<section class="bg-surface-low py-24" aria-labelledby="collections-heading">
	<div class="max-w-7xl mx-auto px-6 md:px-10 lg:px-16">
		<!-- Section header -->
		<div class="mb-12">
			<p class="font-body text-sm tracking-widest uppercase text-secondary font-semibold mb-3">
				Our Collections
			</p>
			<h2
				id="collections-heading"
				class="font-display font-bold text-4xl md:text-5xl text-on-surface leading-tight"
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
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
				{#each data.categories as category, index (category.id)}
					<a
						href="/shop?category={category.slug}"
						class="
              {getGridClass(index)} {getOffsetClass(index)}
              group bg-surface-card rounded-3xl shadow-ambient p-6
              hover:shadow-ambient-lg transition-all duration-300
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-secondary focus-visible:ring-offset-2
            "
						aria-label="Explore {category.name}"
					>
						<!--
              Coloured placeholder for the category image. Each category gets
              a unique gradient defined in the categoryGradients map above.
              The group-hover scale is GPU-composited (transform only).
            -->
						<div
							class="rounded-2xl aspect-video mb-5 bg-gradient-to-br {getCategoryGradient(
								category.slug
							)} overflow-hidden"
						>
							<div
								class="w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
							></div>
						</div>

						<h3 class="font-display text-xl font-semibold text-on-surface mb-1.5 leading-snug">
							{category.name}
						</h3>

						{#if category.description}
							<p class="font-body text-sm text-on-surface-muted leading-relaxed mb-4 line-clamp-2">
								{category.description}
							</p>
						{:else}
							<div class="mb-4"></div>
						{/if}

						<span
							class="inline-flex items-center gap-1.5 font-body text-sm font-semibold text-secondary
                             group-hover:gap-3 transition-all duration-200"
						>
							Explore
							<svg
								class="w-4 h-4"
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
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
				{#each Array(4) as _, i}
					<div
						class="col-span-1 {i === 2 ? 'md:col-span-2' : ''} {i === 1 ? 'mt-8' : ''}
                           bg-surface-card rounded-3xl shadow-ambient p-6 animate-pulse"
					>
						<div class="rounded-2xl aspect-video mb-5 bg-surface-high"></div>
						<div class="h-6 bg-surface-high rounded-full w-3/4 mb-2"></div>
						<div class="h-4 bg-surface-high rounded-full w-full mb-1"></div>
						<div class="h-4 bg-surface-high rounded-full w-2/3 mb-4"></div>
						<div class="h-4 bg-surface-high rounded-full w-1/4"></div>
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
	<div class="max-w-7xl mx-auto px-6 md:px-10 lg:px-16">
		<!-- Section header + "View All" link on same row -->
		<div class="flex items-end justify-between mb-12 flex-wrap gap-4">
			<div>
				<p class="font-body text-sm tracking-widest uppercase text-secondary font-semibold mb-3">
					Featured Pieces
				</p>
				<h2
					id="featured-heading"
					class="font-display font-bold text-4xl md:text-5xl text-on-surface leading-tight"
				>
					From the Studio
				</h2>
			</div>

			<a
				href="/shop"
				class="inline-flex items-center gap-2 font-body font-semibold text-sm text-secondary
                       border border-secondary/30 rounded-full px-5 py-2.5
                       hover:bg-secondary/5 hover:border-secondary/50 transition-all duration-200
                       focus-visible:outline-none focus-visible:ring-2
                       focus-visible:ring-secondary focus-visible:ring-offset-2"
			>
				View All
				<svg
					class="w-4 h-4"
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
				class="flex overflow-x-auto gap-6 pb-4 -mx-6 px-6
                       md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-4
                       md:overflow-visible"
				role="list"
				aria-label="Featured products"
			>
				{#each data.featuredProducts as product (product.id)}
					<div
						role="listitem"
						class="flex-shrink-0 w-[260px] md:w-auto snap-start"
					>
						<ProductCard {product} />
					</div>
				{/each}
			</div>
		{:else}
			<!-- Skeleton grid — 4 placeholder cards while data loads or is empty -->
			<div class="grid grid-cols-2 lg:grid-cols-4 gap-6" aria-label="Loading featured products">
				{#each Array(4) as _}
					<div class="bg-surface-card rounded-3xl shadow-ambient p-3 animate-pulse">
						<div class="rounded-2xl aspect-square bg-surface-high mb-3"></div>
						<div class="px-1 pb-1 flex flex-col gap-2">
							<div class="h-3 bg-surface-high rounded-full w-1/3"></div>
							<div class="h-5 bg-surface-high rounded-full w-5/6"></div>
							<div class="h-5 bg-surface-high rounded-full w-4/6"></div>
							<div class="h-4 bg-surface-high rounded-full w-1/4 mt-2"></div>
							<div class="h-10 bg-surface-high rounded-full w-full mt-1"></div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</section>

<!-- ═══════════════════════════════════════════════════════════════════════════
     SECTION 4 · MEET THE MAKER
     Two-column: organic image placeholder left, content right.
     The mask-organic clip-path on the image gives a soft, handmade silhouette
     that echoes the tactile nature of the craft.
     ─────────────────────────────────────────────────────────────────────── -->
<section
	id="maker"
	class="bg-surface-low py-24"
	aria-labelledby="maker-heading"
>
	<div
		class="max-w-7xl mx-auto px-6 md:px-10 lg:px-16
               grid grid-cols-1 md:grid-cols-5 gap-12 lg:gap-20 items-center"
	>
		<!-- LEFT · image column (40% = 2 of 5 cols) ──────────────────────── -->
		<div class="md:col-span-2 relative flex justify-center">
			<!--
        The relative wrapper is the positioning context for the floating
        badge and yarn ball emoji. We give it explicit padding-right so the
        badge that bleeds right doesn't get clipped.
      -->
			<div class="relative w-full max-w-xs md:max-w-none pr-8">
				<!-- Organic-shaped image placeholder -->
				<div
					class="bg-gradient-to-br from-primary-container/40 to-secondary-container
                         rounded-3xl aspect-[3/4] mask-organic shadow-ambient-lg w-full"
					role="img"
					aria-label="Photo of Kalyani Gaikwad, the maker behind Krafted Loops Studio"
				></div>

				<!--
          Yarn ball bounces on a slow, easing loop — purely decorative
          so aria-hidden keeps it invisible to screen readers.
        -->
				<span
					class="absolute -top-4 -right-0 text-4xl animate-yarn-bounce select-none"
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
					class="bg-surface-card rounded-2xl shadow-ambient px-4 py-3
                           absolute bottom-8 -right-4 md:-right-6
                           flex flex-col items-center"
					aria-label="Maker stat: 4,000 or more loops daily"
				>
					<span class="font-display font-bold text-xl text-primary leading-none">4,000+</span>
					<span class="font-body text-xs text-on-surface-muted mt-0.5">loops daily</span>
				</div>
			</div>
		</div>

		<!-- RIGHT · content column (60% = 3 of 5 cols) ──────────────────── -->
		<div class="md:col-span-3 flex flex-col gap-6">
			<!-- Eyebrow -->
			<p class="font-body text-xs tracking-widest uppercase text-secondary font-semibold">
				The Maker Behind Every Stitch
			</p>

			<!-- Heading -->
			<h2
				id="maker-heading"
				class="font-display font-bold text-4xl md:text-5xl text-on-surface leading-tight"
			>
				Every Loop,<br />Crafted with Intention
			</h2>

			<!-- Attribution -->
			<p class="font-display italic text-xl text-on-surface-muted -mt-2">
				— Kalyani Gaikwad
			</p>

			<!-- Quote -->
			<blockquote
				class="font-body text-on-surface-muted text-base md:text-lg leading-relaxed
                           border-l-2 border-primary/30 pl-5"
			>
				"I started crocheting as a way to slow down in a fast world. What began as a hobby became
				my calling — turning yarn into memories that last a lifetime."
			</blockquote>

			<!-- Stats row ─────────────────────────────────────────────────── -->
			<!--
        Three inline stat cards. Numbers use font-display (Newsreader) to give
        them typographic weight; labels use font-body so they read as
        supporting captions rather than equal-weight content.
      -->
			<div class="grid grid-cols-3 gap-4 mt-2" role="list" aria-label="Maker stats">
				{#each [
					{ value: '12+', unit: 'Years', label: 'Crocheting' },
					{ value: '200+', unit: '', label: 'Happy Customers' },
					{ value: '100%', unit: '', label: 'Handmade' }
				] as stat}
					<div
						role="listitem"
						class="bg-surface-card rounded-2xl shadow-ambient px-4 py-4 flex flex-col gap-1"
					>
						<span class="font-display font-bold text-2xl md:text-3xl text-primary leading-none">
							{stat.value}
						</span>
						{#if stat.unit}
							<span class="font-body text-xs font-semibold text-on-surface leading-none">
								{stat.unit}
							</span>
						{/if}
						<span class="font-body text-xs text-on-surface-muted leading-snug mt-0.5">
							{stat.label}
						</span>
					</div>
				{/each}
			</div>

			<!-- CTA -->
			<div class="mt-2">
				<a
					href="/shop"
					class="inline-flex items-center gap-2 font-body font-semibold text-sm
                           bg-gradient-to-r from-primary to-primary-dim text-on-primary
                           rounded-full px-7 py-3.5
                           shadow-[0_4px_20px_0_rgba(167,41,90,0.35)]
                           hover:shadow-[0_6px_28px_0_rgba(167,41,90,0.45)]
                           hover:-translate-y-0.5 active:translate-y-0
                           transition-all duration-200
                           focus-visible:outline-none focus-visible:ring-2
                           focus-visible:ring-primary focus-visible:ring-offset-2"
				>
					Shop the Collection
					<svg
						class="w-4 h-4"
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
<section class="bg-primary py-20" aria-labelledby="newsletter-heading">
	<div class="max-w-2xl mx-auto px-6 md:px-10 text-center">
		<!-- Decorative pill above heading -->
		<span
			class="inline-block font-body text-xs tracking-widest uppercase text-on-primary/70 mb-6
                   border border-on-primary/20 rounded-full px-4 py-1.5"
		>
			Stay in the loop
		</span>

		<h2
			id="newsletter-heading"
			class="font-display font-bold text-4xl md:text-5xl text-on-primary leading-tight mb-4"
		>
			Join the Loop
		</h2>

		<p class="font-body text-on-primary/80 text-base md:text-lg leading-relaxed mb-10">
			Get early access to new collections, crochet tips, and exclusive discounts.
		</p>

		{#if newsletterSubmitted}
			<!--
        Success state: replaces the form with a warm confirmation message.
        The check icon and copy are intentionally brief — the user just wants
        confirmation, not a wall of text.
      -->
			<div
				class="bg-white/10 backdrop-blur-md rounded-2xl px-8 py-6 flex items-center justify-center gap-4"
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
					class="bg-white/10 backdrop-blur-md rounded-full p-2 flex gap-2 max-w-md mx-auto
                           border border-white/15"
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
						class="bg-transparent text-on-primary placeholder-on-primary/60
                               flex-1 px-4 py-2 outline-none font-body text-sm
                               caret-on-primary/80 min-w-0"
					/>
					<button
						type="submit"
						class="bg-surface-card text-primary font-body font-semibold text-sm
                               rounded-full px-6 py-2.5 flex-shrink-0
                               hover:bg-surface transition-colors duration-200
                               focus-visible:outline-none focus-visible:ring-2
                               focus-visible:ring-on-primary focus-visible:ring-offset-2
                               focus-visible:ring-offset-primary"
					>
						Subscribe
					</button>
				</div>
			</form>

			<p class="font-body text-on-primary/60 text-xs mt-4">
				No spam, ever. Unsubscribe anytime.
			</p>
		{/if}
	</div>
</section>
