<script lang="ts">
	import { onMount } from 'svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { createClient } from '$lib/supabase';

	let status = $state<'loading' | 'error' | 'expired'>('loading');
	let errorMsg = $state('');

	onMount(async () => {
		const queryParams = new URLSearchParams(window.location.search);
		const errorCode = queryParams.get('error_code');

		if (queryParams.get('error')) {
			// Distinguish expired links from other errors
			if (errorCode === 'otp_expired') {
				status = 'expired';
				// Auto-redirect to account page after 3 seconds
				setTimeout(() => goto('/account'), 3000);
				return;
			}
			errorMsg =
				queryParams.get('error_description')?.replace(/\+/g, ' ') ?? 'Link invalid or expired';
			status = 'error';
			return;
		}

		// Read tokens directly from URL hash
		const hash = window.location.hash.substring(1);
		const hashParams = new URLSearchParams(hash);
		const access_token = hashParams.get('access_token');
		const refresh_token = hashParams.get('refresh_token');

		if (access_token && refresh_token) {
			const type = hashParams.get('type');

			if (type === 'recovery') {
				await goto(
					`/auth/reset-password?access_token=${encodeURIComponent(access_token)}&refresh_token=${encodeURIComponent(refresh_token)}`
				);
				return;
			}

			const supabase = createClient();
			const { error } = await supabase.auth.setSession({ access_token, refresh_token });
			if (!error) {
				await invalidateAll();
				await goto('/account');
				return;
			}
			errorMsg = error.message;
			status = 'error';
			return;
		}

		// Fallback: already logged in
		const supabase = createClient();
		const {
			data: { session }
		} = await supabase.auth.getSession();
		if (session) {
			await invalidateAll();
			await goto('/account');
			return;
		}

		status = 'error';
		errorMsg = 'No session found. Please request a new link.';
	});
</script>

<svelte:head><title>Signing in… — Krafted Loops Studio</title></svelte:head>

<div class="flex min-h-[60vh] items-center justify-center px-4">
	{#if status === 'loading'}
		<div class="text-center">
			<div
				class="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary"
			></div>
			<p class="font-body text-sm text-on-surface-muted">Signing you in…</p>
		</div>
	{:else if status === 'expired'}
		<div class="shadow-ambient max-w-md rounded-3xl bg-surface-card p-10 text-center">
			<div class="mb-4 text-4xl">⏱️</div>
			<p class="font-display text-xl text-on-surface">Sign-in link expired</p>
			<p class="mt-2 font-body text-sm text-on-surface-muted">
				This link is no longer valid. Redirecting you to request a new one…
			</p>
			<div class="mt-6">
				<div class="mx-auto h-1 w-32 overflow-hidden rounded-full bg-surface-high">
					<div class="animate-shrink h-full rounded-full bg-primary"></div>
				</div>
			</div>
			<a
				href="/account"
				class="shadow-ambient mt-6 inline-block rounded-full bg-gradient-to-r from-primary to-primary-dim px-6 py-2.5 font-body text-sm font-semibold text-white hover:brightness-110"
			>
				Request a new link now
			</a>
		</div>
	{:else}
		<div class="shadow-ambient max-w-md rounded-3xl bg-surface-card p-10 text-center">
			<div class="mb-4 text-4xl">⏱️</div>
			<p class="font-display text-xl text-on-surface">Sign-in failed</p>
			<p class="mt-2 font-body text-sm text-on-surface-muted">{errorMsg}</p>
			<div class="mt-6 flex flex-col gap-3">
				<a
					href="/account"
					class="shadow-ambient inline-block rounded-full bg-gradient-to-r from-primary to-primary-dim px-6 py-2.5 font-body text-sm font-semibold text-white hover:brightness-110"
				>
					Request a new link
				</a>
				<a
					href="/admin/login"
					class="inline-block rounded-full bg-surface-high px-6 py-2.5 font-body text-sm font-semibold text-on-surface hover:bg-surface-low"
				>
					Admin sign-in
				</a>
			</div>
		</div>
	{/if}
</div>

<style>
	@keyframes shrink {
		from {
			width: 100%;
		}
		to {
			width: 0%;
		}
	}
	.animate-shrink {
		animation: shrink 3s linear forwards;
	}
</style>
