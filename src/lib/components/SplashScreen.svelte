<script lang="ts">
	import logoSvg from '$lib/assets/Krafted Loops Studio.svg';
	import { logoState } from '$lib/logoState.svelte';

	type Phase = 'idle' | 'animating' | 'fading' | 'done';

	let phase: Phase = $state('idle');
	let splashLogoEl: HTMLImageElement | undefined = $state();

	function executeStationarySpin() {
		if (!splashLogoEl) return;

		const animation = splashLogoEl.animate(
			[
				{ transform: 'rotate(0deg)', opacity: 1 },
				{ transform: 'rotate(360deg)', opacity: 1 }
			],
			{
				duration: 2000,
				easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
				fill: 'forwards'
			}
		);

		animation.onfinish = () => {
			logoState.hasSettled = true;
			phase = 'fading';
		};
	}

	function executeTireRollTransition() {
		if (!splashLogoEl) return;

		const target = document.querySelector<HTMLElement>('[data-splash-target]');
		if (!target) {
			logoState.hasSettled = true;
			phase = 'done';
			return;
		}

		const first = splashLogoEl.getBoundingClientRect();
		const last = target.getBoundingClientRect();

		const deltaX = last.left + last.width / 2 - (first.left + first.width / 2);
		const deltaY = last.top + last.height / 2 - (first.top + first.height / 2);
		const scale = last.width / first.width;

		const animation = splashLogoEl.animate(
			[
				{
					transform: 'translate(0px, 0px) rotate(-360deg) scale(1)',
					opacity: 1
				},
				{
					transform: `translate(${deltaX}px, ${deltaY}px) rotate(0deg) scale(${scale})`,
					opacity: 1
				}
			],
			{
				duration: 2000,
				easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
				fill: 'forwards'
			}
		);

		animation.onfinish = () => {
			target.style.opacity = '1';
			logoState.hasSettled = true;
			phase = 'fading';
		};
	}

	$effect(() => {
		if (logoState.hasSettled) return;
		if (!splashLogoEl) return;

		const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();

		const targetImageLoaded = new Promise<void>((resolve) => {
			const targetImg = document.querySelector<HTMLImageElement>('[data-splash-target] img');
			if (!targetImg || targetImg.complete) {
				resolve();
			} else {
				targetImg.onload = () => resolve();
				targetImg.onerror = () => resolve();
			}
		});

		const timer = setTimeout(() => {
			Promise.all([fontsReady, targetImageLoaded]).then(() => {
				phase = 'animating';
				const isMobile = window.matchMedia('(max-width: 768px)').matches;
				if (isMobile) {
					executeStationarySpin();
				} else {
					executeTireRollTransition();
				}
			});
		}, 400);

		return () => {
			clearTimeout(timer);
		};
	});
</script>

{#if phase !== 'done'}
	<div
		class="splash-overlay"
		class:fading={phase === 'fading'}
		ontransitionend={() => {
			if (phase === 'fading') phase = 'done';
		}}
		role="presentation"
	>
		<img bind:this={splashLogoEl} src={logoSvg} alt="" aria-hidden="true" class="splash-logo" />
	</div>
{/if}

<style>
	.splash-overlay {
		position: fixed;
		inset: 0;
		z-index: 200;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		background: var(--color-surface, #dcfdf8);
		opacity: 1;
		transition: opacity 0.5s ease-out;
	}

	.splash-overlay.fading {
		opacity: 0;
	}

	.splash-logo {
		width: 40rem;
		height: 40rem;
		border-radius: 9999px;
		will-change: transform;
	}

	@media (max-width: 768px) {
		.splash-logo {
			width: 16rem;
			height: 16rem;
		}
	}
</style>
