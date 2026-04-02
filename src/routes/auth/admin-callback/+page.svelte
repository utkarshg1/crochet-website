<script lang="ts">
	import { onMount } from 'svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { createClient } from '$lib/supabase';

	let status = $state<'loading' | 'error'>('loading');
	let errorMsg = $state('');
	let debugInfo = $state('');

	onMount(async () => {
		const supabase = createClient();

		// Capture full URL for debugging
		debugInfo = `search: ${window.location.search} | hash: ${window.location.hash.substring(0, 60)}`;

		const queryParams = new URLSearchParams(window.location.search);

		// Supabase returned an error
		if (queryParams.get('error')) {
			errorMsg = queryParams.get('error_description')?.replace(/\+/g, ' ') ?? 'Link invalid or expired';
			status = 'error';
			return;
		}

		// Case 1: PKCE flow — @supabase/ssr forces this by default, ?code= in query
		const code = queryParams.get('code');
		if (code) {
			const { error } = await supabase.auth.exchangeCodeForSession(code);
			if (!error) {
				await invalidateAll();
				await goto('/admin');
				return;
			}
			errorMsg = `PKCE exchange failed: ${error.message}`;
			status = 'error';
			return;
		}

		// Case 2: Implicit flow — #access_token= in hash
		const hash = window.location.hash.substring(1);
		const hashParams = new URLSearchParams(hash);
		const access_token = hashParams.get('access_token');
		const refresh_token = hashParams.get('refresh_token');
		if (access_token && refresh_token) {
			const { error } = await supabase.auth.setSession({ access_token, refresh_token });
			if (!error) {
				await invalidateAll();
				await goto('/admin');
				return;
			}
			errorMsg = `Set session failed: ${error.message}`;
			status = 'error';
			return;
		}

		// Case 3: Already logged in
		const { data: { session } } = await supabase.auth.getSession();
		if (session) {
			await invalidateAll();
			await goto('/admin');
			return;
		}

		errorMsg = 'No auth data found in URL. See debug info below.';
		status = 'error';
	});
</script>

<svelte:head><title>Admin Sign In… — Krafted Loops Studio</title></svelte:head>

<div class="flex min-h-[60vh] items-center justify-center px-4">
	{#if status === 'loading'}
		<div class="text-center">
			<div class="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
			<p class="font-body text-sm text-on-surface-muted">Signing you in…</p>
		</div>
	{:else}
		<div class="rounded-3xl bg-surface-card p-10 text-center shadow-ambient max-w-md">
			<div class="text-4xl mb-4">⚠️</div>
			<p class="font-display text-xl text-on-surface">Sign-in failed</p>
			<p class="mt-2 font-body text-sm text-on-surface-muted">{errorMsg}</p>
			{#if debugInfo}
				<p class="mt-3 rounded-xl bg-surface-low px-3 py-2 font-mono text-xs text-on-surface-muted break-all text-left">{debugInfo}</p>
			{/if}
			<a href="/admin/login" class="mt-6 inline-block rounded-full bg-gradient-to-r from-primary to-primary-dim px-6 py-2.5 font-body text-sm font-semibold text-white shadow-ambient hover:brightness-110">
				Try again
			</a>
		</div>
	{/if}
</div>
