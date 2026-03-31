<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatPrice } from '$lib/types';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let showForm = $state(false);
	let loading = $state(false);
	let search = $state('');

	const filtered = $derived(
		data.products.filter(
			(p) =>
				!search ||
				p.title.toLowerCase().includes(search.toLowerCase()) ||
				p.tags?.some((t: string) => t.toLowerCase().includes(search.toLowerCase()))
		)
	);

	$effect(() => {
		if ((form as Record<string, unknown>)?.success) showForm = false;
	});
</script>

<svelte:head><title>Products — Admin</title></svelte:head>

<div class="p-8">
	<div class="mb-6 flex items-center justify-between gap-4">
		<h1 class="font-display text-3xl font-semibold text-on-surface">Products</h1>
		<button
			onclick={() => (showForm = !showForm)}
			class="rounded-full bg-gradient-to-r from-primary to-primary-dim px-5 py-2.5 font-body text-sm font-semibold text-white shadow-ambient hover:brightness-110 active:scale-95"
		>
			{showForm ? '✕ Cancel' : '+ New Product'}
		</button>
	</div>

	<!-- Error -->
	{#if (form as Record<string, unknown>)?.error}
		<div class="mb-4 rounded-2xl bg-primary/10 px-4 py-3 font-body text-sm text-primary">
			{(form as Record<string, unknown>).error}
		</div>
	{/if}

	<!-- New product form -->
	{#if showForm}
		<div class="mb-8 rounded-3xl bg-surface-card p-6 shadow-ambient">
			<h2 class="mb-5 font-display text-xl font-semibold text-on-surface">New Product</h2>
			<form
				method="POST"
				action="?/create"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => { await update(); loading = false; };
				}}
				class="grid grid-cols-1 gap-4 sm:grid-cols-2"
			>
				<div class="sm:col-span-2">
					<label class="label-field">Title *</label>
					<input name="title" type="text" required placeholder="Chunky Bunny Amigurumi" class="field" />
				</div>
				<div class="sm:col-span-2">
					<label class="label-field">Description *</label>
					<textarea name="description" required rows="3" placeholder="Describe this handmade piece…" class="field resize-none"></textarea>
				</div>
				<div>
					<label class="label-field">Price (₹) *</label>
					<input name="price" type="number" step="0.01" min="0" required placeholder="1299" class="field" />
				</div>
				<div>
					<label class="label-field">Compare Price (₹)</label>
					<input name="compare_price" type="number" step="0.01" min="0" placeholder="1599" class="field" />
				</div>
				<div>
					<label class="label-field">Stock *</label>
					<input name="stock" type="number" min="0" required placeholder="10" class="field" />
				</div>
				<div>
					<label class="label-field">Category</label>
					<select name="category_id" class="field">
						<option value="">— None —</option>
						{#each data.categories as cat}
							<option value={cat.id}>{cat.name}</option>
						{/each}
					</select>
				</div>
				<div>
					<label class="label-field">Colours (comma-separated)</label>
					<input name="colors" type="text" placeholder="Cream, Blush Pink, Sage Green" class="field" />
				</div>
				<div>
					<label class="label-field">Tags (comma-separated)</label>
					<input name="tags" type="text" placeholder="bunny, amigurumi, gift" class="field" />
				</div>
				<div>
					<label class="label-field">Materials</label>
					<input name="materials" type="text" placeholder="100% cotton yarn" class="field" />
				</div>
				<div>
					<label class="label-field">Dimensions</label>
					<input name="dimensions" type="text" placeholder="20cm tall" class="field" />
				</div>
				<div class="sm:col-span-2">
					<label class="label-field">Care Instructions</label>
					<input name="care_instructions" type="text" placeholder="Hand wash cold, lay flat to dry" class="field" />
				</div>
				<div class="flex items-center gap-6 sm:col-span-2">
					<label class="flex items-center gap-2 font-body text-sm text-on-surface cursor-pointer">
						<input name="is_featured" type="checkbox" class="rounded" />
						Featured product
					</label>
					<label class="flex items-center gap-2 font-body text-sm text-on-surface cursor-pointer">
						<input name="is_new" type="checkbox" class="rounded" />
						Mark as New
					</label>
				</div>
				<div class="sm:col-span-2">
					<button
						type="submit"
						disabled={loading}
						class="rounded-full bg-gradient-to-r from-primary to-primary-dim px-8 py-3 font-body font-semibold text-white shadow-ambient hover:brightness-110 disabled:opacity-60 active:scale-95"
					>
						{loading ? 'Saving…' : 'Create Product'}
					</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- Search -->
	<div class="mb-4">
		<input
			type="search"
			bind:value={search}
			placeholder="Search products…"
			class="w-full max-w-xs rounded-full border border-on-surface/10 bg-surface-card px-5 py-2.5 font-body text-sm text-on-surface shadow-ambient focus:border-primary/50 focus:outline-none"
		/>
	</div>

	<!-- Products table -->
	<div class="rounded-3xl bg-surface-card shadow-ambient overflow-hidden">
		<table class="w-full text-sm">
			<thead class="bg-surface-low">
				<tr>
					<th class="px-5 py-3 text-left font-body text-xs font-semibold uppercase tracking-wider text-on-surface-muted">Product</th>
					<th class="px-5 py-3 text-left font-body text-xs font-semibold uppercase tracking-wider text-on-surface-muted">Category</th>
					<th class="px-5 py-3 text-right font-body text-xs font-semibold uppercase tracking-wider text-on-surface-muted">Price</th>
					<th class="px-5 py-3 text-center font-body text-xs font-semibold uppercase tracking-wider text-on-surface-muted">Stock</th>
					<th class="px-5 py-3 text-center font-body text-xs font-semibold uppercase tracking-wider text-on-surface-muted">Status</th>
					<th class="px-5 py-3 text-right font-body text-xs font-semibold uppercase tracking-wider text-on-surface-muted">Actions</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-surface-low">
				{#each filtered as product}
					<tr class="hover:bg-surface transition-colors">
						<td class="px-5 py-4">
							<div>
								<p class="font-body font-medium text-on-surface">{product.title}</p>
								<p class="font-body text-xs text-on-surface-muted mt-0.5">/{product.slug}</p>
							</div>
						</td>
						<td class="px-5 py-4 font-body text-xs text-on-surface-muted">
							{product.category?.name ?? '—'}
						</td>
						<td class="px-5 py-4 text-right font-body font-semibold text-on-surface">
							{formatPrice(product.price_paise)}
							{#if product.compare_at_price_paise}
								<span class="block font-body text-xs font-normal text-on-surface-muted line-through">{formatPrice(product.compare_at_price_paise)}</span>
							{/if}
						</td>
						<td class="px-5 py-4 text-center">
							<form method="POST" action="?/updateStock" use:enhance class="inline-flex items-center gap-1">
								<input type="hidden" name="id" value={product.id} />
								<input
									name="stock"
									type="number"
									value={product.stock}
									min="0"
									class="w-16 rounded-xl border border-on-surface/10 bg-surface-high px-2 py-1 text-center font-body text-sm"
								/>
								<button type="submit" class="rounded-lg bg-secondary-container px-2 py-1 font-body text-xs text-secondary hover:bg-secondary hover:text-white transition-colors">
									Save
								</button>
							</form>
						</td>
						<td class="px-5 py-4 text-center">
							<div class="flex justify-center gap-1 flex-wrap">
								{#if product.is_featured}
									<span class="chip bg-primary/10 px-2 py-0.5 font-body text-xs text-primary">Featured</span>
								{/if}
								{#if product.is_new}
									<span class="chip bg-secondary-container px-2 py-0.5 font-body text-xs text-secondary">New</span>
								{/if}
								{#if product.stock === 0}
									<span class="chip bg-primary/10 px-2 py-0.5 font-body text-xs text-primary">Out of Stock</span>
								{/if}
							</div>
						</td>
						<td class="px-5 py-4 text-right">
							<div class="flex justify-end gap-2">
								<a
									href="/shop/{product.slug}"
									target="_blank"
									class="rounded-xl bg-surface-high px-3 py-1.5 font-body text-xs text-on-surface hover:bg-surface-low"
								>View</a>
								<form method="POST" action="?/delete" use:enhance class="inline">
									<input type="hidden" name="id" value={product.id} />
									<button
										type="submit"
										onclick={(e) => { if (!confirm('Delete this product?')) e.preventDefault(); }}
										class="rounded-xl bg-primary/10 px-3 py-1.5 font-body text-xs text-primary hover:bg-primary hover:text-white transition-colors"
									>
										Delete
									</button>
								</form>
							</div>
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="6" class="px-5 py-10 text-center font-body text-sm text-on-surface-muted">
							No products found.
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	.field {
		width: 100%;
		border-radius: 0.75rem;
		border: 1px solid rgba(21, 52, 48, 0.1);
		background-color: var(--color-surface-high);
		padding: 0.625rem 1rem;
		font-family: var(--font-body);
		font-size: 0.875rem;
		color: var(--color-on-surface);
	}
	.field:focus {
		outline: none;
		border-color: rgba(167, 41, 90, 0.4);
	}
	.label-field {
		display: block;
		margin-bottom: 0.25rem;
		font-family: var(--font-body);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-on-surface-muted);
	}
</style>
