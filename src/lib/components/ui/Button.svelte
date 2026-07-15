<script lang="ts">
	interface Props {
		variant?: 'primary' | 'secondary' | 'ghost';
		size?: 'sm' | 'md' | 'lg';
		href?: string;
		type?: 'button' | 'submit';
		disabled?: boolean;
		class?: string;
		onclick?: (e: MouseEvent) => void;
		children?: import('svelte').Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		href,
		type = 'button',
		disabled = false,
		class: className = '',
		onclick,
		children
	}: Props = $props();

	// Size classes — padding and text scale
	const sizeClasses: Record<string, string> = {
		sm: 'px-4 py-1.5 text-sm',
		md: 'px-6 py-2.5 text-base',
		lg: 'px-8 py-3.5 text-lg'
	};

	// Variant classes
	const variantClasses: Record<string, string> = {
		// Full pill, warm gradient, white text — the brand CTA
		primary:
			'bg-gradient-to-r from-primary to-primary-dim text-white rounded-full font-semibold ' +
			'hover:brightness-110 active:brightness-95 shadow-ambient ' +
			'disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200',

		// Softer secondary — minty surface, on-surface text, no border
		secondary:
			'bg-surface-high text-on-surface rounded-full font-medium ' +
			'hover:bg-surface-low active:brightness-95 ' +
			'disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200',

		// Ghost: Newsreader italic with a yarn-strand underline in primary
		ghost:
			'font-display italic text-on-surface underline decoration-primary decoration-2 ' +
			'underline-offset-4 hover:text-primary hover:decoration-primary-dim ' +
			'disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200'
	};

	const baseClasses =
		'inline-flex items-center justify-center gap-2 leading-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';
</script>

<!--
  Renders <a> when href is provided so the button works as a link without
  losing semantic meaning. The variant and size compose cleanly either way.
-->
{#if href}
	<a
		{href}
		class="{baseClasses} {sizeClasses[size]} {variantClasses[variant]} {className}"
		class:pointer-events-none={disabled}
		class:opacity-50={disabled}
		aria-disabled={disabled}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		{type}
		{disabled}
		{onclick}
		class="{baseClasses} {sizeClasses[size]} {variantClasses[variant]} {className}"
	>
		{@render children?.()}
	</button>
{/if}
