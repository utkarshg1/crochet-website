<script lang="ts">
	import logoSvg from '$lib/assets/Krafted Loops Studio.svg';
	let showScrollTop = $state(false);

	// Show scroll-to-top button once user has scrolled down enough
	$effect(() => {
		function handleScroll() {
			showScrollTop = window.scrollY > 400;
		}
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	});

	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	const currentYear = new Date().getFullYear();

	const shopLinks = [
		{ label: 'All Products', href: '/shop' },
		{ label: 'New Arrivals', href: '/shop?filter=new' },
		{ label: 'Best Sellers', href: '/shop?filter=featured' },
		{ label: 'Gift Sets', href: '/shop?category=gift-sets' }
	];

	const infoLinks = [
		{ label: 'About Kalyani', href: '/about' },
		{ label: 'Contact', href: '/contact' },
		{ label: 'FAQ', href: '/faq' },
		{ label: 'Shipping & Returns', href: '/shipping' }
	];
</script>

<!--
  Footer uses bg-surface-low — one step darker than the main bg-surface.
  This creates separation from page content via background shift rather than
  a horizontal rule, consistent with the design rule.
-->
<footer class="bg-surface-low" aria-label="Site footer">
	<!-- ── Main 3-column grid ─────────────────────────────────────────────── -->
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">

			<!-- Column 1: Brand identity -->
			<div class="flex flex-col gap-5">
				<!-- Logo mark + name -->
				<a href="/" class="flex items-center gap-3 group w-fit">
					<img
						src={logoSvg}
						alt=""
						class="w-9 h-9 rounded-full shrink-0"
						aria-hidden="true"
					/>
					<span class="font-display font-semibold text-on-surface text-xl">
						Krafted Loops Studio
					</span>
				</a>

				<p class="text-xs text-on-surface-muted font-body mt-0.5">
					Website by <span class="text-on-surface-muted">Utkarsh Gaikwad</span>
				</p>

				<p class="text-on-surface-muted text-sm leading-relaxed">
					Handmade with love in India 🧶<br />
					Each piece is crafted by hand, made to last, and shipped with care.
				</p>

				<!-- Maker credit — personal touch that builds trust for a handcraft brand -->
				<p class="text-xs text-on-surface-muted">
					By <span class="font-semibold text-on-surface">Kalyani Gaikwad</span>,
					Pune, Maharashtra
				</p>

				<!-- Trust signal badges -->
				<div class="flex flex-wrap gap-2 mt-1">
					<span class="chip text-xs bg-secondary-container text-on-secondary-container px-3 py-1.5 font-medium">
						100% Handmade
					</span>
					<span class="chip text-xs bg-tertiary-container text-on-tertiary-container px-3 py-1.5 font-medium">
						Made in India
					</span>
				</div>
			</div>

			<!-- Column 2: Navigation links — split into shop + info -->
			<div class="grid grid-cols-2 gap-8">
				<div class="flex flex-col gap-4">
					<h3 class="font-display text-base font-semibold text-on-surface">Shop</h3>
					<ul class="flex flex-col gap-3" role="list">
						{#each shopLinks as link}
							<li>
								<a
									href={link.href}
									class="text-sm text-on-surface-muted hover:text-primary transition-colors duration-150"
								>
									{link.label}
								</a>
							</li>
						{/each}
					</ul>
				</div>

				<div class="flex flex-col gap-4">
					<h3 class="font-display text-base font-semibold text-on-surface">Info</h3>
					<ul class="flex flex-col gap-3" role="list">
						{#each infoLinks as link}
							<li>
								<a
									href={link.href}
									class="text-sm text-on-surface-muted hover:text-primary transition-colors duration-150"
								>
									{link.label}
								</a>
							</li>
						{/each}
					</ul>
				</div>
			</div>

			<!-- Column 3: Connect — social + newsletter teaser -->
			<div class="flex flex-col gap-5">
				<h3 class="font-display text-base font-semibold text-on-surface">Connect</h3>

				<!-- Social links -->
				<div class="flex flex-col gap-3">
					<a
						href="https://instagram.com/krafted_loops_studio"
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center gap-3 text-sm text-on-surface-muted hover:text-primary transition-colors duration-150 group"
					>
						<!-- Instagram inline SVG -->
						<span class="w-8 h-8 rounded-xl bg-surface-card flex items-center justify-center shadow-ambient group-hover:shadow-ambient-lg transition-shadow">
							<svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
								<rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
								<path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
								<line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
							</svg>
						</span>
						@krafted_loops_studio
					</a>

					<a
						href="https://etsy.com/shop/kraftedloops"
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center gap-3 text-sm text-on-surface-muted hover:text-primary transition-colors duration-150 group"
					>
						<span class="w-8 h-8 rounded-xl bg-surface-card flex items-center justify-center shadow-ambient group-hover:shadow-ambient-lg transition-shadow">
							<!-- Simple shopping bag icon to represent Etsy -->
							<svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
								<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
								<line x1="3" y1="6" x2="21" y2="6" />
								<path d="M16 10a4 4 0 01-8 0" />
							</svg>
						</span>
						Etsy Shop
					</a>
				</div>

				<!--
          Newsletter teaser — no full form here (would need server action).
          Copy leads users toward the dedicated newsletter section or page.
        -->
				<div class="rounded-2xl bg-surface-card p-4 shadow-ambient">
					<p class="font-display text-sm font-medium text-on-surface mb-1">
						Stay in the loop
					</p>
					<p class="text-xs text-on-surface-muted leading-relaxed mb-3">
						Get notified about new drops, behind-the-scenes yarn hauls, and exclusive offers.
					</p>
					<a
						href="/newsletter"
						class="
              inline-flex items-center gap-1.5 text-xs font-semibold
              text-primary hover:text-primary-dim transition-colors duration-150
              underline decoration-primary/40 underline-offset-2
            "
					>
						Subscribe →
					</a>
				</div>
			</div>
		</div>
	</div>

	<!--
    Bottom bar: slightly deeper background shift — bg-surface-high creates
    a subtle step without a visible line, reinforcing the layered depth.
  -->
	<div class="bg-surface-high">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
			<p class="text-xs text-on-surface-muted text-center sm:text-left">
				&copy; {currentYear} Krafted Loops Studio. All rights reserved.
			</p>
			<p class="text-xs text-on-surface-muted font-display italic">
				Every stitch tells a story.
			</p>
		</div>
	</div>
</footer>

<!--
  Scroll-to-top pill: floats above the page at bottom-right, appears after
  the user scrolls 400px. Primary gradient pill matches the main CTA style.
  Positioned fixed so it stays visible during scroll.
-->
{#if showScrollTop}
	<button
		onclick={scrollToTop}
		class="
      fixed bottom-6 right-6 z-40
      flex items-center gap-2 px-4 py-2.5
      bg-gradient-to-r from-primary to-primary-dim text-white
      rounded-full text-sm font-semibold shadow-ambient-lg
      hover:brightness-110 active:brightness-95
      transition-all duration-200
    "
		aria-label="Scroll back to top"
	>
		<svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
			<line x1="12" y1="19" x2="12" y2="5" />
			<polyline points="5 12 12 5 19 12" />
		</svg>
		Back to top
	</button>
{/if}
