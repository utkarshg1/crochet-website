<script lang="ts">
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import { formatPrice } from '$lib/types';
	import { createClient } from '$lib/supabase';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// ── Supabase browser client (must be created client-side) ──────────────────
	let supabase: ReturnType<typeof createClient>;
	onMount(() => {
		supabase = createClient();
	});

	// ── UI state ───────────────────────────────────────────────────────────────
	let showForm = $state(false);
	let loading = $state(false);
	let search = $state('');
	let editingId = $state<string | null>(null);

	// ── New-product form image state ───────────────────────────────────────────
	let newFiles = $state<FileList | null>(null);
	let newPreviews = $state<string[]>([]);

	// ── Per-product edit image state ───────────────────────────────────────────
	// Keyed by product.id; each entry holds selected files and a copy of
	// existing images so the user can remove them before saving.
	type EditImageState = {
		files: FileList | null;
		previews: string[];
		existingImages: string[];
	};
	let editImageState = $state<Record<string, EditImageState>>({});

	function getEditState(productId: string): EditImageState {
		if (!editImageState[productId]) {
			editImageState[productId] = { files: null, previews: [], existingImages: [] };
		}
		return editImageState[productId];
	}

	// Initialise edit state with the product's current images when expanding
	function openEdit(productId: string, existingImages: string[] | null) {
		editingId = editingId === productId ? null : productId;
		if (editingId === productId) {
			editImageState[productId] = {
				files: null,
				previews: [],
				existingImages: existingImages ?? []
			};
		}
	}

	// ── Derived ────────────────────────────────────────────────────────────────
	const filtered = $derived(
		data.products.filter(
			(p) =>
				!search ||
				p.title.toLowerCase().includes(search.toLowerCase()) ||
				p.tags?.some((t: string) => t.toLowerCase().includes(search.toLowerCase()))
		)
	);

	// ── Reset state after successful actions ──────────────────────────────────
	$effect(() => {
		if ((form as Record<string, unknown>)?.success) {
			showForm = false;
			newFiles = null;
			newPreviews = [];
		}
		if ((form as Record<string, unknown>)?.updated) {
			editingId = null;
		}
	});

	// ── Image preview helpers ──────────────────────────────────────────────────
	function buildPreviews(files: FileList | null): string[] {
		if (!files) return [];
		return Array.from(files).map((f) => URL.createObjectURL(f));
	}

	function onNewFilesChange(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		newFiles = input.files;
		newPreviews = buildPreviews(newFiles);
	}

	function onEditFilesChange(e: Event, productId: string) {
		const input = e.currentTarget as HTMLInputElement;
		const state = getEditState(productId);
		state.files = input.files;
		state.previews = buildPreviews(state.files);
		editImageState[productId] = state;
	}

	function removeExistingImage(productId: string, url: string) {
		const state = getEditState(productId);
		state.existingImages = state.existingImages.filter((u) => u !== url);
		editImageState[productId] = state;
	}

	function setPrimaryImage(productId: string, url: string) {
		const state = getEditState(productId);
		const rest = state.existingImages.filter((u) => u !== url);
		state.existingImages = [url, ...rest];
		editImageState[productId] = state;
	}

	// ── Image URL extractor ────────────────────────────────────────────────────
	// product.images[0] can be a plain URL string OR a {url, alt} object
	function getImageUrl(img: unknown): string {
		if (!img) return '';
		if (typeof img === 'string') return img;
		if (typeof img === 'object' && img !== null && 'url' in img) return (img as { url: string }).url;
		return '';
	}

	// ── Upload helper ──────────────────────────────────────────────────────────
	async function uploadImages(files: FileList | null): Promise<string[]> {
		if (!files || files.length === 0) return [];
		const urls: string[] = [];
		for (const file of Array.from(files)) {
			const ext = file.name.split('.').pop();
			const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
			const { error } = await supabase.storage.from('product-images').upload(path, file);
			if (!error) {
				urls.push(
					`https://wflyfhebauhsgqpfmfrr.supabase.co/storage/v1/object/public/product-images/${path}`
				);
			}
		}
		return urls;
	}
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

	<!-- ── New product form ────────────────────────────────────────────────── -->
	{#if showForm}
		<div class="mb-8 rounded-3xl bg-surface-card p-6 shadow-ambient">
			<h2 class="mb-5 font-display text-xl font-semibold text-on-surface">New Product</h2>
			<form
				method="POST"
				action="?/create"
				use:enhance={({ formElement, cancel }) => {
					loading = true;
					// Upload images first, then inject URLs as a hidden field and submit
					cancel(); // prevent the default immediate submit
					(async () => {
						const uploaded = await uploadImages(newFiles);
						const hiddenImages = formElement.querySelector<HTMLInputElement>(
							'input[name="images"]'
						)!;
						hiddenImages.value = JSON.stringify(uploaded);
						// Re-submit with SvelteKit's enhance by triggering a programmatic submit
						// We bypass cancel by directly calling requestSubmit on a cloned approach —
						// instead, we swap to a native fetch-based form submission here.
						const fd = new FormData(formElement);
						const res = await fetch(formElement.action, { method: 'POST', body: fd });
						loading = false;
						if (res.ok) {
							showForm = false;
							newFiles = null;
							newPreviews = [];
							// Reload to refresh the product list
							window.location.reload();
						}
					})();
					return async ({ update }) => {
						await update();
						loading = false;
					};
				}}
				class="grid grid-cols-1 gap-4 sm:grid-cols-2"
			>
				<!-- Hidden field that will be populated with image URLs before submit -->
				<input type="hidden" name="images" value="[]" />

			<div class="sm:col-span-2">
				<label for="new-title" class="label-field">Title *</label>
				<input id="new-title" name="title" type="text" required placeholder="Crochet Forever Rose Bouquet" class="field" />
			</div>
			<div class="sm:col-span-2">
				<label for="new-description" class="label-field">Description *</label>
				<textarea id="new-description" name="description" required rows="3" placeholder="Describe this handmade piece…" class="field resize-none"></textarea>
			</div>
			<div>
				<label for="new-price" class="label-field">Price (₹) *</label>
				<input id="new-price" name="price" type="number" step="0.01" min="0" required placeholder="1299" class="field" />
			</div>
			<div>
				<label for="new-compare-price" class="label-field">Compare Price (₹)</label>
				<input id="new-compare-price" name="compare_price" type="number" step="0.01" min="0" placeholder="1599" class="field" />
			</div>
			<div>
				<label for="new-stock" class="label-field">Stock *</label>
				<input id="new-stock" name="stock" type="number" min="0" required placeholder="10" class="field" />
			</div>
			<div>
				<label for="new-category" class="label-field">Category</label>
				<select id="new-category" name="category_id" class="field">
					<option value="">— None —</option>
					{#each data.categories as cat}
						<option value={cat.id}>{cat.name}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="new-colors" class="label-field">Colours (comma-separated)</label>
				<input id="new-colors" name="colors" type="text" placeholder="Cream, Blush Pink, Sage Green" class="field" />
			</div>
			<div>
				<label for="new-tags" class="label-field">Tags (comma-separated)</label>
				<input id="new-tags" name="tags" type="text" placeholder="flowers, gift, handmade" class="field" />
			</div>
			<div>
				<label for="new-materials" class="label-field">Materials</label>
				<input id="new-materials" name="materials" type="text" placeholder="100% cotton yarn" class="field" />
			</div>
			<div>
				<label for="new-dimensions" class="label-field">Dimensions</label>
				<input id="new-dimensions" name="dimensions" type="text" placeholder="20cm tall" class="field" />
			</div>
			<div class="sm:col-span-2">
				<label for="new-care" class="label-field">Care Instructions</label>
				<input id="new-care" name="care_instructions" type="text" placeholder="Hand wash cold, lay flat to dry" class="field" />
			</div>

				<!-- Image upload -->
				<div class="sm:col-span-2">
					<span class="label-field">Product Images</span>
					<label
						class="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-on-surface/20 bg-surface-high px-4 py-3 transition-colors hover:border-primary/40 hover:bg-surface-low"
					>
						<span class="font-body text-sm text-on-surface-muted">
							{newFiles && newFiles.length > 0
								? `${newFiles.length} file${newFiles.length > 1 ? 's' : ''} selected`
								: 'Click to select images…'}
						</span>
						<input
							type="file"
							accept="image/*"
							multiple
							class="sr-only"
							onchange={onNewFilesChange}
						/>
					</label>
					<!-- Previews -->
					{#if newPreviews.length > 0}
						<div class="mt-3 flex flex-wrap gap-2">
							{#each newPreviews as src}
								<img
									{src}
									alt=""
									class="h-20 w-20 rounded-xl object-cover ring-1 ring-on-surface/10"
								/>
							{/each}
						</div>
					{/if}
				</div>

				<div class="flex items-center gap-6 sm:col-span-2">
					<label class="flex cursor-pointer items-center gap-2 font-body text-sm text-on-surface">
						<input name="is_featured" type="checkbox" class="rounded" />
						Featured product
					</label>
					<label class="flex cursor-pointer items-center gap-2 font-body text-sm text-on-surface">
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
						{loading ? 'Uploading & Saving…' : 'Create Product'}
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

	<!-- ── Products table ─────────────────────────────────────────────────── -->
	<div class="overflow-hidden rounded-3xl bg-surface-card shadow-ambient">
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
					<tr class="transition-colors hover:bg-surface">
						<td class="px-5 py-4">
							<div class="flex items-center gap-3">
								<!-- Thumbnail from first image if present -->
								{#if product.images?.[0]}
									<img
										src={getImageUrl(product.images[0])}
										alt={product.title}
										class="h-10 w-10 flex-none rounded-lg object-cover ring-1 ring-on-surface/10"
									/>
								{:else}
									<div class="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-surface-low font-body text-lg text-on-surface-muted">
										📷
									</div>
								{/if}
								<div>
									<p class="font-body font-medium text-on-surface">{product.title}</p>
									<p class="mt-0.5 font-body text-xs text-on-surface-muted">/{product.slug}</p>
								</div>
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
								<button type="submit" class="rounded-lg bg-secondary-container px-2 py-1 font-body text-xs text-secondary transition-colors hover:bg-secondary hover:text-white">
									Save
								</button>
							</form>
						</td>
						<td class="px-5 py-4 text-center">
							<div class="flex flex-wrap justify-center gap-1">
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
								<button
									onclick={() => openEdit(product.id, product.images ?? [])}
									class="rounded-xl bg-secondary-container px-3 py-1.5 font-body text-xs text-secondary transition-colors hover:bg-secondary hover:text-white"
								>
									{editingId === product.id ? 'Cancel' : 'Edit'}
								</button>
								<form method="POST" action="?/delete" use:enhance class="inline">
									<input type="hidden" name="id" value={product.id} />
									<button
										type="submit"
										onclick={(e) => { if (!confirm('Delete this product?')) e.preventDefault(); }}
										class="rounded-xl bg-primary/10 px-3 py-1.5 font-body text-xs text-primary transition-colors hover:bg-primary hover:text-white"
									>
										Delete
									</button>
								</form>
							</div>
						</td>
					</tr>

					<!-- ── Inline edit row ─────────────────────────────────────────────── -->
					{#if editingId === product.id}
						{@const es = getEditState(product.id)}
						<tr class="bg-surface-low">
							<td colspan="6" class="px-5 py-5">
								<form
									method="POST"
									action="?/update"
									use:enhance={({ formElement, cancel }) => {
										loading = true;
										cancel();
										(async () => {
											const state = getEditState(product.id);
											const newUrls = await uploadImages(state.files);
											const allImages = [...state.existingImages, ...newUrls];
											const hiddenImages = formElement.querySelector<HTMLInputElement>(
												'input[name="images"]'
											)!;
											hiddenImages.value = JSON.stringify(allImages);
											const fd = new FormData(formElement);
											const res = await fetch(formElement.action, { method: 'POST', body: fd });
											loading = false;
											if (res.ok) {
												editingId = null;
												window.location.reload();
											}
										})();
										return async ({ update }) => {
											await update();
											loading = false;
										};
									}}
									class="grid grid-cols-1 gap-3 sm:grid-cols-3"
								>
									<input type="hidden" name="id" value={product.id} />
									<!-- Populated just before submit -->
									<input type="hidden" name="images" value={JSON.stringify(product.images ?? [])} />

									<div class="sm:col-span-3">
										<label for="edit-title-{product.id}" class="label-field">Title *</label>
										<input id="edit-title-{product.id}" name="title" type="text" required value={product.title} class="field" />
									</div>
									<div class="sm:col-span-3">
										<label for="edit-description-{product.id}" class="label-field">Description *</label>
										<textarea id="edit-description-{product.id}" name="description" required rows="2" class="field resize-none">{product.description}</textarea>
									</div>
									<div>
										<label for="edit-price-{product.id}" class="label-field">Price (₹) *</label>
										<input id="edit-price-{product.id}" name="price" type="number" step="0.01" min="0" required value={product.price_paise / 100} class="field" />
									</div>
									<div>
										<label for="edit-compare-price-{product.id}" class="label-field">Compare Price (₹)</label>
										<input id="edit-compare-price-{product.id}" name="compare_price" type="number" step="0.01" min="0" value={product.compare_at_price_paise ? product.compare_at_price_paise / 100 : ''} class="field" />
									</div>
									<div>
										<label for="edit-stock-{product.id}" class="label-field">Stock *</label>
										<input id="edit-stock-{product.id}" name="stock" type="number" min="0" required value={product.stock} class="field" />
									</div>
									<div>
										<label for="edit-category-{product.id}" class="label-field">Category</label>
										<select id="edit-category-{product.id}" name="category_id" class="field">
											<option value="">— None —</option>
											{#each data.categories as cat}
												<option value={cat.id} selected={product.category_id === cat.id}>{cat.name}</option>
											{/each}
										</select>
									</div>
									<div>
										<label for="edit-colors-{product.id}" class="label-field">Colours</label>
										<input id="edit-colors-{product.id}" name="colors" type="text" value={product.colors?.join(', ') ?? ''} class="field" />
									</div>
									<div>
										<label for="edit-tags-{product.id}" class="label-field">Tags</label>
										<input id="edit-tags-{product.id}" name="tags" type="text" value={product.tags?.join(', ') ?? ''} class="field" />
									</div>
									<div>
										<label for="edit-materials-{product.id}" class="label-field">Materials</label>
										<input id="edit-materials-{product.id}" name="materials" type="text" value={product.materials ?? ''} class="field" />
									</div>
									<div>
										<label for="edit-dimensions-{product.id}" class="label-field">Dimensions</label>
										<input id="edit-dimensions-{product.id}" name="dimensions" type="text" value={product.dimensions ?? ''} class="field" />
									</div>
									<div>
										<label for="edit-care-{product.id}" class="label-field">Care Instructions</label>
										<input id="edit-care-{product.id}" name="care_instructions" type="text" value={product.care_instructions ?? ''} class="field" />
									</div>

									<!-- Existing images with remove buttons -->
									<div class="sm:col-span-3">
										<span class="label-field">Current Images</span>
										{#if es.existingImages.length > 0}
											<div class="flex flex-wrap gap-2">
												{#each es.existingImages as url, idx}
													<div class="group relative">
														<img
															src={url}
															alt=""
															class="h-20 w-20 rounded-xl object-cover ring-1 ring-on-surface/10"
														/>
														<!-- Remove button -->
														<button
															type="button"
															onclick={() => removeExistingImage(product.id, url)}
															class="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary font-body text-xs text-white opacity-0 shadow transition-opacity group-hover:opacity-100"
															aria-label="Remove image"
														>
															×
														</button>
														<!-- Primary indicator (index 0) or Set Primary button (index > 0) -->
														{#if idx === 0}
															<span class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary/90 px-2 py-0.5 font-body text-[10px] text-white shadow">
																Primary
															</span>
														{:else}
															<button
																type="button"
																onclick={() => setPrimaryImage(product.id, url)}
																class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-secondary px-2 py-0.5 font-body text-[10px] text-white opacity-0 group-hover:opacity-100 shadow transition-opacity"
																aria-label="Set as primary image"
															>
																★ Set Primary
															</button>
														{/if}
													</div>
												{/each}
											</div>
										{:else}
											<p class="font-body text-xs text-on-surface-muted">No images yet.</p>
										{/if}
									</div>

									<!-- Add new images -->
									<div class="sm:col-span-3">
										<span class="label-field">Add More Images</span>
										<label
											class="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-on-surface/20 bg-surface-high px-4 py-3 transition-colors hover:border-primary/40 hover:bg-surface"
										>
											<span class="font-body text-sm text-on-surface-muted">
												{es.files && es.files.length > 0
													? `${es.files.length} file${es.files.length > 1 ? 's' : ''} selected`
													: 'Click to add images…'}
											</span>
											<input
												type="file"
												accept="image/*"
												multiple
												class="sr-only"
												onchange={(e) => onEditFilesChange(e, product.id)}
											/>
										</label>
										{#if es.previews.length > 0}
											<div class="mt-3 flex flex-wrap gap-2">
												{#each es.previews as src}
													<img
														{src}
														alt=""
														class="h-20 w-20 rounded-xl object-cover ring-1 ring-primary/30"
													/>
												{/each}
											</div>
										{/if}
									</div>

									<div class="flex items-center gap-6 sm:col-span-3">
										<label class="flex cursor-pointer items-center gap-2 font-body text-sm text-on-surface">
											<input name="is_featured" type="checkbox" checked={product.is_featured} />
											Featured
										</label>
										<label class="flex cursor-pointer items-center gap-2 font-body text-sm text-on-surface">
											<input name="is_new" type="checkbox" checked={product.is_new} />
											New
										</label>
										<button
											type="submit"
											disabled={loading}
											class="ml-auto rounded-full bg-gradient-to-r from-primary to-primary-dim px-6 py-2 font-body text-sm font-semibold text-white shadow-ambient hover:brightness-110 disabled:opacity-60"
										>
											{loading ? 'Uploading & Saving…' : 'Save Changes'}
										</button>
									</div>
								</form>
							</td>
						</tr>
					{/if}
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
