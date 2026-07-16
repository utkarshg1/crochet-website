<script lang="ts">
	import { enhance } from '$app/forms';
	import { createClient } from '$lib/supabase';
	import { onMount } from 'svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let loading = $state(false);
	let resetEmailSent = $state(false);
	let resetLoading = $state(false);
	let adminEmail = $state('');
	let supabase: ReturnType<typeof createClient>;

	onMount(() => {
		supabase = createClient();
	});

	async function handleForgotPassword() {
		if (!adminEmail.trim() || !adminEmail.includes('@')) return;
		resetLoading = true;
		await supabase.auth.resetPasswordForEmail(adminEmail.trim().toLowerCase(), {
			redirectTo: 'https://krafted-loops-studios.vercel.app/auth/reset-password'
		});
		resetLoading = false;
		resetEmailSent = true;
	}
</script>

<svelte:head><title>Admin Login — Krafted Loops Studio</title></svelte:head>

<div class="flex min-h-screen items-center justify-center bg-surface px-4">
	<div class="w-full max-w-sm">
		<div class="mb-8 text-center">
			<div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
				<span class="text-2xl">🧶</span>
			</div>
			<h1 class="font-display text-2xl font-semibold text-on-surface">Admin Access</h1>
			<p class="mt-1 font-body text-sm text-on-surface-muted">Krafted Loops Studio</p>
		</div>

		<div class="shadow-ambient rounded-3xl bg-surface-card p-8">
			{#if form?.error}
				<div class="mb-4 rounded-2xl bg-primary/10 px-4 py-3 font-body text-sm text-primary">
					{form.error}
				</div>
			{/if}

			<p class="mb-5 font-body text-sm text-on-surface-muted">
				Sign in with your admin credentials.
			</p>

			<form
				method="POST"
				action="?/signIn"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						await update();
						loading = false;
					};
				}}
				class="space-y-4"
			>
				<div>
					<label
						for="adm-email"
						class="mb-1.5 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
						>Email</label
					>
					<input
						id="adm-email"
						name="email"
						type="email"
						required
						autocomplete="email"
						bind:value={adminEmail}
						class="w-full rounded-2xl bg-surface-low px-4 py-3 font-body text-sm text-on-surface ring-1 ring-transparent transition outline-none focus:ring-primary"
						placeholder="admin@example.com"
					/>
				</div>
				<div>
					<label
						for="adm-password"
						class="mb-1.5 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
						>Password</label
					>
					<input
						id="adm-password"
						name="password"
						type="password"
						required
						minlength="8"
						autocomplete="current-password"
						class="w-full rounded-2xl bg-surface-low px-4 py-3 font-body text-sm text-on-surface ring-1 ring-transparent transition outline-none focus:ring-primary"
						placeholder="••••••••"
					/>
					<div class="flex items-center justify-between">
						<span></span>
						{#if resetEmailSent}
							<span class="font-body text-xs text-secondary">Check your email!</span>
						{:else}
							<button
								type="button"
								onclick={handleForgotPassword}
								disabled={resetLoading}
								class="font-body text-xs text-on-surface-muted transition-colors hover:text-primary disabled:opacity-60"
							>
								{resetLoading ? 'Sending…' : 'Forgot Password?'}
							</button>
						{/if}
					</div>
				</div>
				<button
					type="submit"
					disabled={loading}
					class="shadow-ambient w-full rounded-full bg-gradient-to-r from-primary to-primary-dim py-3 font-body text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
				>
					{loading ? 'Signing In…' : 'Sign In'}
				</button>
			</form>
		</div>
		<p class="mt-6 text-center font-body text-xs text-on-surface-muted">
			<a href="/" class="hover:text-on-surface">← Back to store</a>
		</p>
	</div>
</div>
