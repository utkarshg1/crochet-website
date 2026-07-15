<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Nav from '$lib/components/Nav.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import SplashScreen from '$lib/components/SplashScreen.svelte';
	import type { LayoutData } from './$types';

	interface Props {
		data: LayoutData;
		children: import('svelte').Snippet;
	}

	let { data, children }: Props = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<!--
    Preconnect to Google Fonts so the display (Newsreader) and body (Manrope)
    fonts don't block first paint.
  -->
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;0,6..72,700;1,6..72,400;1,6..72,600&family=Manrope:wght@400;500;600;700&display=swap"
		rel="stylesheet"
	/>
	<meta name="theme-color" content="#dcfdf8" />
</svelte:head>

<!--
  Root shell: Nav is fixed (handled inside Nav.svelte), so the main content
  needs top padding to clear it. pt-16 matches the nav's h-16 exactly.

  We use min-h-screen + flex-col on the wrapper so the footer is always pushed
  to the bottom even on short pages — no empty space between content and footer.
-->
<div class="flex min-h-screen flex-col">
	<SplashScreen />
	<Nav />

	<!--
    pt-16 clears the fixed nav. The extra pb accounts for the scroll-to-top
    button (in Footer) so it doesn't overlap the footer's bottom bar.
  -->
	<main class="flex-1 pt-16" id="main-content">
		{@render children()}
	</main>

	<Footer />
</div>

<!--
  Skip-to-content link: visually hidden until focused by keyboard.
  Lets screen reader and keyboard users jump past the nav instantly.
-->
<style>
	/* We can't use @apply here, but this is a single standalone element
     that doesn't belong in the design token system — inline style is fine */
	:global(.skip-link) {
		position: absolute;
		top: -100%;
		left: 1rem;
		z-index: 9999;
		padding: 0.5rem 1rem;
		background: var(--color-primary);
		color: white;
		font-weight: 600;
		border-radius: 0 0 0.75rem 0.75rem;
		transition: top 0.15s;
	}
	:global(.skip-link:focus) {
		top: 0;
	}
</style>
