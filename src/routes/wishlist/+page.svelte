<script lang="ts">
	import ProductCard from '$lib/components/ProductCard.svelte';
	import type { PageData } from './$types';
	import type { WishlistItem } from '$lib/types';

	let { data }: { data: PageData } = $props();

	const wishlistItems: WishlistItem[] = $derived(data.wishlistItems as WishlistItem[]);
</script>

<svelte:head>
	<title>Wishlist — Krafted Loops Studio</title>
	<meta name="description" content="Your saved crochet pieces — items you love, all in one place." />
</svelte:head>

<section class="bg-surface-low py-16 px-4">
	<div class="max-w-7xl mx-auto">
		<nav aria-label="Breadcrumb" class="mb-6">
			<ol class="flex items-center gap-2 text-sm font-body text-on-surface-muted">
				<li><a href="/" class="hover:text-primary transition-colors duration-200">Home</a></li>
				<li aria-hidden="true" class="text-on-surface-muted/50">/</li>
				<li><span class="text-on-surface font-semibold" aria-current="page">Wishlist</span></li>
			</ol>
		</nav>

		<div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
			<div>
				<h1 class="font-display text-5xl sm:text-6xl text-on-surface leading-tight">Your Wishlist</h1>
				{#if data.user && wishlistItems.length > 0}
					<p class="mt-2 font-body text-on-surface-muted text-lg">
						{wishlistItems.length} {wishlistItems.length === 1 ? 'piece' : 'pieces'} you love.
					</p>
				{/if}
			</div>
		</div>
	</div>
</section>

<section class="bg-surface py-10 min-h-[50vh]">
	<div class="max-w-7xl mx-auto px-4">
		{#if data.user}
			{#if wishlistItems.length > 0}
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each wishlistItems as item (item.id)}
						{#if item.product}
							<ProductCard product={item.product} />
						{/if}
					{/each}
				</div>
			{:else}
				<div class="flex flex-col items-center justify-center py-24 gap-6 text-center">
					<span class="text-6xl" role="img" aria-label="Heart">♡</span>
					<div>
						<p class="font-display text-2xl text-on-surface mb-2">Your wishlist is empty</p>
						<p class="font-body text-on-surface-muted text-sm max-w-xs">
							When you find a piece that speaks to you, tap the heart to save it for later.
						</p>
					</div>
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
						Browse the Shop
						<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
							<path d="M5 12h14M12 5l7 7-7 7" />
						</svg>
					</a>
				</div>
			{/if}
		{:else}
			<div class="flex flex-col items-center justify-center py-24 gap-6 text-center">
				<span class="text-6xl" role="img" aria-label="Heart">♡</span>
				<div>
					<p class="font-display text-2xl text-on-surface mb-2">Sign in to view your wishlist</p>
					<p class="font-body text-on-surface-muted text-sm max-w-xs">
						Create an account or sign in to save your favorite pieces and pick up where you left off.
					</p>
				</div>
				<a
					href="/account"
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
					Sign In
				</a>
			</div>
		{/if}
	</div>
</section>
