<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import ProductCard from '$lib/components/ProductCard.svelte';
	import CategoryChip from '$lib/components/CategoryChip.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import type { PageData } from './$types';
	import type { Product, Category } from '$lib/types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	// Explicit types to work around Supabase join inference
	const products: Product[] = $derived(data.products as Product[]);
	const categories: Category[] = $derived(data.categories as Category[]);

	// ─── Local UI state ───────────────────────────────────────────────────────
	// Mobile filter drawer toggle
	let filtersOpen = $state(false);

	// Local copies of filter values so controls are reactive before navigation
	let selectedCategory = $state('');
	let selectedSort = $state('newest');
	let searchQuery = $state('');

	// Sync local state when data prop changes (e.g. after navigation)
	$effect(() => {
		selectedCategory = data.category ?? '';
		selectedSort = data.sort ?? 'newest';
		searchQuery = data.q ?? '';
	});

	// Price range — purely client-side filter applied on derived list
	let minPrice = $state<string>('');
	let maxPrice = $state<string>('');

	// Wishlist state — Set of product IDs the user has wishlisted
	let wishlistIds = $state(new Set<string>());

	$effect(() => {
		wishlistIds = new Set(data.wishlistIds as Set<string>);
	});

	function handleToggleWishlist(productId: string, isWishlisted: boolean) {
		wishlistIds = new Set(
			isWishlisted ? [...wishlistIds, productId] : [...wishlistIds].filter((id) => id !== productId)
		);
	}

	// ─── Derived values ───────────────────────────────────────────────────────
	// Whether any filter is currently active (used to show "Clear" button)
	const hasActiveFilters = $derived(
		selectedCategory !== '' ||
			selectedSort !== 'newest' ||
			searchQuery !== '' ||
			minPrice !== '' ||
			maxPrice !== ''
	);

	// Apply client-side price range filter on top of server-filtered list.
	const filteredProducts = $derived(() => {
		let list = products;
		const min = minPrice !== '' ? parseInt(minPrice, 10) * 100 : null;
		const max = maxPrice !== '' ? parseInt(maxPrice, 10) * 100 : null;
		if (min !== null) list = list.filter((p) => p.price_paise >= min);
		if (max !== null) list = list.filter((p) => p.price_paise <= max);
		return list;
	});

	// ─── Navigation helpers ───────────────────────────────────────────────────
	// Build a URL with the given params merged onto current ones. Any param set
	// to empty string is removed so URLs stay clean (no ?category=&sort=newest).
	function buildUrl(overrides: Record<string, string>): string {
		const params = new URLSearchParams($page.url.searchParams);
		for (const [key, value] of Object.entries(overrides)) {
			if (value === '') {
				params.delete(key);
			} else {
				params.set(key, value);
			}
		}
		const qs = params.toString();
		return qs ? `/shop?${qs}` : '/shop';
	}

	function applyCategory(slug: string) {
		selectedCategory = slug;
		goto(buildUrl({ category: slug }), { keepFocus: true });
		filtersOpen = false;
	}

	function applySort(value: string) {
		selectedSort = value;
		goto(buildUrl({ sort: value }), { keepFocus: true });
	}

	function clearFilters() {
		selectedCategory = '';
		selectedSort = 'newest';
		searchQuery = '';
		minPrice = '';
		maxPrice = '';
		goto('/shop');
	}

	// Search form submit (also handles Enter key via the form's GET method).
	// We intercept with JS to keep the SPA experience; fallback is the native form.
	function handleSearchSubmit(e: Event) {
		e.preventDefault();
		goto(buildUrl({ q: searchQuery }), { keepFocus: true });
	}

	// Close drawer when Escape is pressed
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && filtersOpen) filtersOpen = false;
	}
</script>

<svelte:head>
	<title>Shop — Krafted Loops Studio</title>
	<meta
		name="description"
		content="Browse our full collection of handmade crochet — baby items, forever flowers, purses, keychains, charms, wind spinners & more. Each piece is made to order with love."
	/>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<!-- ─── Page Header ─────────────────────────────────────────────────────────── -->
<section class="bg-surface-low px-4 py-16">
	<div class="mx-auto max-w-7xl">
		<!-- Breadcrumb -->
		<nav aria-label="Breadcrumb" class="mb-6">
			<ol class="flex items-center gap-2 font-body text-sm text-on-surface-muted">
				<li>
					<a href="/" class="transition-colors duration-200 hover:text-primary">Home</a>
				</li>
				<li aria-hidden="true" class="text-on-surface-muted/50">/</li>
				<li>
					<span class="font-semibold text-on-surface" aria-current="page">Shop</span>
				</li>
			</ol>
		</nav>

		<div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<h1 class="font-display text-5xl leading-tight text-on-surface sm:text-6xl">
					The Collection
				</h1>
				<p class="mt-2 font-body text-lg text-on-surface-muted">
					Handmade with care, one loop at a time.
				</p>
			</div>

			<!-- Product count — visible on desktop header, hidden on mobile (shown near grid) -->
			<p class="hidden font-body text-sm text-on-surface-muted sm:block">
				Showing <span class="font-semibold text-on-surface">{filteredProducts().length}</span>
				{filteredProducts().length === 1 ? 'piece' : 'pieces'}
			</p>
		</div>
	</div>
</section>

<!-- ─── Main Layout: Sidebar + Grid ──────────────────────────────────────────── -->
<div class="mx-auto max-w-7xl px-4 py-10">
	<div class="flex items-start gap-8">
		<!-- ─── Desktop Sidebar ─────────────────────────────────────────────────── -->
		<!--
			Width is fixed at 280px on desktop; on mobile it's hidden behind a drawer.
			Using sticky so it stays in view while the user scrolls the product grid.
		-->
		<aside
			class="sticky top-24 hidden w-[280px] flex-shrink-0 lg:block"
			aria-label="Product filters"
		>
			<div class="shadow-ambient flex flex-col gap-7 rounded-3xl bg-surface-card p-6">
				<!-- Sidebar heading -->
				<div class="flex items-center justify-between">
					<h2 class="font-display text-2xl text-on-surface">Filter</h2>
					{#if hasActiveFilters}
						<button
							onclick={clearFilters}
							class="font-body text-xs text-primary underline underline-offset-2 transition-colors duration-200 hover:text-primary-dim"
						>
							Clear all
						</button>
					{/if}
				</div>

				<!-- Category filter -->
				<div>
					<h3
						class="mb-3 font-body text-xs font-semibold tracking-widest text-on-surface-muted uppercase"
					>
						Category
					</h3>
					<div class="flex flex-col gap-2">
						<!-- "All" pseudo-chip — uses same visual style as CategoryChip -->
						<button
							onclick={() => applyCategory('')}
							class="
								chip inline-flex items-center px-4 py-2 text-left text-sm font-semibold
								transition-all duration-200
								{selectedCategory === ''
								? 'shadow-ambient bg-secondary text-white'
								: 'bg-secondary-container text-on-secondary-container hover:bg-secondary/20'}
							"
						>
							All Products
						</button>
						{#each categories as cat (cat.id)}
							<CategoryChip category={cat} active={selectedCategory === cat.slug} />
						{/each}
					</div>
				</div>

				<!-- Sort -->
				<div>
					<label
						for="sort-select"
						class="mb-3 block font-body text-xs font-semibold tracking-widest text-on-surface-muted uppercase"
					>
						Sort by
					</label>
					<select
						id="sort-select"
						value={selectedSort}
						onchange={(e) => applySort((e.currentTarget as HTMLSelectElement).value)}
						class="
							w-full cursor-pointer rounded-xl border border-on-surface/10
							bg-surface-high px-3 py-2.5 font-body text-sm
							text-on-surface transition-colors duration-200
							focus:ring-2 focus:ring-primary/40 focus:outline-none
						"
					>
						<option value="newest">Newest</option>
						<option value="price_asc">Price: Low to High</option>
						<option value="price_desc">Price: High to Low</option>
						<option value="featured">Featured</option>
					</select>
				</div>

				<!-- Price range -->
				<div>
					<h3
						class="mb-3 font-body text-xs font-semibold tracking-widest text-on-surface-muted uppercase"
					>
						Price Range (₹)
					</h3>
					<div class="flex items-center gap-2">
						<input
							type="number"
							placeholder="Min"
							bind:value={minPrice}
							min="0"
							class="
								w-full rounded-xl border border-on-surface/10 bg-surface-high
								px-3 py-2.5 font-body text-sm text-on-surface
								transition-colors duration-200 placeholder:text-on-surface-muted/60
								focus:ring-2
								focus:ring-primary/40 focus:outline-none
							"
						/>
						<span class="flex-shrink-0 font-body text-sm text-on-surface-muted">to</span>
						<input
							type="number"
							placeholder="Max"
							bind:value={maxPrice}
							min="0"
							class="
								w-full rounded-xl border border-on-surface/10 bg-surface-high
								px-3 py-2.5 font-body text-sm text-on-surface
								transition-colors duration-200 placeholder:text-on-surface-muted/60
								focus:ring-2
								focus:ring-primary/40 focus:outline-none
							"
						/>
					</div>
				</div>

				<!-- Clear filters — also shown inside sidebar for discoverability -->
				{#if hasActiveFilters}
					<Button variant="ghost" onclick={clearFilters} class="w-full justify-center text-sm">
						Clear Filters
					</Button>
				{/if}
			</div>
		</aside>

		<!-- ─── Product Grid Column ──────────────────────────────────────────────── -->
		<div class="min-w-0 flex-1">
			<!-- Search + mobile filter row -->
			<div class="mb-6 flex items-center gap-3">
				<!-- Search bar — GET form so it works without JS too -->
				<form
					method="GET"
					action="/shop"
					onsubmit={handleSearchSubmit}
					class="flex-1"
					role="search"
				>
					<div class="relative">
						<!-- Magnifying glass icon -->
						<svg
							class="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-on-surface-muted"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<circle cx="11" cy="11" r="8" />
							<path d="m21 21-4.35-4.35" />
						</svg>
						<input
							type="search"
							name="q"
							placeholder="Search pieces…"
							bind:value={searchQuery}
							class="
								w-full rounded-full border border-on-surface/10 bg-surface-high py-2.5
								pr-4 pl-10 font-body
								text-sm text-on-surface
								transition-all duration-200 placeholder:text-on-surface-muted/60
								focus:ring-2
								focus:ring-primary/40 focus:outline-none
							"
							aria-label="Search products"
						/>
					</div>
				</form>

				<!-- Mobile: "Filters" button — only visible below lg breakpoint -->
				<button
					onclick={() => (filtersOpen = true)}
					class="
						shadow-ambient hover:shadow-ambient-lg flex items-center gap-2 rounded-full border border-on-surface/10
						bg-surface-card px-4 py-2.5 font-body text-sm
						font-semibold text-on-surface transition-shadow
						duration-200 lg:hidden
					"
					aria-expanded={filtersOpen}
					aria-controls="mobile-filter-panel"
				>
					<!-- Filter icon -->
					<svg
						class="h-4 w-4"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<line x1="4" y1="6" x2="20" y2="6" />
						<line x1="8" y1="12" x2="16" y2="12" />
						<line x1="11" y1="18" x2="13" y2="18" />
					</svg>
					Filters
					{#if hasActiveFilters}
						<!--
							Small dot indicator when filters are active — tells the user
							something is narrowing the results without needing a number badge.
						-->
						<span class="h-2 w-2 flex-shrink-0 rounded-full bg-primary" aria-label="Filters active"
						></span>
					{/if}
				</button>
			</div>

			<!-- Product count — mobile only (desktop is in the header) -->
			<p class="mb-5 font-body text-sm text-on-surface-muted sm:hidden">
				Showing <span class="font-semibold text-on-surface">{filteredProducts().length}</span>
				{filteredProducts().length === 1 ? 'piece' : 'pieces'}
			</p>

			<!-- ─── Product Grid ────────────────────────────────────────────────── -->
			{#if filteredProducts().length > 0}
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{#each filteredProducts() as product (product.id)}
						<ProductCard
							{product}
							wishlisted={wishlistIds.has(product.id)}
							onToggleWishlist={handleToggleWishlist}
						/>
					{/each}
				</div>
			{:else}
				<!--
					Empty state: warm, brand-consistent — never a cold "No results found".
					The crochet hook emoji ties it back to the craft context.
				-->
				<div class="flex flex-col items-center justify-center gap-6 py-24 text-center">
					<span class="text-6xl" role="img" aria-label="Crochet hook">🪝</span>
					<div>
						<p class="mb-2 font-display text-2xl text-on-surface">No pieces found</p>
						<p class="max-w-xs font-body text-sm text-on-surface-muted">
							We couldn't find anything matching your search. Try adjusting your filters or browse
							everything.
						</p>
					</div>
					<Button variant="primary" href="/shop" onclick={clearFilters}>Browse All</Button>
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- ─── Mobile Filter Drawer ──────────────────────────────────────────────────
	 Rendered outside the main layout flow so it overlays everything correctly.
	 Uses inert on the backdrop click to close, focus-trapped within the panel.
──────────────────────────────────────────────────────────────────────────────── -->
{#if filtersOpen}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 z-40 bg-on-surface/40 backdrop-blur-sm lg:hidden"
		onclick={() => (filtersOpen = false)}
		aria-hidden="true"
	></div>

	<!-- Drawer panel -->
	<div
		id="mobile-filter-panel"
		role="dialog"
		aria-modal="true"
		aria-label="Product filters"
		class="
			shadow-ambient-lg pb-safe-bottom animate-slide-up fixed right-0 bottom-0
			left-0 z-50 max-h-[85vh]
			overflow-y-auto rounded-t-3xl
			bg-surface-card p-6
			lg:hidden
		"
	>
		<!-- Drag handle -->
		<div class="mb-6 flex justify-center">
			<div class="h-1 w-10 rounded-full bg-on-surface/20"></div>
		</div>

		<div class="mb-6 flex items-center justify-between">
			<h2 class="font-display text-2xl text-on-surface">Filters</h2>
			<button
				onclick={() => (filtersOpen = false)}
				class="flex h-8 w-8 items-center justify-center rounded-full bg-surface-high text-on-surface-muted transition-colors hover:text-on-surface"
				aria-label="Close filters"
			>
				<svg
					class="h-4 w-4"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M18 6 6 18M6 6l12 12" />
				</svg>
			</button>
		</div>

		<div class="flex flex-col gap-7">
			<!-- Category -->
			<div>
				<h3
					class="mb-3 font-body text-xs font-semibold tracking-widest text-on-surface-muted uppercase"
				>
					Category
				</h3>
				<div class="flex flex-wrap gap-2">
					<button
						onclick={() => applyCategory('')}
						class="
							chip inline-flex items-center px-4 py-2 text-sm font-semibold
							transition-all duration-200
							{selectedCategory === ''
							? 'shadow-ambient bg-secondary text-white'
							: 'bg-secondary-container text-on-secondary-container hover:bg-secondary/20'}
						"
					>
						All Products
					</button>
					{#each categories as cat (cat.id)}
						<CategoryChip category={cat} active={selectedCategory === cat.slug} />
					{/each}
				</div>
			</div>

			<!-- Sort -->
			<div>
				<label
					for="mobile-sort-select"
					class="mb-3 block font-body text-xs font-semibold tracking-widest text-on-surface-muted uppercase"
				>
					Sort by
				</label>
				<select
					id="mobile-sort-select"
					value={selectedSort}
					onchange={(e) => applySort((e.currentTarget as HTMLSelectElement).value)}
					class="
						w-full cursor-pointer rounded-xl border border-on-surface/10
						bg-surface-high px-3 py-2.5 font-body text-sm
						text-on-surface transition-colors duration-200
						focus:ring-2 focus:ring-primary/40 focus:outline-none
					"
				>
					<option value="newest">Newest</option>
					<option value="price_asc">Price: Low to High</option>
					<option value="price_desc">Price: High to Low</option>
					<option value="featured">Featured</option>
				</select>
			</div>

			<!-- Price range -->
			<div>
				<h3
					class="mb-3 font-body text-xs font-semibold tracking-widest text-on-surface-muted uppercase"
				>
					Price Range (₹)
				</h3>
				<div class="flex items-center gap-2">
					<input
						type="number"
						placeholder="Min"
						bind:value={minPrice}
						min="0"
						class="
							w-full rounded-xl border border-on-surface/10 bg-surface-high
							px-3 py-2.5 font-body text-sm text-on-surface
							placeholder:text-on-surface-muted/60 focus:ring-2 focus:ring-primary/40
							focus:outline-none
						"
					/>
					<span class="flex-shrink-0 font-body text-sm text-on-surface-muted">to</span>
					<input
						type="number"
						placeholder="Max"
						bind:value={maxPrice}
						min="0"
						class="
							w-full rounded-xl border border-on-surface/10 bg-surface-high
							px-3 py-2.5 font-body text-sm text-on-surface
							placeholder:text-on-surface-muted/60 focus:ring-2 focus:ring-primary/40
							focus:outline-none
						"
					/>
				</div>
			</div>

			<!-- Action row -->
			<div class="flex gap-3 pt-2">
				{#if hasActiveFilters}
					<Button variant="secondary" onclick={clearFilters} class="flex-1 justify-center">
						Clear All
					</Button>
				{/if}
				<Button
					variant="primary"
					onclick={() => (filtersOpen = false)}
					class="flex-1 justify-center"
				>
					View Results
				</Button>
			</div>
		</div>
	</div>
{/if}

<style>
	/*
		Bottom sheet slide-up animation for the mobile filter drawer.
		Defined here (not in layout.css) because it's scoped to this page.
	*/
	@keyframes slide-up {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}

	.animate-slide-up {
		animation: slide-up 0.32s cubic-bezier(0.22, 1, 0.36, 1);
	}

	/* Safe bottom area for notched phones */
	.pb-safe-bottom {
		padding-bottom: max(1.5rem, env(safe-area-inset-bottom));
	}
</style>
