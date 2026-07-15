<script lang="ts">
	interface Props {
		label?: string;
		type?: string;
		placeholder?: string;
		value?: string;
		name?: string;
		required?: boolean;
		error?: string;
		class?: string;
		id?: string;
	}

	let {
		label,
		type = 'text',
		placeholder,
		value = $bindable(''),
		name,
		required = false,
		error,
		class: className = '',
		id
	}: Props = $props();

	// Generate a stable id from label if none provided — needed for label[for]
	const inputId = $derived(id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined));
</script>

<div class="flex flex-col gap-1 {className}">
	{#if label}
		<!--
      Small-caps label in muted warm tone — softer than a form label,
      reads more like a handwritten annotation on the craft aesthetic
    -->
		<label
			for={inputId}
			class="text-xs font-semibold tracking-widest text-on-surface-muted uppercase"
			style="font-variant: small-caps;"
		>
			{label}{#if required}<span class="ml-0.5 text-primary" aria-hidden="true">*</span>{/if}
		</label>
	{/if}

	<input
		{type}
		{name}
		{placeholder}
		{required}
		id={inputId}
		bind:value
		aria-invalid={!!error}
		aria-describedby={error && inputId ? `${inputId}-error` : undefined}
		class="
      w-full rounded-xl border bg-surface-high px-4 py-3
      font-body text-base text-on-surface transition-all
      duration-200 placeholder:text-on-surface-muted/60
      focus:border-primary/40 focus:ring-2 focus:ring-primary/40 focus:outline-none
      {error
			? 'border-primary/50 bg-primary-container/10'
			: 'border-on-surface/10 hover:border-on-surface/20'}
    "
	/>

	{#if error}
		<!--
      Error sits below the field in primary (warm pink) — matches the brand
      palette instead of a jarring red that would clash with the minty surface
    -->
		<p
			id={inputId ? `${inputId}-error` : undefined}
			class="mt-0.5 text-xs font-medium text-primary"
		>
			{error}
		</p>
	{/if}
</div>
