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
	<div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
		<div class="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-16">
			<!-- Column 1: Brand identity -->
			<div class="flex flex-col gap-5">
				<!-- Logo mark + name -->
				<a href="/" class="group flex w-fit items-center gap-3">
					<img src={logoSvg} alt="" class="h-9 w-9 shrink-0 rounded-full" aria-hidden="true" />
					<span class="font-display text-xl font-semibold text-on-surface">
						Krafted Loops Studio
					</span>
				</a>

				<p class="mt-0.5 font-body text-xs text-on-surface-muted">
					Website by <span class="text-on-surface-muted">Utkarsh Gaikwad</span>
				</p>

				<p class="text-sm leading-relaxed text-on-surface-muted">
					Handmade with love in India 🧶<br />
					Each piece is crafted by hand, made to last, and shipped with care.
				</p>

				<!-- Maker credit — personal touch that builds trust for a handcraft brand -->
				<p class="text-xs text-on-surface-muted">
					By <span class="font-semibold text-on-surface">Kalyani Gaikwad</span>, Pune, Maharashtra
				</p>

				<!-- Trust signal badges -->
				<div class="mt-1 flex flex-wrap gap-2">
					<span
						class="chip bg-secondary-container px-3 py-1.5 text-xs font-medium text-on-secondary-container"
					>
						100% Handmade
					</span>
					<span
						class="chip bg-tertiary-container px-3 py-1.5 text-xs font-medium text-on-tertiary-container"
					>
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
									class="text-sm text-on-surface-muted transition-colors duration-150 hover:text-primary"
								>
									{link.label}
								</a>
							</li>
						{/each}
					</ul>
				</div>

				<div class="flex flex-col gap-6">
					<div class="flex flex-col gap-4">
						<h3 class="font-display text-base font-semibold text-on-surface">Info</h3>
						<ul class="flex flex-col gap-3" role="list">
							{#each infoLinks as link}
								<li>
									<a
										href={link.href}
										class="text-sm text-on-surface-muted transition-colors duration-150 hover:text-primary"
									>
										{link.label}
									</a>
								</li>
							{/each}
						</ul>
					</div>

					<div class="flex flex-col gap-4">
						<h3 class="font-display text-base font-semibold text-on-surface">Contact Us</h3>
						<ul class="flex flex-col gap-3" role="list">
							<li>
								<a
									href="mailto:kraftedloopstudio@gmail.com"
									class="flex items-center gap-2 text-sm text-on-surface-muted transition-colors duration-150 hover:text-primary"
								>
									<svg
										viewBox="0 0 24 24"
										class="h-4 w-4 shrink-0"
										fill="none"
										stroke="currentColor"
										stroke-width="1.75"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<rect x="2" y="4" width="20" height="16" rx="2" />
										<path d="M22 4L12 13L2 4" />
									</svg>
									kraftedloopstudio@gmail.com
								</a>
							</li>
							<li>
								<a
									href="tel:+918669326693"
									class="flex items-center gap-2 text-sm text-on-surface-muted transition-colors duration-150 hover:text-primary"
								>
									<svg
										viewBox="0 0 24 24"
										class="h-4 w-4 shrink-0"
										fill="none"
										stroke="currentColor"
										stroke-width="1.75"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<path
											d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"
										/>
									</svg>
									+91-8669326693
								</a>
							</li>
							<li>
								<a
									href="https://wa.me/918669326693"
									target="_blank"
									rel="noopener noreferrer"
									class="flex items-center gap-2 text-sm text-on-surface-muted transition-colors duration-150 hover:text-primary"
								>
									<svg viewBox="0 0 24 24" class="h-4 w-4 shrink-0" fill="currentColor">
										<path
											d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
										/>
									</svg>
									WhatsApp us
								</a>
							</li>
						</ul>
					</div>
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
						class="group flex items-center gap-3 text-sm text-on-surface-muted transition-colors duration-150 hover:text-primary"
					>
						<!-- Instagram inline SVG -->
						<span
							class="shadow-ambient group-hover:shadow-ambient-lg flex h-8 w-8 items-center justify-center rounded-xl bg-surface-card transition-shadow"
						>
							<svg
								viewBox="0 0 24 24"
								class="h-4 w-4"
								fill="none"
								stroke="currentColor"
								stroke-width="1.75"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
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
						class="group flex items-center gap-3 text-sm text-on-surface-muted transition-colors duration-150 hover:text-primary"
					>
						<span
							class="shadow-ambient group-hover:shadow-ambient-lg flex h-8 w-8 items-center justify-center rounded-xl bg-surface-card transition-shadow"
						>
							<!-- Simple shopping bag icon to represent Etsy -->
							<svg
								viewBox="0 0 24 24"
								class="h-4 w-4"
								fill="none"
								stroke="currentColor"
								stroke-width="1.75"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
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
				<div class="shadow-ambient rounded-2xl bg-surface-card p-4">
					<p class="mb-1 font-display text-sm font-medium text-on-surface">Stay in the loop</p>
					<p class="mb-3 text-xs leading-relaxed text-on-surface-muted">
						Get notified about new drops, behind-the-scenes yarn hauls, and exclusive offers.
					</p>
					<a
						href="/#newsletter"
						onclick={(e) => {
							if (window.location.pathname === '/') {
								e.preventDefault();
								document.getElementById('newsletter')?.scrollIntoView({ behavior: 'smooth' });
							}
						}}
						class="
              inline-flex items-center gap-1.5 text-xs font-semibold
              text-primary underline decoration-primary/40 underline-offset-2
              transition-colors duration-150 hover:text-primary-dim
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
		<div
			class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row sm:px-6 lg:px-8"
		>
			<p class="text-center text-xs text-on-surface-muted sm:text-left">
				&copy; {currentYear} Krafted Loops Studio. All rights reserved.
			</p>
			<p class="font-display text-xs text-on-surface-muted italic">Every stitch tells a story.</p>
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
      shadow-ambient-lg fixed right-4 bottom-6 z-40
      flex items-center gap-2 rounded-full bg-gradient-to-r
      from-primary to-primary-dim px-4 py-2.5
      text-sm font-semibold text-white transition-all
      duration-200 hover:brightness-110
      active:brightness-95 md:right-6
    "
		aria-label="Scroll back to top"
	>
		<svg
			viewBox="0 0 24 24"
			class="h-4 w-4"
			fill="none"
			stroke="currentColor"
			stroke-width="2.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<line x1="12" y1="19" x2="12" y2="5" />
			<polyline points="5 12 12 5 19 12" />
		</svg>
		<span class="hidden sm:inline">Back to top</span>
	</button>
{/if}
