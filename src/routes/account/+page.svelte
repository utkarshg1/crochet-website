<script lang="ts">
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { formatPrice } from '$lib/types';
	import { createClient } from '$lib/supabase';
	import type { PageData } from './$types';
	import type { CartItem } from '$lib/types';

	let { data }: { data: PageData } = $props();

	let emailInput = $state('');
	let otpInput = $state('');
	let otpSent = $state(false);
	let sentToEmail = $state('');
	let loading = $state(false);
	let error = $state('');

	// Create client only in browser (onMount) so cookie storage is available
	let supabase: ReturnType<typeof createClient>;
	onMount(() => {
		supabase = createClient();
	});

	async function sendMagicLink() {
		error = '';
		const email = emailInput.trim();
		if (!email || !email.includes('@')) {
			error = 'Enter a valid email address';
			return;
		}

		loading = true;
		const { error: err } = await supabase.auth.signInWithOtp({
			email,
			options: {
				shouldCreateUser: true,
				emailRedirectTo: `${window.location.origin}/auth/callback`
			}
		});
		loading = false;

		if (err) {
			error = err.message;
			return;
		}
		sentToEmail = email;
		otpSent = true;
	}

	async function verifyCode() {
		error = '';
		const token = otpInput.trim();
		if (!token || token.length !== 6) {
			error = 'Enter the 6-digit code';
			return;
		}

		loading = true;
		const { error: err } = await supabase.auth.verifyOtp({
			email: sentToEmail,
			token,
			type: 'email'
		});
		loading = false;

		if (err) {
			error = 'Invalid or expired code. Try again.';
			return;
		}
		await invalidateAll();
	}

	const statusColors: Record<string, string> = {
		pending: 'bg-mustard/40 text-tertiary',
		processing: 'bg-secondary-container text-secondary',
		shipped: 'bg-blue-100 text-blue-700',
		delivered: 'bg-secondary-container text-secondary',
		cancelled: 'bg-primary/10 text-primary'
	};
</script>

<svelte:head>
	<title>My Account — Krafted Loops Studio</title>
</svelte:head>

<!-- ── Header ──────────────────────────────────────────────────────────────── -->
<section class="bg-surface-low py-12">
	<div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
		<h1 class="font-display text-4xl font-semibold text-on-surface">
			{data.user
				? `Hello, ${data.profile?.full_name ?? data.user.email?.split('@')[0]}!`
				: 'My Account'}
		</h1>
		<p class="mt-1 font-body text-sm text-on-surface-muted">
			{data.user
				? 'View your orders and manage your account.'
				: 'Sign in to view your order history.'}
		</p>
	</div>
</section>

<div class="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
	<!-- ── LOGGED IN STATE ──────────────────────────────────────────────────── -->
	{#if data.user}
		<div class="grid gap-6 md:grid-cols-3">
			<!-- Profile card -->
			<div class="shadow-ambient rounded-3xl bg-surface-card p-6">
				<h2 class="font-display text-lg font-semibold text-on-surface">Account</h2>
				<div class="mt-4 space-y-2">
					<p class="font-body text-sm text-on-surface-muted">Email</p>
					<p class="font-body text-sm font-medium text-on-surface">{data.user.email}</p>
				</div>
				{#if data.profile?.phone}
					<div class="mt-3 space-y-1">
						<p class="font-body text-sm text-on-surface-muted">Phone</p>
						<p class="font-body text-sm font-medium text-on-surface">+91{data.profile.phone}</p>
					</div>
				{/if}
				<form method="POST" action="?/signOut" use:enhance class="mt-6">
					<button
						type="submit"
						class="w-full rounded-full bg-surface-high py-2.5 font-body text-sm font-medium text-on-surface transition-colors hover:bg-surface-low"
					>
						Sign Out
					</button>
				</form>
			</div>

			<!-- Orders list -->
			<div class="md:col-span-2">
				<h2 class="mb-4 font-display text-xl font-semibold text-on-surface">Order History</h2>

				{#if !data.orders || data.orders.length === 0}
					<div class="shadow-ambient rounded-3xl bg-surface-card p-10 text-center">
						<div class="mb-3 text-5xl" aria-hidden="true">🧺</div>
						<p class="font-display text-xl text-on-surface">No orders yet</p>
						<p class="mt-2 font-body text-sm text-on-surface-muted">
							When you place an order, it will appear here.
						</p>
						<a
							href="/shop"
							class="shadow-ambient mt-5 inline-block rounded-full bg-gradient-to-r from-primary to-primary-dim px-6 py-2.5 font-body text-sm font-semibold text-white hover:brightness-110"
						>
							Shop Now
						</a>
					</div>
				{:else}
					<ul class="space-y-4">
						{#each data.orders as order}
							{@const items = order.items as unknown as CartItem[]}
							<li class="shadow-ambient rounded-3xl bg-surface-card p-5">
								<div class="flex items-start justify-between gap-4">
									<div>
										<p class="font-body text-xs text-on-surface-muted">Order</p>
										<p class="font-body font-semibold text-on-surface">#{order.order_number}</p>
										<p class="mt-1 font-body text-xs text-on-surface-muted">
											{new Date(order.created_at!).toLocaleDateString('en-IN', {
												day: 'numeric',
												month: 'short',
												year: 'numeric'
											})}
										</p>
									</div>
									<div class="text-right">
										<span
											class="chip inline-block px-3 py-1 font-body text-xs font-semibold {statusColors[
												order.status
											] ?? statusColors.pending}"
										>
											{order.status.charAt(0).toUpperCase() + order.status.slice(1)}
										</span>
										<p class="mt-2 font-display text-lg font-semibold text-on-surface">
											{formatPrice(order.total_paise)}
										</p>
									</div>
								</div>
								<div class="mt-3 flex flex-wrap gap-2">
									{#each items.slice(0, 3) as item}
										<span
											class="rounded-xl bg-surface-low px-3 py-1 font-body text-xs text-on-surface-muted"
										>
											{item.title} ×{item.qty}
										</span>
									{/each}
									{#if items.length > 3}
										<span
											class="rounded-xl bg-surface-low px-3 py-1 font-body text-xs text-on-surface-muted"
										>
											+{items.length - 3} more
										</span>
									{/if}
								</div>
								<a
									href="/order/{order.id}"
									class="mt-3 inline-block font-body text-sm text-secondary underline hover:no-underline"
								>
									View details →
								</a>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</div>

		<!-- ── LOGGED OUT STATE ─────────────────────────────────────────────────── -->
	{:else}
		<div class="mx-auto max-w-md">
			{#if error}
				<div class="mb-4 rounded-2xl bg-primary/10 px-4 py-3 font-body text-sm text-primary">
					{error}
				</div>
			{/if}

			{#if !otpSent}
				<!-- Step 1: Enter email -->
				<div class="shadow-ambient rounded-3xl bg-surface-card p-8">
					<h2 class="font-display text-2xl font-semibold text-on-surface">Sign In</h2>
					<p class="mt-1 font-body text-sm text-on-surface-muted">
						We'll send a 6-digit code to your email.
					</p>
					<div class="mt-6 space-y-4">
						<div>
							<label
								for="sign-email"
								class="mb-1 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
							>
								Email Address
							</label>
							<input
								id="sign-email"
								type="email"
								bind:value={emailInput}
								required
								autocomplete="email"
								placeholder="you@example.com"
								onkeydown={(e) => e.key === 'Enter' && sendMagicLink()}
								class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:border-primary/50 focus:outline-none"
							/>
						</div>
						<button
							onclick={sendMagicLink}
							disabled={loading}
							class="shadow-ambient w-full rounded-full bg-gradient-to-r from-primary to-primary-dim py-3.5 font-body font-semibold text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-60"
						>
							{loading ? 'Sending…' : 'Send Code'}
						</button>
					</div>
					<p class="mt-4 text-center font-body text-xs text-on-surface-muted">
						New here? An account will be created automatically.
					</p>
				</div>
			{:else}
				<!-- Step 2: Check email (magic link sent) or enter code -->
				<div class="shadow-ambient rounded-3xl bg-surface-card p-8 text-center">
					<div class="mb-4 text-5xl" aria-hidden="true">📧</div>
					<h2 class="font-display text-2xl font-semibold text-on-surface">Check Your Email</h2>
					<p class="mt-2 font-body text-sm text-on-surface-muted">
						We sent a 6-digit code to <strong class="text-on-surface">{sentToEmail}</strong>.<br />
						Click the link in the email or enter the code below.
					</p>
					<div class="mt-6">
						<p class="mb-3 font-body text-xs text-on-surface-muted">
							Or enter the 6-digit code from the email:
						</p>
						<input
							type="text"
							bind:value={otpInput}
							inputmode="numeric"
							pattern="[0-9]{6}"
							maxlength="6"
							placeholder="000000"
							autocomplete="one-time-code"
							onkeydown={(e) => e.key === 'Enter' && verifyCode()}
							class="mx-auto block w-48 rounded-2xl border border-on-surface/10 bg-surface-high p-4 text-center font-body text-3xl tracking-[0.5em] text-on-surface focus:border-primary/50 focus:outline-none"
						/>
						<button
							onclick={verifyCode}
							disabled={loading}
							class="shadow-ambient mt-4 w-full rounded-full bg-gradient-to-r from-primary to-primary-dim py-3.5 font-body font-semibold text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-60"
						>
							{loading ? 'Verifying…' : 'Verify Code'}
						</button>
					</div>
					<button
						onclick={() => {
							otpSent = false;
							error = '';
						}}
						class="mt-4 font-body text-sm text-on-surface-muted hover:text-primary"
					>
						← Use a different email
					</button>
				</div>
			{/if}
		</div>
	{/if}
</div>
