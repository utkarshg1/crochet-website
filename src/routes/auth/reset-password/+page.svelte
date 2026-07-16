<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { createClient } from '$lib/supabase';

	let status = $state<'loading' | 'form' | 'success' | 'error'>('loading');
	let errorMsg = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let submitting = $state(false);
	let supabase: ReturnType<typeof createClient>;
	let sessionEstablished = $state(false);

	onMount(async () => {
		const params = new URLSearchParams(window.location.search);
		const access_token = params.get('access_token');
		const refresh_token = params.get('refresh_token');

		if (!access_token || !refresh_token) {
			status = 'error';
			errorMsg = 'Invalid reset link. Please request a new one.';
			return;
		}

		supabase = createClient();
		const { error } = await supabase.auth.setSession({ access_token, refresh_token });
		if (error) {
			status = 'error';
			errorMsg = 'Link expired or invalid. Please request a new password reset.';
			return;
		}

		sessionEstablished = true;
		status = 'form';
	});

	async function handleReset(event: Event) {
		event.preventDefault();
		if (newPassword.length < 8) {
			errorMsg = 'Password must be at least 8 characters.';
			return;
		}
		if (newPassword !== confirmPassword) {
			errorMsg = 'Passwords do not match.';
			return;
		}

		submitting = true;
		errorMsg = '';

		const { error } = await supabase.auth.updateUser({ password: newPassword });
		submitting = false;

		if (error) {
			errorMsg = error.message;
			return;
		}

		status = 'success';
	}
</script>

<svelte:head><title>Reset Password — Krafted Loops Studio</title></svelte:head>

<div class="flex min-h-[60vh] items-center justify-center px-4">
	{#if status === 'loading'}
		<div class="text-center">
			<div
				class="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary"
			></div>
			<p class="font-body text-sm text-on-surface-muted">Verifying reset link…</p>
		</div>
	{:else if status === 'form'}
		<div class="shadow-ambient w-full max-w-md rounded-3xl bg-surface-card p-8">
			<div class="mb-6 text-center">
				<div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
					<span class="text-2xl">🔑</span>
				</div>
				<h1 class="font-display text-2xl font-semibold text-on-surface">Reset Password</h1>
				<p class="mt-1 font-body text-sm text-on-surface-muted">Enter your new password below.</p>
			</div>

			{#if errorMsg}
				<div class="mb-4 rounded-2xl bg-primary/10 px-4 py-3 font-body text-sm text-primary">
					{errorMsg}
				</div>
			{/if}

			<form onsubmit={handleReset} class="space-y-4">
				<div>
					<label
						for="new-password"
						class="mb-1 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
					>
						New Password
					</label>
					<input
						id="new-password"
						type="password"
						bind:value={newPassword}
						required
						minlength="8"
						autocomplete="new-password"
						placeholder="At least 8 characters"
						class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:border-primary/50 focus:outline-none"
					/>
				</div>
				<div>
					<label
						for="confirm-password"
						class="mb-1 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
					>
						Confirm Password
					</label>
					<input
						id="confirm-password"
						type="password"
						bind:value={confirmPassword}
						required
						minlength="8"
						autocomplete="new-password"
						placeholder="Repeat password"
						class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:border-primary/50 focus:outline-none"
					/>
				</div>
				<button
					type="submit"
					disabled={submitting}
					class="shadow-ambient w-full rounded-full bg-gradient-to-r from-primary to-primary-dim py-3.5 font-body font-semibold text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-60"
				>
					{submitting ? 'Resetting…' : 'Reset Password'}
				</button>
			</form>
		</div>
	{:else if status === 'success'}
		<div class="shadow-ambient max-w-md rounded-3xl bg-surface-card p-10 text-center">
			<div class="mb-4 text-5xl" aria-hidden="true">✅</div>
			<h1 class="font-display text-2xl font-semibold text-on-surface">Password Reset!</h1>
			<p class="mt-2 font-body text-sm text-on-surface-muted">
				Your password has been updated. You can now sign in with your new password.
			</p>
			<a
				href="/account"
				class="shadow-ambient mt-6 inline-block rounded-full bg-gradient-to-r from-primary to-primary-dim px-6 py-2.5 font-body text-sm font-semibold text-white hover:brightness-110"
			>
				Go to Sign In
			</a>
		</div>
	{:else}
		<div class="shadow-ambient max-w-md rounded-3xl bg-surface-card p-10 text-center">
			<div class="mb-4 text-5xl" aria-hidden="true">⏱️</div>
			<h1 class="font-display text-2xl font-semibold text-on-surface">Link Expired</h1>
			<p class="mt-2 font-body text-sm text-on-surface-muted">{errorMsg}</p>
			<a
				href="/account"
				class="shadow-ambient mt-6 inline-block rounded-full bg-gradient-to-r from-primary to-primary-dim px-6 py-2.5 font-body text-sm font-semibold text-white hover:brightness-110"
			>
				Back to Sign In
			</a>
		</div>
	{/if}
</div>
