<script lang="ts">
	import { onMount } from 'svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { createClient } from '$lib/supabase';

	let status = $state<'loading' | 'error'>('loading');

	onMount(() => {
		const supabase = createClient();

		// With implicit flow, @supabase/auth-js reads the #access_token hash automatically.
		// Listen for the SIGNED_IN event it fires after parsing the URL.
		const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
			if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
				subscription.unsubscribe();
				await invalidateAll();
				await goto('/account');
			}
		});

		// Fallback: if no SIGNED_IN fires within 4s, show error
		const timer = setTimeout(() => { status = 'error'; }, 4000);

		return () => {
			subscription.unsubscribe();
			clearTimeout(timer);
		};
	});
</script>

<svelte:head><title>Signing in… — Krafted Loops Studio</title></svelte:head>

<div class="flex min-h-[60vh] items-center justify-center px-4">
	{#if status === 'loading'}
		<div class="text-center">
			<div class="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
			<p class="font-body text-sm text-on-surface-muted">Signing you in…</p>
		</div>
	{:else}
		<div class="rounded-3xl bg-surface-card p-10 text-center shadow-ambient max-w-md">
			<div class="text-4xl mb-4">⏱️</div>
			<p class="font-display text-xl text-on-surface">Link expired or already used</p>
			<p class="mt-2 font-body text-sm text-on-surface-muted">
				Sign-in links are valid for 1 hour and can only be used once.
			</p>
			<a
				href="/account"
				class="mt-6 inline-block rounded-full bg-gradient-to-r from-primary to-primary-dim px-6 py-2.5 font-body text-sm font-semibold text-white shadow-ambient hover:brightness-110"
			>
				Request a new link
			</a>
		</div>
	{/if}
</div>
