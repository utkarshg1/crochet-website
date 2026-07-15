<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { cart } from '$lib/cart.svelte';
	import CartDrawer from '$lib/components/CartDrawer.svelte';
	import logoSvg from '$lib/assets/Krafted Loops Studio.svg';

	// Local UI state
	let cartOpen = $state(false);
	let mobileMenuOpen = $state(false);

	// Current pathname for active link detection
	const currentPath = $derived($page.url.pathname);
	const user = $derived($page.data.user);

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
<header class="glass shadow-ambient fixed top-0 right-0 left-0 z-50">
	<nav class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
		<div class="flex h-16 items-center justify-between gap-4">
			<!-- ── Logo + Brand name ──────────────────────────────────────────── -->
			<a href="/" class="group flex shrink-0 items-center gap-3">
				<img
					src={logoSvg}
					alt=""
					class="h-9 w-9 shrink-0 rounded-full transition-all duration-700 hover:scale-105 hover:rotate-[-8deg]"
					aria-hidden="true"
				/>
				<span
					class="hidden font-display text-lg leading-tight font-semibold text-on-surface sm:block"
				>
					Krafted Loops Studio
				</span>
				<!-- Short name on small screens -->
				<span class="font-display text-lg leading-tight font-semibold text-on-surface sm:hidden">
					Krafted Loops
				</span>
			</a>

			<!-- ── Desktop centre nav ─────────────────────────────────────────── -->
			<ul class="hidden items-center gap-8 md:flex" role="list">
				{#each navLinks as link}
					<li>
						<a
							href={link.href}
							class="
                font-body text-base font-medium transition-colors duration-200
                {isActive(link.href) ? 'text-primary' : 'text-on-surface hover:text-primary'}
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
									class="absolute right-0 -bottom-1 left-0 h-0.5 rounded-full bg-primary"
									aria-hidden="true"
								></span>
							{/if}
						</a>
					</li>
				{/each}
			</ul>

			<!-- ── Right action icons (desktop: labelled, mobile: compact) ────── -->
			<div class="flex items-center gap-1">
				<!-- ── Desktop: icon + label buttons ──────────────────────────── -->
				<!-- Search -->
				<a
					href="/shop?q="
					class="hidden flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-on-surface-muted
						   transition-all duration-150 hover:bg-surface-high
						   hover:text-on-surface md:flex"
					aria-label="Search products"
				>
					<svg
						viewBox="0 0 24 24"
						class="h-5 w-5"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<circle cx="11" cy="11" r="8" />
						<line x1="21" y1="21" x2="16.65" y2="16.65" />
					</svg>
					<span class="font-body text-[11px] leading-none font-medium">Search</span>
				</a>

				<!-- Wishlist -->
				<a
					href="/wishlist"
					class="hidden flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-on-surface-muted
						   transition-all duration-150 hover:bg-surface-high
						   hover:text-on-surface md:flex"
					aria-label="Wishlist"
				>
					<svg
						viewBox="0 0 24 24"
						class="h-5 w-5"
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
					<span class="font-body text-[11px] leading-none font-medium">Wishlist</span>
				</a>

				<!-- Account / Login -->
				<a
					href="/account"
					class="hidden flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 transition-all duration-150 md:flex
						{user
						? 'text-on-surface-muted hover:bg-surface-high hover:text-on-surface'
						: 'bg-gradient-to-r from-primary to-primary-dim text-on-primary shadow-[0_2px_12px_0_rgba(167,41,90,0.3)] hover:-translate-y-0.5 hover:shadow-[0_4px_16px_0_rgba(167,41,90,0.4)]'}"
					aria-label={user ? 'My account' : 'Sign in'}
				>
					{#if user}
						<svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor">
							<path
								d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"
							/>
						</svg>
					{:else}
						<svg
							viewBox="0 0 24 24"
							class="h-5 w-5"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
							<circle cx="12" cy="7" r="4" />
						</svg>
					{/if}
					<span class="font-body text-[11px] leading-none font-medium"
						>{user ? 'Account' : 'Login'}</span
					>
				</a>

				<!-- Bag (cart) -->
				<button
					onclick={() => (cartOpen = true)}
					class="relative hidden flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-on-surface-muted
						   transition-all duration-150 hover:bg-surface-high
						   hover:text-on-surface md:flex"
					aria-label="Open bag — {cart.count} {cart.count === 1 ? 'item' : 'items'}"
				>
					<svg
						viewBox="0 0 24 24"
						class="h-5 w-5"
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
					<span class="font-body text-[11px] leading-none font-medium">Bag</span>
					{#if cart.count > 0}
						<span
							class="pointer-events-none absolute top-0 right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white"
							aria-hidden="true"
						>
							{cart.count > 99 ? '99+' : cart.count}
						</span>
					{/if}
				</button>

				<!-- ── Mobile: compact icons (no labels) ──────────────────────── -->
				<a
					href="/shop?q="
					class="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-muted transition-all duration-150 hover:bg-surface-high hover:text-on-surface md:hidden"
					aria-label="Search products"
				>
					<svg
						viewBox="0 0 24 24"
						class="h-5 w-5"
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

				<a
					href="/wishlist"
					class="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-muted transition-all duration-150 hover:bg-surface-high hover:text-on-surface md:hidden"
					aria-label="Wishlist"
				>
					<svg
						viewBox="0 0 24 24"
						class="h-5 w-5"
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

				<a
					href="/account"
					class="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-150 md:hidden
						{currentPath.startsWith('/account')
						? 'bg-primary/10 text-primary'
						: 'bg-gradient-to-r from-primary to-primary-dim text-on-primary shadow-[0_2px_12px_0_rgba(167,41,90,0.3)]'}"
					aria-label={user ? 'My account' : 'Sign in'}
				>
					{#if user}
						<svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor">
							<path
								d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"
							/>
						</svg>
					{:else}
						<svg
							viewBox="0 0 24 24"
							class="h-5 w-5"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
							<circle cx="12" cy="7" r="4" />
						</svg>
					{/if}
				</a>

				<button
					onclick={() => (cartOpen = true)}
					class="relative flex h-10 w-10 items-center justify-center rounded-full text-on-surface-muted transition-all duration-150 hover:bg-surface-high hover:text-on-surface md:hidden"
					aria-label="Open bag — {cart.count} {cart.count === 1 ? 'item' : 'items'}"
				>
					<svg
						viewBox="0 0 24 24"
						class="h-5 w-5"
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
					{#if cart.count > 0}
						<span
							class="pointer-events-none absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white"
							aria-hidden="true"
						>
							{cart.count > 99 ? '99+' : cart.count}
						</span>
					{/if}
				</button>

				<!-- Mobile hamburger -->
				<button
					onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
					class="ml-1 flex h-10 w-10 items-center justify-center rounded-full text-on-surface-muted transition-all duration-150 hover:bg-surface-high hover:text-on-surface md:hidden"
					aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
					aria-expanded={mobileMenuOpen}
				>
					{#if mobileMenuOpen}
						<svg
							viewBox="0 0 24 24"
							class="h-5 w-5"
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
							class="h-5 w-5"
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
			<div class="border-t border-on-surface/5 py-4 md:hidden">
				<ul class="flex flex-col gap-1" role="list">
					{#each navLinks as link}
						<li>
							<a
								href={link.href}
								class="
                  flex items-center rounded-xl px-3 py-3 font-body text-base font-medium
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
							href="/account"
							class="flex items-center rounded-xl px-3 py-3 font-body text-base font-medium transition-colors duration-150
								{currentPath.startsWith('/account')
								? 'bg-primary/10 text-primary'
								: 'text-on-surface hover:bg-surface-high hover:text-primary'}"
						>
							{user ? 'My Account' : 'Sign In'}
						</a>
					</li>
					<li>
						<a
							href="/wishlist"
							class="flex items-center rounded-xl px-3 py-3 font-body text-base font-medium text-on-surface transition-colors duration-150 hover:bg-surface-high hover:text-primary"
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
