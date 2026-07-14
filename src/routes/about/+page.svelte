<script lang="ts">
	import ownerImg from '$lib/assets/owner.jpeg';
	import instagramQr from '$lib/assets/instagram.png';
	import logoSvg from '$lib/assets/Krafted Loops Studio.svg';

	// Lightbox state
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
</script>

<svelte:head>
	<title>About — Krafted Loops Studio</title>
	<meta name="description" content="Meet Kalyani Gaikwad, the maker behind Krafted Loops Studio. Learn about her journey from hobby crocheter to artisan, and the story behind every handmade stitch." />
</svelte:head>

<svelte:window onkeydown={handleLightboxKeydown} />

<!-- ═══════════════════════════════════════════════════════════════════════════
     SECTION 1 · HERO
     Two-column: owner photo left, name + intro right.
     ─────────────────────────────────────────────────────────────────────── -->
<section class="relative overflow-hidden bg-surface py-24 md:py-32">
	<!-- Decorative blobs -->
	<div class="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl pointer-events-none" aria-hidden="true"></div>
	<div class="absolute -bottom-24 -left-24 w-[400px] h-[400px] rounded-full bg-secondary/10 blur-3xl pointer-events-none" aria-hidden="true"></div>

	<div class="relative z-10 max-w-7xl mx-auto px-6 md:px-10 lg:px-16 grid grid-cols-1 md:grid-cols-5 gap-12 lg:gap-20 items-center">
		<!-- LEFT · photo (2 of 5 cols) -->
		<div class="md:col-span-2 flex justify-center">
			<div class="relative w-full max-w-xs md:max-w-none">
				<button
					type="button"
					onclick={() => openLightbox(ownerImg, 'Kalyani Gaikwad — the maker behind Krafted Loops Studio')}
					class="w-full rounded-3xl aspect-[3/4] mask-organic shadow-ambient-lg overflow-hidden
						   cursor-pointer hover:scale-[1.02] transition-transform duration-500 ease-out
						   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
					aria-label="View photo of Kalyani Gaikwad — click to enlarge"
				>
					<img
						src={ownerImg}
						alt="Kalyani Gaikwad — the maker behind Krafted Loops Studio"
						class="w-full h-full object-cover"
					/>
				</button>

				<!-- Decorative yarn ball -->
				<span class="absolute -top-4 -right-2 text-4xl animate-yarn-bounce select-none" aria-hidden="true">
					🧶
				</span>

				<!-- Stat badge -->
				<div class="bg-surface-card rounded-2xl shadow-ambient px-4 py-3 absolute bottom-8 -right-4 md:-right-6 flex flex-col items-center">
					<span class="font-display font-bold text-xl text-primary leading-none">12+</span>
					<span class="font-body text-xs text-on-surface-muted mt-0.5">years of craft</span>
				</div>
			</div>
		</div>

		<!-- RIGHT · content (3 of 5 cols) -->
		<div class="md:col-span-3 flex flex-col gap-6">
			<p class="font-body text-xs tracking-widest uppercase text-secondary font-semibold">
				The Maker Behind Every Stitch
			</p>

			<h1 class="font-display font-bold text-5xl md:text-6xl lg:text-7xl text-on-surface leading-tight">
				Kalyani<br />
				<span class="text-primary">Gaikwad</span>
			</h1>

			<blockquote class="font-body text-on-surface-muted text-base md:text-lg leading-relaxed border-l-2 border-primary/30 pl-5">
				"I started crocheting as a way to slow down in a fast world. What began as a hobby became
				my calling — turning yarn into memories that last a lifetime."
			</blockquote>

			<div class="flex flex-wrap gap-4 mt-2" role="list" aria-label="Maker stats">
				{#each [
					{ value: '12+', label: 'Years Crocheting' },
					{ value: '4k+', label: 'Loops Daily' },
					{ value: '200+', label: 'Happy Customers' }
				] as stat}
					<div role="listitem" class="bg-surface-card rounded-2xl shadow-ambient px-5 py-4 flex flex-col items-center min-w-[100px]">
						<span class="font-display font-bold text-2xl md:text-3xl text-primary leading-none">{stat.value}</span>
						<span class="font-body text-xs text-on-surface-muted mt-1">{stat.label}</span>
					</div>
				{/each}
			</div>

			<!-- Instagram link -->
			<a
				href="https://instagram.com/krafted_loops_studio"
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-3 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white font-body font-semibold text-sm rounded-full px-6 py-3 w-fit
					   hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0
					   transition-all duration-200
					   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
			>
				<!-- Instagram icon -->
				<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
					<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
				</svg>
				Follow @krafted_loops_studio
			</a>

			<p class="font-body text-sm text-on-surface mt-4">
				Website by Utkarsh Gaikwad
			</p>
		</div>
	</div>
</section>

<!-- ═══════════════════════════════════════════════════════════════════════════
     SECTION 2 · STORY
     Full-width narrative with brand-consistent styling.
     ─────────────────────────────────────────────────────────────────────── -->
<section class="bg-surface-low py-24">
	<div class="max-w-4xl mx-auto px-6 md:px-10 lg:px-16">
		<div class="text-center mb-12">
			<p class="font-body text-sm tracking-widest uppercase text-secondary font-semibold mb-3">
				The Journey
			</p>
			<h2 class="font-display font-bold text-4xl md:text-5xl text-on-surface leading-tight">
				Where It All Began
			</h2>
		</div>

		<div class="space-y-6 text-on-surface-muted text-base md:text-lg leading-relaxed font-body">
			<p>
				What started as a quiet conversation between hands and yarn has grown into a studio
				bursting with color and texture. Based in India, Kalyani Gaikwad blends traditional
				crochet techniques with a modern, vibrant aesthetic that speaks to collectors and
				creators alike.
			</p>
			<p>
				Every loop is intentional. Every color is chosen to spark delight. From forever flowers
				that never wilt to baby treasures stitched with warmth — each piece is an invitation
				to slow down and appreciate the intricate beauty of the handmade.
			</p>
			<p>
				Krafted Loops Studio was born from a simple belief: that the things we surround ourselves
				with should carry meaning. In a world of mass production, Kalyani chose a different
				path — one stitch at a time, one color at a time, one story at a time.
			</p>
		</div>

		<!-- Decorative divider -->
		<div class="flex justify-center mt-12">
			<div class="flex items-center gap-4">
				<div class="w-16 h-px bg-primary/30"></div>
				<span class="text-2xl" aria-hidden="true">🧶</span>
				<div class="w-16 h-px bg-primary/30"></div>
			</div>
		</div>
	</div>
</section>

<!-- ═══════════════════════════════════════════════════════════════════════════
     SECTION 3 · INSTAGRAM QR
     Scan to follow on Instagram.
     ─────────────────────────────────────────────────────────────────────── -->
<section class="bg-surface py-24">
	<div class="max-w-7xl mx-auto px-6 md:px-10 lg:px-16">
		<div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
			<!-- Left · text -->
			<div class="flex flex-col gap-6">
				<p class="font-body text-sm tracking-widest uppercase text-secondary font-semibold">
					Stay Connected
				</p>
				<h2 class="font-display font-bold text-4xl md:text-5xl text-on-surface leading-tight">
					Follow the<br /><span class="text-primary">Creative Process</span>
				</h2>
				<p class="font-body text-on-surface-muted text-base md:text-lg leading-relaxed max-w-md">
					Behind every stitch is a story. Follow us on Instagram for behind-the-scenes
					peeks, new collection drops, and a glimpse into the world of handmade crochet.
				</p>
				<a
					href="https://instagram.com/krafted_loops_studio"
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-2 font-body font-semibold text-sm text-primary
						   border border-primary/30 rounded-full px-6 py-3 w-fit
						   hover:bg-primary/5 hover:border-primary/50 transition-all duration-200
						   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
				>
					@krafted_loops_studio
					<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="M7 17L17 7M17 7H7M17 7v10" />
					</svg>
				</a>
			</div>

			<!-- Right · QR code -->
			<div class="flex justify-center">
				<div class="bg-surface-card rounded-3xl shadow-ambient-lg p-6 md:p-10 flex flex-col items-center gap-5">
					<img
						src={instagramQr}
						alt="Scan to follow @krafted_loops_studio on Instagram"
						class="w-[512px] h-[512px] object-contain rounded-2xl"
					/>
					<div class="text-center">
						<p class="font-display text-lg font-semibold text-on-surface">Scan to Follow</p>
						<p class="font-body text-sm text-on-surface-muted mt-1">@krafted_loops_studio</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Lightbox overlay -->
{#if lightboxOpen}
	<div
		class="fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/70 backdrop-blur-sm p-6"
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
			class="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm
				   flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"
			aria-label="Close lightbox"
		>
			<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
				<path d="M18 6 6 18M6 6l12 12" />
			</svg>
		</button>
		<div role="presentation" onclick={(e) => e.stopPropagation()}>
			<img
				src={lightboxSrc}
				alt={lightboxAlt}
				class="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain animate-zoom-in"
			/>
		</div>
	</div>
{/if}
