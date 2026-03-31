<script lang="ts">
	interface Props {
		category: { name: string; slug: string };
		active?: boolean;
	}

	let { category, active = false }: Props = $props();
</script>

<!--
  The asymmetric .chip border-radius (1rem 0.5rem 1rem 0.5rem) gives a hand-cut
  feel — like a little label snipped from kraft paper and pinned to a mood board.
  Active state uses the solid secondary green (same hue, higher contrast) so the
  filter pill reads as "selected" without any border or icon needed.
-->
<a
	href="/shop?category={category.slug}"
	class="
    chip inline-flex items-center px-4 py-2 text-sm font-semibold
    transition-all duration-200
    {active
		? 'bg-secondary text-white shadow-ambient'
		: 'bg-secondary-container text-on-secondary-container hover:bg-secondary/20'}
  "
>
	{category.name}
</a>
