<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let loading = $state(false);
	let showForm = $state(false);
	let editingId = $state<string | null>(null);

	$effect(() => {
		if ((form as Record<string, unknown>)?.success) showForm = false;
		if ((form as Record<string, unknown>)?.updated) editingId = null;
	});
</script>

<svelte:head><title>Categories — Admin</title></svelte:head>

<div class="p-8">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="font-display text-3xl font-semibold text-on-surface">Categories</h1>
		<button
			onclick={() => {
				showForm = !showForm;
				editingId = null;
			}}
			class="shadow-ambient rounded-full bg-gradient-to-r from-primary to-primary-dim px-5 py-2.5 font-body text-sm font-semibold text-white hover:brightness-110"
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
		<div class="shadow-ambient mb-8 rounded-3xl bg-surface-card p-6">
			<h2 class="mb-4 font-display text-xl font-semibold text-on-surface">New Category</h2>
			<form
				method="POST"
				action="?/create"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						await update();
						loading = false;
					};
				}}
				class="grid grid-cols-1 gap-4 sm:grid-cols-2"
			>
				<div>
					<label
						for="cat-name"
						class="mb-1 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
						>Name *</label
					>
					<input
						id="cat-name"
						name="name"
						type="text"
						required
						placeholder="Forever Flowers"
						class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-2.5 font-body text-sm text-on-surface focus:border-primary/50 focus:outline-none"
					/>
				</div>
				<div>
					<label
						for="cat-display-order"
						class="mb-1 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
						>Display Order</label
					>
					<input
						id="cat-display-order"
						name="display_order"
						type="number"
						min="0"
						placeholder="1"
						class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-2.5 font-body text-sm text-on-surface focus:border-primary/50 focus:outline-none"
					/>
				</div>
				<div class="sm:col-span-2">
					<label
						for="cat-tagline"
						class="mb-1 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
						>Tagline</label
					>
					<input
						id="cat-tagline"
						name="tagline"
						type="text"
						placeholder="Short tagline shown on homepage…"
						class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-2.5 font-body text-sm text-on-surface focus:border-primary/50 focus:outline-none"
					/>
				</div>
				<div class="sm:col-span-2">
					<label
						for="cat-description"
						class="mb-1 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
						>Description</label
					>
					<input
						id="cat-description"
						name="description"
						type="text"
						placeholder="Brief description…"
						class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-2.5 font-body text-sm text-on-surface focus:border-primary/50 focus:outline-none"
					/>
				</div>
				<div class="sm:col-span-2">
					<label
						for="cat-image-url"
						class="mb-1 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
						>Image URL</label
					>
					<input
						id="cat-image-url"
						name="image_url"
						type="url"
						placeholder="https://…"
						class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-2.5 font-body text-sm text-on-surface focus:border-primary/50 focus:outline-none"
					/>
				</div>
				<div class="sm:col-span-2">
					<button
						type="submit"
						disabled={loading}
						class="shadow-ambient rounded-full bg-gradient-to-r from-primary to-primary-dim px-6 py-2.5 font-body text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
					>
						{loading ? 'Saving…' : 'Create Category'}
					</button>
				</div>
			</form>
		</div>
	{/if}

	<div class="shadow-ambient overflow-hidden rounded-3xl bg-surface-card">
		<table class="w-full">
			<thead class="bg-surface-low">
				<tr>
					<th
						class="px-5 py-3 text-left font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
						>Name</th
					>
					<th
						class="px-5 py-3 text-left font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
						>Slug</th
					>
					<th
						class="px-5 py-3 text-left font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
						>Tagline</th
					>
					<th
						class="px-5 py-3 text-center font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
						>Order</th
					>
					<th
						class="px-5 py-3 text-right font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
						>Actions</th
					>
				</tr>
			</thead>
			<tbody class="divide-y divide-surface-low">
				{#each data.categories as cat}
					{#if editingId === cat.id}
						<tr class="bg-surface">
							<td colspan="5" class="px-5 py-4">
								<form
									method="POST"
									action="?/update"
									use:enhance={() => {
										loading = true;
										return async ({ update }) => {
											await update();
											loading = false;
										};
									}}
									class="grid grid-cols-1 gap-4 sm:grid-cols-2"
								>
									<input type="hidden" name="id" value={cat.id} />
									<div>
										<label
											for="edit-{cat.id}-name"
											class="mb-1 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
											>Name *</label
										>
										<input
											id="edit-{cat.id}-name"
											name="name"
											type="text"
											required
											value={cat.name}
											class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-2.5 font-body text-sm text-on-surface focus:border-primary/50 focus:outline-none"
										/>
									</div>
									<div>
										<label
											for="edit-{cat.id}-order"
											class="mb-1 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
											>Display Order</label
										>
										<input
											id="edit-{cat.id}-order"
											name="display_order"
											type="number"
											min="0"
											value={cat.display_order}
											class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-2.5 font-body text-sm text-on-surface focus:border-primary/50 focus:outline-none"
										/>
									</div>
									<div class="sm:col-span-2">
										<label
											for="edit-{cat.id}-tagline"
											class="mb-1 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
											>Tagline</label
										>
										<input
											id="edit-{cat.id}-tagline"
											name="tagline"
											type="text"
											value={cat.tagline ?? ''}
											placeholder="Short tagline shown on homepage…"
											class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-2.5 font-body text-sm text-on-surface focus:border-primary/50 focus:outline-none"
										/>
									</div>
									<div class="sm:col-span-2">
										<label
											for="edit-{cat.id}-desc"
											class="mb-1 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
											>Description</label
										>
										<input
											id="edit-{cat.id}-desc"
											name="description"
											type="text"
											value={cat.description ?? ''}
											placeholder="Brief description…"
											class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-2.5 font-body text-sm text-on-surface focus:border-primary/50 focus:outline-none"
										/>
									</div>
									<div class="sm:col-span-2">
										<label
											for="edit-{cat.id}-img"
											class="mb-1 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
											>Image URL</label
										>
										<input
											id="edit-{cat.id}-img"
											name="image_url"
											type="url"
											value={cat.image_url ?? ''}
											placeholder="https://…"
											class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-2.5 font-body text-sm text-on-surface focus:border-primary/50 focus:outline-none"
										/>
									</div>
									<div class="flex gap-3 sm:col-span-2">
										<button
											type="submit"
											disabled={loading}
											class="shadow-ambient rounded-full bg-gradient-to-r from-primary to-primary-dim px-6 py-2.5 font-body text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
										>
											{loading ? 'Saving…' : 'Save Changes'}
										</button>
										<button
											type="button"
											onclick={() => (editingId = null)}
											class="rounded-full bg-surface-high px-6 py-2.5 font-body text-sm font-semibold text-on-surface-muted transition-colors hover:bg-surface-low"
										>
											Cancel
										</button>
									</div>
								</form>
							</td>
						</tr>
					{:else}
						<tr class="transition-colors hover:bg-surface">
							<td class="px-5 py-4 font-body font-medium text-on-surface">{cat.name}</td>
							<td class="px-5 py-4 font-mono text-xs text-on-surface-muted">{cat.slug}</td>
							<td class="px-5 py-4 font-body text-sm text-on-surface-muted">{cat.tagline ?? '—'}</td
							>
							<td class="px-5 py-4 text-center font-body text-sm text-on-surface-muted"
								>{cat.display_order}</td
							>
							<td class="px-5 py-4 text-right">
								<div class="flex items-center justify-end gap-2">
									<button
										onclick={() => {
											editingId = cat.id;
											showForm = false;
										}}
										class="rounded-xl bg-secondary-container px-3 py-1.5 font-body text-xs text-secondary transition-colors hover:bg-secondary hover:text-white"
										>Edit</button
									>
									<form method="POST" action="?/delete" use:enhance class="inline">
										<input type="hidden" name="id" value={cat.id} />
										<button
											type="submit"
											onclick={(e) => {
												if (!confirm('Delete this category?')) e.preventDefault();
											}}
											class="rounded-xl bg-primary/10 px-3 py-1.5 font-body text-xs text-primary transition-colors hover:bg-primary hover:text-white"
											>Delete</button
										>
									</form>
								</div>
							</td>
						</tr>
					{/if}
				{:else}
					<tr
						><td colspan="5" class="px-5 py-8 text-center font-body text-sm text-on-surface-muted"
							>No categories yet.</td
						></tr
					>
				{/each}
			</tbody>
		</table>
	</div>
</div>
