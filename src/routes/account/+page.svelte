<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatPrice } from '$lib/types';
	import { createClient } from '$lib/supabase';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import type { CartItem } from '$lib/types';

	let {
		data,
		form
	}: { data: PageData; form: { error?: string; registered?: boolean; email?: string } } = $props();

	let loading = $state(false);
	let activeTab = $state<'login' | 'register' | 'reset'>('login');

	// Login fields
	let loginEmail = $state('');
	let loginPassword = $state('');

	// Register fields
	let registerName = $state('');
	let registerPhone = $state('');
	let registerEmail = $state('');
	let registerPassword = $state('');
	let registerConfirm = $state('');

	// Reset fields
	let resetEmail = $state('');
	let resetEmailSent = $state(false);
	let resetLoading = $state(false);
	let resetError = $state('');

	// No-account modal
	let showNoAccountModal = $state(false);

	let supabase: ReturnType<typeof createClient>;
	onMount(() => {
		supabase = createClient();
	});

	async function handleForgotPassword() {
		if (!resetEmail.trim() || !resetEmail.includes('@')) return;
		resetLoading = true;
		resetError = '';
		if (!supabase) supabase = createClient();
		const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim().toLowerCase(), {
			redirectTo: 'https://krafted-loops-studios.vercel.app/auth/reset-password'
		});
		resetLoading = false;
		if (error) {
			resetError = error.message;
			return;
		}
		resetEmailSent = true;
	}

	function validatePhone(phone: string): boolean {
		const digits = phone.replace(/\D/g, '');
		return digits.length === 10;
	}

	async function checkEmailAndSwitch() {
		if (!loginEmail.trim() || !loginEmail.includes('@')) return;
		loading = true;
		const { data: exists } = await supabase.rpc('check_email_exists', {
			check_email: loginEmail.trim().toLowerCase()
		});
		loading = false;

		if (!exists) {
			registerEmail = loginEmail.trim().toLowerCase();
			showNoAccountModal = true;
			setTimeout(() => {
				showNoAccountModal = false;
				activeTab = 'register';
			}, 1000);
		}
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
<section class="bg-surface-low px-4 py-16">
	<div class="mx-auto max-w-7xl">
		<nav aria-label="Breadcrumb" class="mb-6">
			<ol class="flex items-center gap-2 font-body text-sm text-on-surface-muted">
				<li><a href="/" class="transition-colors duration-200 hover:text-primary">Home</a></li>
				<li aria-hidden="true" class="text-on-surface-muted/50">/</li>
				<li><span class="font-semibold text-on-surface" aria-current="page">Account</span></li>
			</ol>
		</nav>
		<h1 class="font-display text-4xl font-semibold text-on-surface">
			{data.user
				? `Hello, ${data.profile?.full_name ?? data.user.email?.split('@')[0]}!`
				: 'My Account'}
		</h1>
		<p class="mt-2 font-body text-lg text-on-surface-muted">
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
						<p class="font-body text-sm font-medium text-on-surface">{data.profile.phone}</p>
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
		<div class="mx-auto max-w-lg">
			{#if form?.error}
				<div class="mb-4 rounded-2xl bg-primary/10 px-4 py-3 font-body text-sm text-primary">
					{form.error}
				</div>
			{/if}

			{#if form?.registered}
				<!-- ── Email Confirmation ──────────────────────────────────────────── -->
				<div class="shadow-ambient rounded-3xl bg-surface-card p-8 text-center">
					<div class="mb-4 text-5xl" aria-hidden="true">📧</div>
					<h2 class="font-display text-2xl font-semibold text-on-surface">Check Your Email</h2>
					<p class="mt-2 font-body text-sm text-on-surface-muted">
						We sent a confirmation link to <strong class="text-on-surface">{form.email}</strong>.<br
						/>
						Click the link to activate your account, then sign in.
					</p>
					<button
						onclick={() => {
							activeTab = 'login';
							loginEmail = form?.email ?? '';
						}}
						class="shadow-ambient mt-6 inline-block rounded-full bg-gradient-to-r from-primary to-primary-dim px-6 py-2.5 font-body text-sm font-semibold text-white hover:brightness-110"
					>
						← Back to Sign In
					</button>
				</div>
			{:else}
				<!-- ── Tab Bar ─────────────────────────────────────────────────── -->
				<div class="mb-6 flex rounded-2xl bg-surface-high p-1">
					<button
						onclick={() => {
							activeTab = 'login';
						}}
						class="flex-1 rounded-xl py-2.5 font-body text-sm font-semibold transition-all {activeTab ===
						'login'
							? 'bg-primary text-white shadow-md'
							: 'text-on-surface-muted hover:text-on-surface'}"
					>
						Sign In
					</button>
					<button
						onclick={() => {
							activeTab = 'register';
						}}
						class="flex-1 rounded-xl py-2.5 font-body text-sm font-semibold transition-all {activeTab ===
						'register'
							? 'bg-primary text-white shadow-md'
							: 'text-on-surface-muted hover:text-on-surface'}"
					>
						Create Account
					</button>
					<button
						onclick={() => {
							resetEmail = loginEmail;
							resetEmailSent = false;
							resetError = '';
							activeTab = 'reset';
						}}
						class="flex-1 rounded-xl py-2.5 font-body text-sm font-semibold transition-all {activeTab ===
						'reset'
							? 'bg-primary text-white shadow-md'
							: 'text-on-surface-muted hover:text-on-surface'}"
					>
						Reset Password
					</button>
				</div>

				{#if activeTab === 'login'}
					<!-- ── Login ───────────────────────────────────────────────────── -->
					<div class="shadow-ambient rounded-3xl bg-surface-card p-8">
						<h2 class="font-display text-2xl font-semibold text-on-surface">Welcome Back</h2>
						<p class="mt-1 font-body text-sm text-on-surface-muted">
							Sign in to view your order history.
						</p>
						<form method="POST" action="?/signIn" use:enhance class="mt-6 space-y-4">
							<div>
								<label
									for="login-email"
									class="mb-1 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
								>
									Email Address
								</label>
								<input
									id="login-email"
									name="email"
									type="email"
									bind:value={loginEmail}
									required
									autocomplete="email"
									placeholder="you@example.com"
									onblur={checkEmailAndSwitch}
									class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:border-primary/50 focus:outline-none"
								/>
							</div>
							<div>
								<label
									for="login-password"
									class="mb-1 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
								>
									Password
								</label>
								<input
									id="login-password"
									name="password"
									type="password"
									bind:value={loginPassword}
									required
									minlength="8"
									autocomplete="current-password"
									placeholder="••••••••"
									class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:border-primary/50 focus:outline-none"
								/>
							</div>
							<button
								type="submit"
								disabled={loading}
								class="shadow-ambient w-full rounded-full bg-gradient-to-r from-primary to-primary-dim py-3.5 font-body font-semibold text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-60"
							>
								{#if loading}
									<svg
										class="mr-2 inline h-[18px] w-[18px] animate-spin"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-linecap="round"
									>
										<circle cx="12" cy="12" r="9.5" stroke-width="1.5" opacity="0.2" />
										<path d="M7 9a5.5 5.5 0 0 1 10 0" stroke-width="1.5" opacity="0.7" />
										<path d="M5.5 13a7 7 0 0 1 13 0" stroke-width="1.5" opacity="0.7" />
										<path d="M7 17a5.5 5.5 0 0 1 10 0" stroke-width="1.5" opacity="0.7" />
										<path d="M19 7c1 1.5 0 3.5-2 3.5" stroke-width="1.5" opacity="0.4" />
									</svg>
									Signing In…
								{:else}
									Sign In
								{/if}
							</button>
						</form>
						<p class="mt-4 text-center">
							<button
								type="button"
								onclick={() => {
									resetEmail = loginEmail;
									resetEmailSent = false;
									resetError = '';
									activeTab = 'reset';
								}}
								class="font-body text-xs text-on-surface-muted underline transition-colors hover:text-primary"
							>
								Forgot Password?
							</button>
						</p>
					</div>
				{:else if activeTab === 'register'}
					<!-- ── Register ─────────────────────────────────────────────────── -->
					<div class="shadow-ambient rounded-3xl bg-surface-card p-8">
						<h2 class="font-display text-2xl font-semibold text-on-surface">Create Account</h2>
						<p class="mt-1 font-body text-sm text-on-surface-muted">All fields are required.</p>
						<form method="POST" action="?/signUp" use:enhance class="mt-6 space-y-4">
							<div>
								<label
									for="reg-name"
									class="mb-1 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
								>
									Full Name
								</label>
								<input
									id="reg-name"
									name="full_name"
									type="text"
									bind:value={registerName}
									required
									autocomplete="name"
									placeholder="John Doe"
									class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:border-primary/50 focus:outline-none"
								/>
							</div>
							<div>
								<label
									for="reg-phone"
									class="mb-1 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
								>
									Mobile Number
								</label>
								<input
									id="reg-phone"
									name="phone"
									type="tel"
									bind:value={registerPhone}
									required
									autocomplete="tel"
									placeholder="98765 43210"
									inputmode="numeric"
									maxlength="10"
									class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:border-primary/50 focus:outline-none"
								/>
							</div>
							<div>
								<label
									for="reg-email"
									class="mb-1 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
								>
									Email Address
								</label>
								<input
									id="reg-email"
									name="email"
									type="email"
									bind:value={registerEmail}
									required
									autocomplete="email"
									placeholder="you@example.com"
									class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:border-primary/50 focus:outline-none"
								/>
							</div>
							<div>
								<label
									for="reg-password"
									class="mb-1 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
								>
									Password
								</label>
								<input
									id="reg-password"
									name="password"
									type="password"
									bind:value={registerPassword}
									required
									minlength="8"
									autocomplete="new-password"
									placeholder="At least 8 characters"
									class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:border-primary/50 focus:outline-none"
								/>
							</div>
							<div>
								<label
									for="reg-confirm"
									class="mb-1 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
								>
									Confirm Password
								</label>
								<input
									id="reg-confirm"
									type="password"
									bind:value={registerConfirm}
									required
									minlength="8"
									autocomplete="new-password"
									placeholder="Repeat password"
									class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:border-primary/50 focus:outline-none"
								/>
							</div>
							<button
								type="submit"
								disabled={loading}
								class="shadow-ambient w-full rounded-full bg-gradient-to-r from-primary to-primary-dim py-3.5 font-body font-semibold text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-60"
							>
								{#if loading}
									<svg
										class="mr-2 inline h-[18px] w-[18px] animate-spin"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-linecap="round"
									>
										<circle cx="12" cy="12" r="9.5" stroke-width="1.5" opacity="0.2" />
										<path d="M7 9a5.5 5.5 0 0 1 10 0" stroke-width="1.5" opacity="0.7" />
										<path d="M5.5 13a7 7 0 0 1 13 0" stroke-width="1.5" opacity="0.7" />
										<path d="M7 17a5.5 5.5 0 0 1 10 0" stroke-width="1.5" opacity="0.7" />
										<path d="M19 7c1 1.5 0 3.5-2 3.5" stroke-width="1.5" opacity="0.4" />
									</svg>
									Creating Account…
								{:else}
									Create Account
								{/if}
							</button>
						</form>
					</div>
				{:else if activeTab === 'reset'}
					<!-- ── Reset Password ────────────────────────────────────────────── -->
					<div class="shadow-ambient rounded-3xl bg-surface-card p-8">
						<h2 class="font-display text-2xl font-semibold text-on-surface">Reset Password</h2>
						<p class="mt-1 font-body text-sm text-on-surface-muted">
							Enter your email and we'll send you a reset link.
						</p>

						{#if resetEmailSent}
							<div class="mt-6 rounded-2xl bg-secondary-container/30 px-4 py-5 text-center">
								<div class="mb-2 text-4xl" aria-hidden="true">📧</div>
								<p class="font-body text-sm font-medium text-on-surface">Check your email!</p>
								<p class="mt-1 font-body text-xs text-on-surface-muted">
									We sent a password reset link to <strong class="text-on-surface"
										>{resetEmail}</strong
									>.
								</p>
							</div>
							<button
								onclick={() => {
									activeTab = 'login';
									resetEmailSent = false;
									resetError = '';
								}}
								class="shadow-ambient mt-6 w-full rounded-full bg-gradient-to-r from-primary to-primary-dim py-3.5 font-body font-semibold text-white transition-all hover:brightness-110 active:scale-95"
							>
								← Back to Sign In
							</button>
						{:else}
							{#if resetError}
								<div
									class="mt-4 rounded-2xl bg-primary/10 px-4 py-3 font-body text-sm text-primary"
								>
									{resetError}
								</div>
							{/if}
							<form
								onsubmit={(e) => {
									e.preventDefault();
									handleForgotPassword();
								}}
								class="mt-6 space-y-4"
							>
								<div>
									<label
										for="reset-email"
										class="mb-1 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
									>
										Email Address
									</label>
									<input
										id="reset-email"
										type="email"
										bind:value={resetEmail}
										required
										autocomplete="email"
										placeholder="you@example.com"
										class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:border-primary/50 focus:outline-none"
									/>
								</div>
								<button
									type="submit"
									disabled={resetLoading}
									class="shadow-ambient w-full rounded-full bg-gradient-to-r from-primary to-primary-dim py-3.5 font-body font-semibold text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-60"
								>
									{#if resetLoading}
										<svg
											class="mr-2 inline h-[18px] w-[18px] animate-spin"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-linecap="round"
										>
											<circle cx="12" cy="12" r="9.5" stroke-width="1.5" opacity="0.2" />
											<path d="M7 9a5.5 5.5 0 0 1 10 0" stroke-width="1.5" opacity="0.7" />
											<path d="M5.5 13a7 7 0 0 1 13 0" stroke-width="1.5" opacity="0.7" />
											<path d="M7 17a5.5 5.5 0 0 1 10 0" stroke-width="1.5" opacity="0.7" />
											<path d="M19 7c1 1.5 0 3.5-2 3.5" stroke-width="1.5" opacity="0.4" />
										</svg>
										Sending…
									{:else}
										Send Reset Link
									{/if}
								</button>
							</form>
							<p class="mt-4 text-center">
								<button
									type="button"
									onclick={() => {
										activeTab = 'login';
										resetError = '';
									}}
									class="font-body text-xs text-on-surface-muted underline transition-colors hover:text-primary"
								>
									← Back to Sign In
								</button>
							</p>
						{/if}
					</div>
				{/if}
			{/if}
		</div>
	{/if}

	<!-- ── No Account Modal ─────────────────────────────────────────────────── -->
	{#if showNoAccountModal}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
			<div class="shadow-ambient max-w-sm rounded-3xl bg-surface-card p-8 text-center" role="alert">
				<div class="mb-3 text-5xl" aria-hidden="true">👋</div>
				<p class="font-display text-xl font-semibold text-on-surface">No account found</p>
				<p class="mt-2 font-body text-sm text-on-surface-muted">Please create an account first.</p>
			</div>
		</div>
	{/if}
</div>
