<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let loading = $state(false);
	let showForm = $state(false);

	$effect(() => {
		if ((form as Record<string, unknown>)?.success) showForm = false;
	});
</script>

<svelte:head><title>Categories — Admin</title></svelte:head>

<div class="p-8">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="font-display text-3xl font-semibold text-on-surface">Categories</h1>
		<button
			onclick={() => (showForm = !showForm)}
			class="rounded-full bg-gradient-to-r from-primary to-primary-dim px-5 py-2.5 font-body text-sm font-semibold text-white shadow-ambient hover:brightness-110"
		>
			{showForm ? '✕ Cancel' : '+ New Category'}
		</button>
	</div>

	{#if (form as Record<string, unknown>)?.error}
		<div class="mb-4 rounded-2xl bg-primary/10 px-4 py-3 font-body text-sm text-primary">
			{(form as Record<string, unknown>).error}
		</div>
	{/if}

	{#if showForm}
		<div class="mb-8 rounded-3xl bg-surface-card p-6 shadow-ambient">
			<h2 class="mb-4 font-display text-xl font-semibold text-on-surface">New Category</h2>
			<form method="POST" action="?/create" use:enhance={() => {
				loading = true;
				return async ({ update }) => { await update(); loading = false; };
			}} class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div>
					<label class="mb-1 block font-body text-xs font-semibold uppercase tracking-wider text-on-surface-muted">Name *</label>
					<input name="name" type="text" required placeholder="Forever Flowers" class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-2.5 font-body text-sm text-on-surface focus:border-primary/50 focus:outline-none" />
				</div>
				<div>
					<label class="mb-1 block font-body text-xs font-semibold uppercase tracking-wider text-on-surface-muted">Display Order</label>
					<input name="display_order" type="number" min="0" placeholder="1" class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-2.5 font-body text-sm text-on-surface focus:border-primary/50 focus:outline-none" />
				</div>
				<div class="sm:col-span-2">
					<label class="mb-1 block font-body text-xs font-semibold uppercase tracking-wider text-on-surface-muted">Description</label>
					<input name="description" type="text" placeholder="Brief description…" class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-2.5 font-body text-sm text-on-surface focus:border-primary/50 focus:outline-none" />
				</div>
				<div class="sm:col-span-2">
					<button type="submit" disabled={loading} class="rounded-full bg-gradient-to-r from-primary to-primary-dim px-6 py-2.5 font-body text-sm font-semibold text-white shadow-ambient hover:brightness-110 disabled:opacity-60">
						{loading ? 'Saving…' : 'Create Category'}
					</button>
				</div>
			</form>
		</div>
	{/if}

	<div class="rounded-3xl bg-surface-card shadow-ambient overflow-hidden">
		<table class="w-full">
			<thead class="bg-surface-low">
				<tr>
					<th class="px-5 py-3 text-left font-body text-xs font-semibold uppercase tracking-wider text-on-surface-muted">Name</th>
					<th class="px-5 py-3 text-left font-body text-xs font-semibold uppercase tracking-wider text-on-surface-muted">Slug</th>
					<th class="px-5 py-3 text-left font-body text-xs font-semibold uppercase tracking-wider text-on-surface-muted">Description</th>
					<th class="px-5 py-3 text-center font-body text-xs font-semibold uppercase tracking-wider text-on-surface-muted">Order</th>
					<th class="px-5 py-3 text-right font-body text-xs font-semibold uppercase tracking-wider text-on-surface-muted">Actions</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-surface-low">
				{#each data.categories as cat}
					<tr class="hover:bg-surface transition-colors">
						<td class="px-5 py-4 font-body font-medium text-on-surface">{cat.name}</td>
						<td class="px-5 py-4 font-mono text-xs text-on-surface-muted">{cat.slug}</td>
						<td class="px-5 py-4 font-body text-sm text-on-surface-muted">{cat.description ?? '—'}</td>
						<td class="px-5 py-4 text-center font-body text-sm text-on-surface-muted">{cat.display_order}</td>
						<td class="px-5 py-4 text-right">
							<form method="POST" action="?/delete" use:enhance class="inline">
								<input type="hidden" name="id" value={cat.id} />
								<button
									type="submit"
									onclick={(e) => { if (!confirm('Delete this category?')) e.preventDefault(); }}
									class="rounded-xl bg-primary/10 px-3 py-1.5 font-body text-xs text-primary hover:bg-primary hover:text-white transition-colors"
								>Delete</button>
							</form>
						</td>
					</tr>
				{:else}
					<tr><td colspan="5" class="px-5 py-8 text-center font-body text-sm text-on-surface-muted">No categories yet.</td></tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
