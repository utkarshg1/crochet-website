<script lang="ts">
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import { createClient } from '$lib/supabase';
	import Modal from '$lib/components/ui/Modal.svelte';
	import type { PageData, ActionData } from './$types';

	const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB — must match Supabase storage bucket limit

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let loading = $state(false);
	let showForm = $state(false);
	let editingId = $state<string | null>(null);

	let supabase: ReturnType<typeof createClient>;
	onMount(() => {
		supabase = createClient();
	});

	// ── Error modal state ─────────────────────────────────────────────────────
	let errorModalOpen = $state(false);
	let errorModalMessage = $state('');

	function showError(message: string) {
		errorModalMessage = message;
		errorModalOpen = true;
	}

	// ── Create form image state ──────────────────────────────────────────────
	let newFile = $state<File | null>(null);
	let newPreview = $state('');

	// ── Edit form image state ────────────────────────────────────────────────
	let editFile = $state<File | null>(null);
	let editPreview = $state('');
	let editExistingUrl = $state('');

	function onNewFileChange(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0] ?? null;
		if (file && file.size > MAX_FILE_SIZE) {
			showError(
				`Image size limit exceeded. The file is ${formatFileSize(file.size)}, but the maximum allowed size is ${formatFileSize(MAX_FILE_SIZE)}. Please choose a smaller image.`
			);
			input.value = '';
			return;
		}
		newFile = file;
		newPreview = file ? URL.createObjectURL(file) : '';
	}

	function onEditFileChange(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0] ?? null;
		if (file && file.size > MAX_FILE_SIZE) {
			showError(
				`Image size limit exceeded. The file is ${formatFileSize(file.size)}, but the maximum allowed size is ${formatFileSize(MAX_FILE_SIZE)}. Please choose a smaller image.`
			);
			input.value = '';
			return;
		}
		editFile = file;
		editPreview = file ? URL.createObjectURL(file) : '';
	}

	function openEdit(cat: { id: string; image_url?: string | null }) {
		if (editingId === cat.id) {
			editingId = null;
			return;
		}
		editingId = cat.id;
		editFile = null;
		editPreview = '';
		editExistingUrl = cat.image_url ?? '';
	}

	function removeEditExisting() {
		editExistingUrl = '';
	}

	function formatFileSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}

	type UploadResult = { ok: true; url: string } | { ok: false; error: string };

	async function uploadImage(file: File): Promise<UploadResult> {
		const ext = file.name.split('.').pop();
		const path = `category/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
		const { error } = await supabase.storage.from('product-images').upload(path, file);
		if (error) {
			const msg = error.message ?? 'Unknown upload error';
			if (msg.includes('file_size') || msg.includes('too large') || msg.includes('File size')) {
				return {
					ok: false,
					error: `Image size limit exceeded. Maximum file size is ${formatFileSize(MAX_FILE_SIZE)}.`
				};
			}
			return { ok: false, error: `Upload failed: ${msg}` };
		}
		const {
			data: { publicUrl }
		} = supabase.storage.from('product-images').getPublicUrl(path);
		return {
			ok: true,
			url: publicUrl
		};
	}

	$effect(() => {
		if ((form as Record<string, unknown>)?.success) {
			showForm = false;
			newFile = null;
			newPreview = '';
		}
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
				use:enhance={({ formElement, cancel }) => {
					loading = true;
					cancel();
					(async () => {
						let imageUrl = '';
						if (newFile) {
							const result = await uploadImage(newFile);
							if (!result.ok) {
								showError(result.error);
								loading = false;
								return;
							}
							imageUrl = result.url;
						}
						const hidden = formElement.querySelector<HTMLInputElement>('input[name="image_url"]')!;
						hidden.value = imageUrl;
						const fd = new FormData(formElement);
						const res = await fetch(formElement.action, { method: 'POST', body: fd });
						loading = false;
						if (res.ok) {
							showForm = false;
							newFile = null;
							newPreview = '';
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
				<input type="hidden" name="image_url" value="" />
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
					<span
						class="mb-1 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
						>Category Image</span
					>
					<label
						class="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-on-surface/20 bg-surface-high px-4 py-3 transition-colors hover:border-primary/40 hover:bg-surface-low"
					>
						<span class="font-body text-sm text-on-surface-muted">
							{newFile ? newFile.name : 'Click to select an image…'}
						</span>
						<input type="file" accept="image/*" class="sr-only" onchange={onNewFileChange} />
					</label>
					{#if newPreview}
						<div class="mt-3">
							<img
								src={newPreview}
								alt="Preview"
								class="h-20 w-20 rounded-xl object-cover ring-1 ring-on-surface/10"
							/>
						</div>
					{/if}
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
									use:enhance={({ formElement, cancel }) => {
										loading = true;
										cancel();
										(async () => {
											let imageUrl = editExistingUrl;
											if (editFile) {
												const result = await uploadImage(editFile);
												if (!result.ok) {
													showError(result.error);
													loading = false;
													return;
												}
												imageUrl = result.url;
											}
											const hidden =
												formElement.querySelector<HTMLInputElement>('input[name="image_url"]')!;
											hidden.value = imageUrl;
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
									class="grid grid-cols-1 gap-4 sm:grid-cols-2"
								>
									<input type="hidden" name="id" value={cat.id} />
									<input type="hidden" name="image_url" value={cat.image_url ?? ''} />
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
										<span
											class="mb-1 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
											>Category Image</span
										>
										{#if editExistingUrl && !editPreview}
											<div class="mb-2 flex items-center gap-3">
												<img
													src={editExistingUrl}
													alt=""
													class="h-20 w-20 rounded-xl object-cover ring-1 ring-on-surface/10"
												/>
												<button
													type="button"
													onclick={removeEditExisting}
													class="rounded-lg bg-primary/10 px-2 py-1 font-body text-xs text-primary transition-colors hover:bg-primary hover:text-white"
												>
													Remove
												</button>
											</div>
										{/if}
										{#if editPreview}
											<div class="mb-2 flex items-center gap-3">
												<img
													src={editPreview}
													alt="Preview"
													class="h-20 w-20 rounded-xl object-cover ring-1 ring-primary/30"
												/>
												<button
													type="button"
													onclick={() => {
														editFile = null;
														editPreview = '';
													}}
													class="rounded-lg bg-primary/10 px-2 py-1 font-body text-xs text-primary transition-colors hover:bg-primary hover:text-white"
												>
													Remove
												</button>
											</div>
										{/if}
										<label
											class="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-on-surface/20 bg-surface-high px-4 py-3 transition-colors hover:border-primary/40 hover:bg-surface"
										>
											<span class="font-body text-sm text-on-surface-muted">
												{editFile ? editFile.name : 'Click to replace image…'}
											</span>
											<input
												type="file"
												accept="image/*"
												class="sr-only"
												onchange={onEditFileChange}
											/>
										</label>
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
										onclick={() => openEdit(cat)}
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

<Modal
	open={errorModalOpen}
	title="Upload Error"
	variant="error"
	onclose={() => (errorModalOpen = false)}
>
	{errorModalMessage}
</Modal>
