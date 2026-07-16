<script lang="ts">
	import ProductCard from '$lib/components/ProductCard.svelte';
	import type { PageData } from './$types';
	import type { WishlistItem } from '$lib/types';

	let { data }: { data: PageData } = $props();

	const wishlistItems: WishlistItem[] = $derived(data.wishlistItems as WishlistItem[]);
</script>

<svelte:head>
	<title>Wishlist — Krafted Loops Studio</title>
	<meta
		name="description"
		content="Your saved crochet pieces — items you love, all in one place."
	/>
</svelte:head>

<section class="bg-surface-low px-4 py-16">
	<div class="mx-auto max-w-7xl">
		<nav aria-label="Breadcrumb" class="mb-6">
			<ol class="flex items-center gap-2 font-body text-sm text-on-surface-muted">
				<li><a href="/" class="transition-colors duration-200 hover:text-primary">Home</a></li>
				<li aria-hidden="true" class="text-on-surface-muted/50">/</li>
				<li><span class="font-semibold text-on-surface" aria-current="page">Wishlist</span></li>
			</ol>
		</nav>

		<div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<h1 class="font-display text-4xl font-semibold text-on-surface">Your Wishlist</h1>
				{#if data.user && wishlistItems.length > 0}
					<p class="mt-2 font-body text-lg text-on-surface-muted">
						{wishlistItems.length}
						{wishlistItems.length === 1 ? 'piece' : 'pieces'} you love.
					</p>
				{/if}
			</div>
		</div>
	</div>
</section>

<section class="min-h-[50vh] bg-surface py-10">
	<div class="mx-auto max-w-7xl px-4">
		{#if data.user}
			{#if wishlistItems.length > 0}
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{#each wishlistItems as item (item.id)}
						{#if item.product}
							<ProductCard product={item.product} />
						{/if}
					{/each}
				</div>
			{:else}
				<div class="flex flex-col items-center justify-center gap-6 py-24 text-center">
					<span class="text-6xl" role="img" aria-label="Heart">♡</span>
					<div>
						<p class="mb-2 font-display text-2xl text-on-surface">Your wishlist is empty</p>
						<p class="max-w-xs font-body text-sm text-on-surface-muted">
							When you find a piece that speaks to you, tap the heart to save it for later.
						</p>
					</div>
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
						Browse the Shop
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
			{/if}
		{:else}
			<div class="flex flex-col items-center justify-center gap-6 py-24 text-center">
				<span class="text-6xl" role="img" aria-label="Heart">♡</span>
				<div>
					<p class="mb-2 font-display text-2xl text-on-surface">Sign in to view your wishlist</p>
					<p class="max-w-xs font-body text-sm text-on-surface-muted">
						Create an account or sign in to save your favorite pieces and pick up where you left
						off.
					</p>
				</div>
				<a
					href="/account"
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
					Sign In
				</a>
			</div>
		{/if}
	</div>
</section>
