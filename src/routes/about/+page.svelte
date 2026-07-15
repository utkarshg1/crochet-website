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
	<meta
		name="description"
		content="Meet Kalyani Gaikwad, the maker behind Krafted Loops Studio. Learn about her journey from hobby crocheter to artisan, and the story behind every handmade stitch."
	/>
</svelte:head>

<svelte:window onkeydown={handleLightboxKeydown} />

<!-- ═══════════════════════════════════════════════════════════════════════════
     SECTION 1 · HERO
     Two-column: owner photo left, name + intro right.
     ─────────────────────────────────────────────────────────────────────── -->
<section class="relative overflow-hidden bg-surface py-24 md:py-32">
	<!-- Decorative blobs -->
	<div
		class="pointer-events-none absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl"
		aria-hidden="true"
	></div>
	<div
		class="pointer-events-none absolute -bottom-24 -left-24 h-[400px] w-[400px] rounded-full bg-secondary/10 blur-3xl"
		aria-hidden="true"
	></div>

	<div
		class="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 md:grid-cols-5 md:px-10 lg:gap-20 lg:px-16"
	>
		<!-- LEFT · photo (2 of 5 cols) -->
		<div class="flex justify-center md:col-span-2">
			<div class="relative w-full max-w-xs md:max-w-none">
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

				<!-- Decorative yarn ball -->
				<span
					class="animate-yarn-bounce absolute -top-4 -right-2 text-4xl select-none"
					aria-hidden="true"
				>
					🧶
				</span>

				<!-- Stat badge -->
				<div
					class="shadow-ambient absolute -right-4 bottom-8 flex flex-col items-center rounded-2xl bg-surface-card px-4 py-3 md:-right-6"
				>
					<span class="font-display text-xl leading-none font-bold text-primary">12+</span>
					<span class="mt-0.5 font-body text-xs text-on-surface-muted">years of craft</span>
				</div>
			</div>
		</div>

		<!-- RIGHT · content (3 of 5 cols) -->
		<div class="flex flex-col gap-6 md:col-span-3">
			<p class="font-body text-xs font-semibold tracking-widest text-secondary uppercase">
				The Maker Behind Every Stitch
			</p>

			<h1
				class="font-display text-5xl leading-tight font-bold text-on-surface md:text-6xl lg:text-7xl"
			>
				Kalyani<br />
				<span class="text-primary">Gaikwad</span>
			</h1>

			<blockquote
				class="border-l-2 border-primary/30 pl-5 font-body text-base leading-relaxed text-on-surface-muted md:text-lg"
			>
				"I started crocheting as a way to slow down in a fast world. What began as a hobby became my
				calling — turning yarn into memories that last a lifetime."
			</blockquote>

			<div class="mt-2 flex flex-wrap gap-4" role="list" aria-label="Maker stats">
				{#each [{ value: '12+', label: 'Years Crocheting' }, { value: '4k+', label: 'Loops Daily' }, { value: '200+', label: 'Happy Customers' }] as stat}
					<div
						role="listitem"
						class="shadow-ambient flex min-w-[100px] flex-col items-center rounded-2xl bg-surface-card px-5 py-4"
					>
						<span class="font-display text-2xl leading-none font-bold text-primary md:text-3xl"
							>{stat.value}</span
						>
						<span class="mt-1 font-body text-xs text-on-surface-muted">{stat.label}</span>
					</div>
				{/each}
			</div>

			<!-- Instagram link -->
			<a
				href="https://instagram.com/krafted_loops_studio"
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex w-fit items-center gap-3 rounded-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] px-6 py-3 font-body text-sm font-semibold text-white
					   transition-all duration-200 hover:-translate-y-0.5
					   hover:shadow-lg focus-visible:ring-2
					   focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none active:translate-y-0"
			>
				<!-- Instagram icon -->
				<svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
					<path
						d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"
					/>
				</svg>
				Follow @krafted_loops_studio
			</a>

			<!-- Contact buttons -->
			<div class="mt-2 flex flex-wrap gap-3">
				<a
					href="tel:+918669326693"
					class="shadow-ambient hover:shadow-ambient-lg inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-dim px-5 py-2.5 font-body text-sm font-semibold text-on-primary transition-all duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none active:translate-y-0"
				>
					<svg
						viewBox="0 0 24 24"
						class="h-4 w-4"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path
							d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"
						/>
					</svg>
					Call Us
				</a>
				<a
					href="https://wa.me/918669326693"
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-2 rounded-full border border-[#25d366]/30 bg-[#25d366]/10 px-5 py-2.5 font-body text-sm font-semibold text-[#25d366] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#25d366]/20 focus-visible:ring-2 focus-visible:ring-[#25d366] focus-visible:ring-offset-2 focus-visible:outline-none active:translate-y-0"
				>
					<svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor">
						<path
							d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
						/>
					</svg>
					WhatsApp Us
				</a>
				<a
					href="mailto:kraftedloopstudio@gmail.com"
					class="inline-flex items-center gap-2 rounded-full border border-on-surface/20 px-5 py-2.5 font-body text-sm font-semibold text-on-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-on-surface/30 hover:bg-on-surface/5 focus-visible:ring-2 focus-visible:ring-on-surface focus-visible:ring-offset-2 focus-visible:outline-none active:translate-y-0"
				>
					<svg
						viewBox="0 0 24 24"
						class="h-4 w-4"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<rect x="2" y="4" width="20" height="16" rx="2" />
						<path d="M22 4L12 13L2 4" />
					</svg>
					Email Us
				</a>
			</div>

			<p class="mt-4 font-body text-sm text-on-surface">Website by Utkarsh Gaikwad</p>
		</div>
	</div>
</section>

<!-- ═══════════════════════════════════════════════════════════════════════════
     SECTION 2 · STORY
     Full-width narrative with brand-consistent styling.
     ─────────────────────────────────────────────────────────────────────── -->
<section class="bg-surface-low py-24">
	<div class="mx-auto max-w-4xl px-6 md:px-10 lg:px-16">
		<div class="mb-12 text-center">
			<p class="mb-3 font-body text-sm font-semibold tracking-widest text-secondary uppercase">
				The Journey
			</p>
			<h2 class="font-display text-4xl leading-tight font-bold text-on-surface md:text-5xl">
				Where It All Began
			</h2>
		</div>

		<div class="space-y-6 font-body text-base leading-relaxed text-on-surface-muted md:text-lg">
			<p>
				What started as a quiet conversation between hands and yarn has grown into a studio bursting
				with color and texture. Based in India, Kalyani Gaikwad blends traditional crochet
				techniques with a modern, vibrant aesthetic that speaks to collectors and creators alike.
			</p>
			<p>
				Every loop is intentional. Every color is chosen to spark delight. From forever flowers that
				never wilt to baby treasures stitched with warmth — each piece is an invitation to slow down
				and appreciate the intricate beauty of the handmade.
			</p>
			<p>
				Krafted Loops Studio was born from a simple belief: that the things we surround ourselves
				with should carry meaning. In a world of mass production, Kalyani chose a different path —
				one stitch at a time, one color at a time, one story at a time.
			</p>
		</div>

		<!-- Decorative divider -->
		<div class="mt-12 flex justify-center">
			<div class="flex items-center gap-4">
				<div class="h-px w-16 bg-primary/30"></div>
				<span class="text-2xl" aria-hidden="true">🧶</span>
				<div class="h-px w-16 bg-primary/30"></div>
			</div>
		</div>
	</div>
</section>

<!-- ═══════════════════════════════════════════════════════════════════════════
     SECTION 3 · INSTAGRAM QR
     Scan to follow on Instagram.
     ─────────────────────────────────────────────────────────────────────── -->
<section class="bg-surface py-24">
	<div class="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
		<div class="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
			<!-- Left · text -->
			<div class="flex flex-col gap-6">
				<p class="font-body text-sm font-semibold tracking-widest text-secondary uppercase">
					Stay Connected
				</p>
				<h2 class="font-display text-4xl leading-tight font-bold text-on-surface md:text-5xl">
					Follow the<br /><span class="text-primary">Creative Process</span>
				</h2>
				<p class="max-w-md font-body text-base leading-relaxed text-on-surface-muted md:text-lg">
					Behind every stitch is a story. Follow us on Instagram for behind-the-scenes peeks, new
					collection drops, and a glimpse into the world of handmade crochet.
				</p>
				<a
					href="https://instagram.com/krafted_loops_studio"
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30
						   px-6 py-3 font-body text-sm font-semibold text-primary
						   transition-all duration-200 hover:border-primary/50 hover:bg-primary/5
						   focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
				>
					@krafted_loops_studio
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
						<path d="M7 17L17 7M17 7H7M17 7v10" />
					</svg>
				</a>
			</div>

			<!-- Right · QR code -->
			<div class="flex justify-center">
				<div
					class="shadow-ambient-lg flex flex-col items-center gap-5 rounded-3xl bg-surface-card p-6 md:p-10"
				>
					<img
						src={instagramQr}
						alt="Scan to follow @krafted_loops_studio on Instagram"
						class="aspect-square w-full max-w-[512px] rounded-2xl object-contain"
					/>
					<div class="text-center">
						<p class="font-display text-lg font-semibold text-on-surface">Scan to Follow</p>
						<p class="mt-1 font-body text-sm text-on-surface-muted">@krafted_loops_studio</p>
					</div>
				</div>
			</div>
		</div>
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
