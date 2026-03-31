<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatPrice } from '$lib/types';
	import type { PageData, ActionData } from './$types';
	import type { CartItem } from '$lib/types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let emailInput = $state('');
	let otpInput = $state('');
	let otpSent = $state((form as Record<string, unknown>)?.otpSent === true);
	let sentToEmail = $state((form as Record<string, unknown>)?.email as string ?? '');
	let loading = $state(false);

	$effect(() => {
		if (!form) return;
		const f = form as Record<string, unknown>;
		if (f.otpSent) { otpSent = true; sentToEmail = f.email as string; }
	});

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
			{data.user ? `Hello, ${data.profile?.full_name ?? data.user.email?.split('@')[0]}!` : 'My Account'}
		</h1>
		<p class="mt-1 font-body text-sm text-on-surface-muted">
			{data.user ? 'View your orders and manage your account.' : 'Sign in to view your order history.'}
		</p>
	</div>
</section>

<div class="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">

	<!-- ── LOGGED IN STATE ──────────────────────────────────────────────────── -->
	{#if data.user}
		<div class="grid gap-6 md:grid-cols-3">
			<!-- Profile card -->
			<div class="rounded-3xl bg-surface-card p-6 shadow-ambient">
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
					<div class="rounded-3xl bg-surface-card p-10 text-center shadow-ambient">
						<div class="text-5xl mb-3" aria-hidden="true">🧺</div>
						<p class="font-display text-xl text-on-surface">No orders yet</p>
						<p class="mt-2 font-body text-sm text-on-surface-muted">When you place an order, it will appear here.</p>
						<a href="/shop" class="mt-5 inline-block rounded-full bg-gradient-to-r from-primary to-primary-dim px-6 py-2.5 font-body text-sm font-semibold text-white shadow-ambient hover:brightness-110">
							Shop Now
						</a>
					</div>
				{:else}
					<ul class="space-y-4">
						{#each data.orders as order}
							{@const items = order.items as unknown as CartItem[]}
							<li class="rounded-3xl bg-surface-card p-5 shadow-ambient">
								<div class="flex items-start justify-between gap-4">
									<div>
										<p class="font-body text-xs text-on-surface-muted">Order</p>
										<p class="font-body font-semibold text-on-surface">#{order.order_number}</p>
										<p class="mt-1 font-body text-xs text-on-surface-muted">
											{new Date(order.created_at!).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
										</p>
									</div>
									<div class="text-right">
										<span class="chip inline-block px-3 py-1 font-body text-xs font-semibold {statusColors[order.status] ?? statusColors.pending}">
											{order.status.charAt(0).toUpperCase() + order.status.slice(1)}
										</span>
										<p class="mt-2 font-display text-lg font-semibold text-on-surface">{formatPrice(order.total_paise)}</p>
									</div>
								</div>
								<div class="mt-3 flex flex-wrap gap-2">
									{#each items.slice(0, 3) as item}
										<span class="rounded-xl bg-surface-low px-3 py-1 font-body text-xs text-on-surface-muted">
											{item.title} ×{item.qty}
										</span>
									{/each}
									{#if items.length > 3}
										<span class="rounded-xl bg-surface-low px-3 py-1 font-body text-xs text-on-surface-muted">
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
			<!-- Error -->
			{#if (form as Record<string, unknown>)?.error}
				<div class="mb-4 rounded-2xl bg-primary/10 px-4 py-3 font-body text-sm text-primary">
					{(form as Record<string, unknown>).error}
				</div>
			{/if}

			{#if !otpSent}
				<!-- Sign in form -->
				<div class="rounded-3xl bg-surface-card p-8 shadow-ambient">
					<h2 class="font-display text-2xl font-semibold text-on-surface">Sign In</h2>
					<p class="mt-1 font-body text-sm text-on-surface-muted">
						We'll send a magic code to your email — no password needed.
					</p>
					<form
						method="POST"
						action="?/signIn"
						use:enhance={() => {
							loading = true;
							return async ({ update }) => { await update(); loading = false; };
						}}
						class="mt-6 space-y-4"
					>
						<div>
							<label for="sign-email" class="mb-1 block font-body text-xs font-semibold uppercase tracking-wider text-on-surface-muted">Email Address</label>
							<input
								id="sign-email"
								name="email"
								type="email"
								bind:value={emailInput}
								required
								autocomplete="email"
								placeholder="you@example.com"
								class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:border-primary/50 focus:outline-none"
							/>
						</div>
						<button
							type="submit"
							disabled={loading}
							class="w-full rounded-full bg-gradient-to-r from-primary to-primary-dim py-3.5 font-body font-semibold text-white shadow-ambient transition-all hover:brightness-110 disabled:opacity-60 active:scale-95"
						>
							{loading ? 'Sending…' : 'Send Magic Code'}
						</button>
					</form>
					<p class="mt-4 text-center font-body text-xs text-on-surface-muted">
						New here? An account will be created automatically.
					</p>
				</div>
			{:else}
				<!-- OTP form -->
				<div class="rounded-3xl bg-surface-card p-8 shadow-ambient text-center">
					<div class="text-5xl mb-4" aria-hidden="true">📧</div>
					<h2 class="font-display text-2xl font-semibold text-on-surface">Check Your Email</h2>
					<p class="mt-2 font-body text-sm text-on-surface-muted">
						Code sent to <strong class="text-on-surface">{sentToEmail}</strong>
					</p>
					<form
						method="POST"
						action="?/verifyOtp"
						use:enhance={() => {
							loading = true;
							return async ({ update }) => { await update(); loading = false; };
						}}
						class="mt-6 space-y-4"
					>
						<input type="hidden" name="email" value={sentToEmail} />
						<input
							name="token"
							type="text"
							bind:value={otpInput}
							inputmode="numeric"
							pattern="[0-9]{6}"
							maxlength="6"
							required
							placeholder="000000"
							autocomplete="one-time-code"
							class="mx-auto block w-48 rounded-2xl border border-on-surface/10 bg-surface-high p-4 text-center font-body text-3xl tracking-[0.5em] text-on-surface focus:border-primary/50 focus:outline-none"
						/>
						<button
							type="submit"
							disabled={loading}
							class="w-full rounded-full bg-gradient-to-r from-primary to-primary-dim py-3.5 font-body font-semibold text-white shadow-ambient transition-all hover:brightness-110 disabled:opacity-60 active:scale-95"
						>
							{loading ? 'Verifying…' : 'Sign In'}
						</button>
					</form>
					<button
						onclick={() => { otpSent = false; }}
						class="mt-3 font-body text-sm text-on-surface-muted hover:text-primary"
					>
						← Use a different email
					</button>
				</div>
			{/if}
		</div>
	{/if}
</div>
