<script lang="ts">
	interface Props {
		variant?: 'new' | 'sale' | 'low-stock' | 'category';
		class?: string;
		children?: import('svelte').Snippet;
	}

	let { variant = 'category', class: className = '', children }: Props = $props();

	/*
    Each variant maps to its semantic palette token.
    - category: secondary-container (minty) with asymmetric .chip shape — feels handcrafted
    - new: tertiary-container (warm amber) — warm and celebratory, distinct from sale
    - sale: primary-container (soft pink) — on-brand, clearly commercial
    - low-stock: coral tint — urgent but not alarming within the soft palette
  */
	const variantClasses: Record<string, string> = {
		category:
			'bg-secondary-container text-on-secondary-container chip text-xs font-semibold px-3 py-1',
		new: 'bg-tertiary-container text-on-tertiary-container rounded-full text-xs font-bold px-3 py-1',
		sale: 'bg-primary-container text-primary rounded-full text-xs font-bold px-3 py-1',
		'low-stock': 'bg-coral/30 text-on-surface rounded-full text-xs font-semibold px-3 py-1'
	};
</script>

<span class="inline-flex items-center whitespace-nowrap {variantClasses[variant]} {className}">
	{@render children?.()}
</span>
