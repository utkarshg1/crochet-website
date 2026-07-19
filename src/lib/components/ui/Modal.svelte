<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		open: boolean;
		title?: string;
		variant?: 'error' | 'info';
		onclose: () => void;
		children?: Snippet;
		actionLabel?: string;
		onaction?: () => void;
	}

	let { open, title, variant = 'info', onclose, children, actionLabel, onaction }: Props = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && open) onclose();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div
		class="animate-fade-in fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/50 backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
		aria-label={title ?? 'Dialog'}
		onclick={(e) => {
			if (e.target === e.currentTarget) onclose();
		}}
		onkeydown={(e) => {
			if (e.key === 'Escape') onclose();
		}}
		tabindex="-1"
	>
		<div
			class="shadow-ambient-lg animate-zoom-in relative mx-4 w-full max-w-md rounded-3xl bg-surface-card p-8"
		>
			<button
				onclick={onclose}
				class="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-surface-high text-on-surface-muted transition-colors hover:text-on-surface"
				aria-label="Close"
			>
				<svg
					class="h-4 w-4"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M18 6 6 18M6 6l12 12" />
				</svg>
			</button>

			{#if variant === 'error'}
				<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
					<svg
						class="h-6 w-6 text-primary"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<circle cx="12" cy="12" r="10" />
						<line x1="12" y1="8" x2="12" y2="12" />
						<line x1="12" y1="16" x2="12.01" y2="16" />
					</svg>
				</div>
			{:else}
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-container"
				>
					<svg
						class="h-6 w-6 text-secondary"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<circle cx="12" cy="12" r="10" />
						<path d="M12 16v-4" />
						<path d="M12 8h.01" />
					</svg>
				</div>
			{/if}

			{#if title}
				<h2 class="mb-2 font-display text-xl font-semibold text-on-surface">{title}</h2>
			{/if}

			{#if children}
				<div class="mb-6 font-body text-sm leading-relaxed text-on-surface-muted">
					{@render children()}
				</div>
			{/if}

			<div class="flex justify-end gap-3">
				<button
					onclick={onclose}
					class="rounded-full bg-surface-high px-5 py-2.5 font-body text-sm font-semibold text-on-surface-muted transition-colors hover:bg-surface-low"
				>
					{actionLabel ? 'Cancel' : 'Close'}
				</button>
				{#if actionLabel && onaction}
					<button
						onclick={onaction}
						class="rounded-full bg-gradient-to-r from-primary to-primary-dim px-5 py-2.5 font-body text-sm font-semibold text-white hover:brightness-110"
					>
						{actionLabel}
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}
