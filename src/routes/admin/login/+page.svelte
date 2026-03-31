<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let loading = $state(false);
</script>

<svelte:head><title>Admin Login — Krafted Loops Studio</title></svelte:head>

<div class="flex min-h-screen items-center justify-center bg-surface px-4">
	<div class="w-full max-w-sm">
		<!-- Logo -->
		<div class="mb-8 text-center">
			<div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
				<span class="text-2xl">🧶</span>
			</div>
			<h1 class="font-display text-2xl font-semibold text-on-surface">Admin Access</h1>
			<p class="mt-1 font-body text-sm text-on-surface-muted">Krafted Loops Studio</p>
		</div>

		<div class="rounded-3xl bg-surface-card p-8 shadow-ambient">
			{#if form?.error}
				<div class="mb-5 rounded-2xl bg-primary/10 px-4 py-3 font-body text-sm text-primary">
					{form.error}
				</div>
			{/if}

			<form
				method="POST"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						loading = false;
						await update();
					};
				}}
				class="space-y-5"
			>
				<div>
					<label for="email" class="mb-1.5 block font-body text-xs font-semibold uppercase tracking-wider text-on-surface-muted">
						Email
					</label>
					<input
						id="email"
						name="email"
						type="email"
						required
						autocomplete="email"
						class="w-full rounded-2xl bg-surface-low px-4 py-3 font-body text-sm text-on-surface placeholder-on-surface-muted/50 outline-none ring-1 ring-transparent transition focus:ring-primary"
						placeholder="admin@example.com"
					/>
				</div>

				<div>
					<label for="password" class="mb-1.5 block font-body text-xs font-semibold uppercase tracking-wider text-on-surface-muted">
						Password
					</label>
					<input
						id="password"
						name="password"
						type="password"
						required
						autocomplete="current-password"
						class="w-full rounded-2xl bg-surface-low px-4 py-3 font-body text-sm text-on-surface placeholder-on-surface-muted/50 outline-none ring-1 ring-transparent transition focus:ring-primary"
						placeholder="••••••••"
					/>
				</div>

				<button
					type="submit"
					disabled={loading}
					class="w-full rounded-full bg-gradient-to-r from-primary to-primary-dim py-3 font-body text-sm font-semibold text-white shadow-ambient transition hover:brightness-110 disabled:opacity-60"
				>
					{loading ? 'Signing in…' : 'Sign In'}
				</button>
			</form>
		</div>

		<p class="mt-6 text-center font-body text-xs text-on-surface-muted">
			<a href="/" class="hover:text-on-surface">← Back to store</a>
		</p>
	</div>
</div>
