<script lang="ts">
	import { untrack } from 'svelte';
	import logoSvg from '$lib/assets/Krafted Loops Studio.svg';
	import { animationState } from '$lib/animationState.svelte';

	type Phase = 'idle' | 'rolling' | 'settled' | 'done';

	let phase: Phase = $state('idle');
	let tx: number = $state(0);
	let ty: number = $state(0);

	function handleAnimationEnd(e: AnimationEvent) {
		if (e.target !== e.currentTarget) return;
		animationState.hasSettled = true;
		phase = 'settled';
	}

	function handleFadeEnd() {
		if (phase !== 'settled') return;
		phase = 'done';
	}

	$effect(() => {
		return untrack(() => {
			if (animationState.hasSettled) return;

			const t = setTimeout(() => {
				const target = document.querySelector<HTMLElement>('[data-splash-target]');
				if (target) {
					const rect = target.getBoundingClientRect();
					tx = ((rect.left + rect.width / 2 - window.innerWidth / 2) / window.innerWidth) * 100;
					ty = ((rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight) * 100;
				}
				phase = 'rolling';
			}, 400);

			return () => clearTimeout(t);
		});
	});
</script>

{#if phase !== 'done'}
	<div
		class="splash-overlay"
		class:fading={phase === 'settled'}
		ontransitionend={handleFadeEnd}
		role="presentation"
	>
		<div
			class="splash-transformer"
			class:rolling={phase === 'rolling' && !animationState.hasSettled}
			style="--tx:{tx}vw; --ty:{ty}vh;"
			onanimationend={handleAnimationEnd}
			role="presentation"
		>
			<img
				src={logoSvg}
				alt=""
				aria-hidden="true"
				class="splash-logo"
				class:rolling={phase === 'rolling' && !animationState.hasSettled}
			/>
		</div>
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
		background: var(--color-surface, #dcfdf8);
		transition: opacity 1s ease-in;
	}

	.splash-overlay.fading {
		opacity: 0;
		pointer-events: none;
	}

	.splash-transformer {
		will-change: transform;
		transform-origin: center;
	}

	.splash-transformer.rolling {
		animation: move 3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
		animation-iteration-count: 1;
	}

	.splash-logo {
		width: 40rem;
		height: 40rem;
		border-radius: 9999px;
		will-change: transform;
		transform-origin: center;
	}

	.splash-logo.rolling {
		animation: roll 3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
		animation-iteration-count: 1;
	}

	@keyframes move {
		from {
			transform: translate(0, 0) scale(1);
		}
		to {
			transform: translate(var(--tx), var(--ty)) scale(0.4);
		}
	}

	@keyframes roll {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
