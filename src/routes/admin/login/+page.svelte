<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let loading = $state(false);

	// Derive UI step from server action result
	const step = $derived((form as Record<string, unknown>)?.sent ? 'otp' : 'email');
	const sentEmail = $derived(String((form as Record<string, unknown>)?.email ?? ''));
	const errorMsg = $derived(String((form as Record<string, unknown>)?.error ?? ''));

	function handleOtpVerify() {
		loading = true;
		return async ({ update }: { update: () => Promise<void> }) => {
			// If no error returned, OTP verification succeeded
			if (!errorMsg) {
				localStorage.setItem('admin_access', 'true');
			}
			await update();
			loading = false;
		};
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
			{#if errorMsg}
				<div class="mb-4 rounded-2xl bg-primary/10 px-4 py-3 font-body text-sm text-primary">
					{errorMsg}
				</div>
			{/if}

			{#if step === 'email'}
				<p class="mb-5 font-body text-sm text-on-surface-muted">
					Enter your admin email to receive a sign-in code.
				</p>
				<form
					method="POST"
					action="?/sendOtp"
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
							class="w-full rounded-2xl bg-surface-low px-4 py-3 font-body text-sm text-on-surface ring-1 ring-transparent transition outline-none focus:ring-primary"
							placeholder="admin@example.com"
						/>
					</div>
					<button
						type="submit"
						disabled={loading}
						class="shadow-ambient w-full rounded-full bg-gradient-to-r from-primary to-primary-dim py-3 font-body text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
					>
						{loading ? 'Sending…' : 'Send Code'}
					</button>
				</form>
			{:else}
				<div class="text-center">
					<div class="mb-3 text-4xl">📧</div>
					<p class="font-display text-lg font-semibold text-on-surface">Check your email</p>
					<p class="mt-1 font-body text-sm text-on-surface-muted">
						Enter the 6-digit code sent to <strong class="text-on-surface">{sentEmail}</strong>
					</p>
					<form method="POST" action="?/verifyOtp" use:enhance={handleOtpVerify}>
						<input type="hidden" name="email" value={sentEmail} />
						<input
							name="token"
							type="text"
							inputmode="numeric"
							maxlength="6"
							pattern="[0-9]{6}"
							autocomplete="one-time-code"
							required
							class="mx-auto mt-5 block w-52 rounded-2xl border border-on-surface/10 bg-surface-low p-4 text-center font-mono text-3xl tracking-[0.3em] text-on-surface outline-none focus:border-primary"
							placeholder="000000"
						/>
						<button
							type="submit"
							disabled={loading}
							class="shadow-ambient mt-4 w-full rounded-full bg-gradient-to-r from-primary to-primary-dim py-3 font-body text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
						>
							{loading ? 'Signing in…' : 'Sign In'}
						</button>
					</form>
					<a
						href="/admin/login"
						class="mt-3 inline-block font-body text-xs text-on-surface-muted hover:text-primary"
					>
						← Different email
					</a>
				</div>
			{/if}
		</div>
		<p class="mt-6 text-center font-body text-xs text-on-surface-muted">
			<a href="/" class="hover:text-on-surface">← Back to store</a>
		</p>
	</div>
</div>
