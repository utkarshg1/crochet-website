<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { cart } from '$lib/cart.svelte';
	import CartDrawer from '$lib/components/CartDrawer.svelte';

	// Local UI state
	let cartOpen = $state(false);
	let mobileMenuOpen = $state(false);

	// Current pathname for active link detection
	const currentPath = $derived($page.url.pathname);

	const navLinks = [
		{ label: 'Home', href: '/' },
		{ label: 'Shop', href: '/shop' },
		{ label: 'About', href: '/about' }
	];

	function isActive(href: string): boolean {
		if (href === '/') return currentPath === '/';
		return currentPath.startsWith(href);
	}

	// Initialise cart from localStorage once we're in the browser
	onMount(() => {
		cart.init();
	});

	// Close mobile menu on route change
	$effect(() => {
		// Reading currentPath creates a reactive dependency
		currentPath;
		mobileMenuOpen = false;
	});
</script>

<!--
  Nav is fixed so it stays on screen during scroll.
  .glass gives the frosted background defined in layout.css — we don't
  add a bottom border, just the ambient shadow so it lifts off the page naturally.
-->
<header class="fixed top-0 left-0 right-0 z-50 glass shadow-ambient">
	<nav class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
		<div class="flex h-16 items-center justify-between gap-4">

			<!-- ── Logo + Brand name ──────────────────────────────────────────── -->
			<a href="/" class="flex items-center gap-3 shrink-0 group">
				<!--
          Inline SVG yarn ball — no external dep, no flash of missing icon.
          The winding lines subtly rotate on hover to hint at motion.
        -->
				<svg
					width="32"
					height="32"
					viewBox="0 0 48 48"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					class="shrink-0 group-hover:rotate-12 transition-transform duration-300"
					aria-hidden="true"
				>
					<circle cx="24" cy="24" r="20" fill="#a7295a" opacity="0.15" />
					<circle cx="24" cy="24" r="20" stroke="#a7295a" stroke-width="2.5" fill="none" />
					<!-- Winding yarn strands -->
					<path
						d="M10 30 Q24 14 38 30"
						stroke="#a7295a"
						stroke-width="2"
						fill="none"
						stroke-linecap="round"
					/>
					<path
						d="M8 22 Q24 8 40 22"
						stroke="#a7295a"
						stroke-width="1.5"
						fill="none"
						stroke-linecap="round"
						opacity="0.6"
					/>
					<path
						d="M12 36 Q24 28 36 36"
						stroke="#a7295a"
						stroke-width="1.5"
						fill="none"
						stroke-linecap="round"
						opacity="0.5"
					/>
					<!-- Yarn tail -->
					<path
						d="M38 24 Q44 20 42 14"
						stroke="#00675d"
						stroke-width="2"
						fill="none"
						stroke-linecap="round"
					/>
				</svg>
				<span
					class="font-display font-semibold text-on-surface text-lg leading-tight hidden sm:block"
				>
					Krafted Loops Studio
				</span>
				<!-- Short name on small screens -->
				<span class="font-display font-semibold text-on-surface text-lg leading-tight sm:hidden">
					Krafted Loops
				</span>
			</a>

			<!-- ── Desktop centre nav ─────────────────────────────────────────── -->
			<ul class="hidden md:flex items-center gap-8" role="list">
				{#each navLinks as link}
					<li>
						<a
							href={link.href}
							class="
                font-body font-medium text-base transition-colors duration-200
                {isActive(link.href)
								? 'text-primary'
								: 'text-on-surface hover:text-primary'}
                relative
              "
							aria-current={isActive(link.href) ? 'page' : undefined}
						>
							{link.label}
							<!--
                Active underline: a thin primary-colored bar beneath the link.
                Keeps the active state visible without the link looking bolded
                or differently sized (which would cause layout shift).
              -->
							{#if isActive(link.href)}
								<span
									class="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-primary"
									aria-hidden="true"
								></span>
							{/if}
						</a>
					</li>
				{/each}
			</ul>

			<!-- ── Right action icons ─────────────────────────────────────────── -->
			<div class="flex items-center gap-1">
				<!-- Search -->
				<a
					href="/shop?q="
					class="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-muted hover:text-on-surface hover:bg-surface-high transition-all duration-150"
					aria-label="Search products"
				>
					<svg
						viewBox="0 0 24 24"
						class="w-5 h-5"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<circle cx="11" cy="11" r="8" />
						<line x1="21" y1="21" x2="16.65" y2="16.65" />
					</svg>
				</a>

				<!-- Wishlist -->
				<a
					href="/wishlist"
					class="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-muted hover:text-on-surface hover:bg-surface-high transition-all duration-150"
					aria-label="Wishlist"
				>
					<svg
						viewBox="0 0 24 24"
						class="w-5 h-5"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path
							d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
						/>
					</svg>
				</a>

				<!-- Cart button with item count badge -->
				<button
					onclick={() => (cartOpen = true)}
					class="relative w-10 h-10 rounded-full flex items-center justify-center text-on-surface-muted hover:text-on-surface hover:bg-surface-high transition-all duration-150"
					aria-label="Open bag — {cart.count} {cart.count === 1 ? 'item' : 'items'}"
				>
					<svg
						viewBox="0 0 24 24"
						class="w-5 h-5"
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

					<!--
            Count badge: only visible when there are items.
            Positioned top-right of the icon button, small primary circle.
            Using aria-hidden because the aria-label on the button already
            announces the count to screen readers.
          -->
					{#if cart.count > 0}
						<span
							class="
                absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px]
                bg-primary text-white text-[10px] font-bold
                rounded-full flex items-center justify-center px-1
                pointer-events-none
              "
							aria-hidden="true"
						>
							{cart.count > 99 ? '99+' : cart.count}
						</span>
					{/if}
				</button>

				<!-- Mobile hamburger — only visible below md breakpoint -->
				<button
					onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
					class="md:hidden w-10 h-10 rounded-full flex items-center justify-center text-on-surface-muted hover:text-on-surface hover:bg-surface-high transition-all duration-150 ml-1"
					aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
					aria-expanded={mobileMenuOpen}
				>
					{#if mobileMenuOpen}
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
					{:else}
						<svg
							viewBox="0 0 24 24"
							class="w-5 h-5"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
						>
							<line x1="3" y1="6" x2="21" y2="6" />
							<line x1="3" y1="12" x2="21" y2="12" />
							<line x1="3" y1="18" x2="21" y2="18" />
						</svg>
					{/if}
				</button>
			</div>
		</div>

		<!-- ── Mobile dropdown menu ───────────────────────────────────────────── -->
		<!--
      Slides down by animating max-height from 0 to auto via CSS.
      Using overflow-hidden + max-h transition is the GPU-safe way to do
      height-based reveals without JS measurements.
    -->
		{#if mobileMenuOpen}
			<div
				class="md:hidden border-t border-on-surface/5 py-4"
			>
				<ul class="flex flex-col gap-1" role="list">
					{#each navLinks as link}
						<li>
							<a
								href={link.href}
								class="
                  flex items-center px-3 py-3 rounded-xl font-body font-medium text-base
                  transition-colors duration-150
                  {isActive(link.href)
									? 'bg-primary/10 text-primary'
									: 'text-on-surface hover:bg-surface-high hover:text-primary'}
                "
								aria-current={isActive(link.href) ? 'page' : undefined}
							>
								{link.label}
							</a>
						</li>
					{/each}
					<!-- Extra mobile links -->
					<li>
						<a
							href="/wishlist"
							class="flex items-center px-3 py-3 rounded-xl font-body font-medium text-base text-on-surface hover:bg-surface-high hover:text-primary transition-colors duration-150"
						>
							Wishlist
						</a>
					</li>
				</ul>
			</div>
		{/if}
	</nav>
</header>

<!-- Cart drawer — rendered outside the nav so it sits in the stacking context root -->
<CartDrawer open={cartOpen} onClose={() => (cartOpen = false)} />
