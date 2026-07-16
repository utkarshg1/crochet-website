<script lang="ts">
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { formatPrice } from '$lib/types';
	import { createClient } from '$lib/supabase';
	import type { PageData } from './$types';
	import type { CartItem } from '$lib/types';

	let { data }: { data: PageData } = $props();

	// Shared state
	let otpSent = $state(false);
	let sentToEmail = $state('');
	let loading = $state(false);
	let error = $state('');

	// Login fields
	let loginEmail = $state('');

	// Register fields
	let registerName = $state('');
	let registerPhone = $state('');
	let registerEmail = $state('');

	// OTP input
	let otpInput = $state('');

	// Which flow sent the OTP: 'login' | 'register'
	let activeFlow = $state<'login' | 'register'>('login');

	// Register section ref for scrolling
	let registerSection = $state<HTMLElement | null>(null);

	// No-account modal
	let showNoAccountModal = $state(false);

	// Create client only in browser (onMount) so cookie storage is available
	let supabase: ReturnType<typeof createClient>;
	onMount(() => {
		supabase = createClient();
	});

	function validateEmail(email: string): boolean {
		return !!email && email.includes('@');
	}

	function validatePhone(phone: string): boolean {
		const digits = phone.replace(/\D/g, '');
		return digits.length === 10;
	}

	async function sendLoginOtp() {
		error = '';
		const email = loginEmail.trim();
		if (!validateEmail(email)) {
			error = 'Enter a valid email address';
			return;
		}

		loading = true;
		const { data: exists } = await supabase.rpc('check_email_exists', {
			check_email: email
		});
		loading = false;

		if (!exists) {
			registerEmail = email;
			showNoAccountModal = true;
			setTimeout(() => {
				showNoAccountModal = false;
				registerSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}, 1000);
			return;
		}

		loading = true;
		const { error: err } = await supabase.auth.signInWithOtp({
			email,
			options: {
				shouldCreateUser: false,
				emailRedirectTo: `${window.location.origin}/auth/callback`
			}
		});
		loading = false;

		if (err) {
			error = err.message;
			return;
		}
		activeFlow = 'login';
		sentToEmail = email;
		otpSent = true;
	}

	async function sendRegisterOtp() {
		error = '';
		const name = registerName.trim();
		const phone = registerPhone.trim();
		const email = registerEmail.trim();

		if (!name) {
			error = 'Enter your full name';
			return;
		}
		if (!validatePhone(phone)) {
			error = 'Enter a valid 10-digit phone number';
			return;
		}
		if (!validateEmail(email)) {
			error = 'Enter a valid email address';
			return;
		}

		const phoneDigits = phone.replace(/\D/g, '').replace(/^0+/, '');

		loading = true;
		const { error: err } = await supabase.auth.signInWithOtp({
			email,
			options: {
				data: { full_name: name, phone: `+91${phoneDigits}` },
				emailRedirectTo: `${window.location.origin}/auth/callback`
			}
		});
		loading = false;

		if (err) {
			error = err.message;
			return;
		}
		activeFlow = 'register';
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
			{#if error}
				<div class="mb-4 rounded-2xl bg-primary/10 px-4 py-3 font-body text-sm text-primary">
					{error}
				</div>
			{/if}

			{#if otpSent}
				<!-- ── OTP Verification ──────────────────────────────────────────── -->
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
							otpInput = '';
							error = '';
						}}
						class="mt-4 font-body text-sm text-on-surface-muted hover:text-primary"
					>
						← Use a different email
					</button>
				</div>
			{:else}
				<!-- ── Login ───────────────────────────────────────────────────── -->
				<div class="shadow-ambient rounded-3xl bg-surface-card p-8">
					<h2 class="font-display text-2xl font-semibold text-on-surface">Welcome Back</h2>
					<p class="mt-1 font-body text-sm text-on-surface-muted">
						Sign in to view your order history.
					</p>
					<div class="mt-6 space-y-4">
						<div>
							<label
								for="login-email"
								class="mb-1 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
							>
								Email Address
							</label>
							<input
								id="login-email"
								type="email"
								bind:value={loginEmail}
								required
								autocomplete="email"
								placeholder="you@example.com"
								onkeydown={(e) => e.key === 'Enter' && sendLoginOtp()}
								class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:border-primary/50 focus:outline-none"
							/>
						</div>
						<button
							onclick={sendLoginOtp}
							disabled={loading}
							class="shadow-ambient w-full rounded-full bg-gradient-to-r from-primary to-primary-dim py-3.5 font-body font-semibold text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-60"
						>
							{loading ? 'Sending…' : 'Send Code'}
						</button>
					</div>
				</div>

				<!-- ── Divider ───────────────────────────────────────────────────── -->
				<div class="my-6 flex items-center gap-4">
					<div class="h-px flex-1 bg-on-surface/10"></div>
					<span class="font-body text-xs text-on-surface-muted uppercase">New here?</span>
					<div class="h-px flex-1 bg-on-surface/10"></div>
				</div>

				<!-- ── Register ─────────────────────────────────────────────────── -->
				<div
					bind:this={registerSection}
					id="register-section"
					class="shadow-ambient rounded-3xl bg-surface-card p-8"
				>
					<h2 class="font-display text-2xl font-semibold text-on-surface">Create Account</h2>
					<p class="mt-1 font-body text-sm text-on-surface-muted">All fields are required.</p>
					<div class="mt-6 space-y-4">
						<div>
							<label
								for="reg-name"
								class="mb-1 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
							>
								Full Name
							</label>
							<input
								id="reg-name"
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
								type="email"
								bind:value={registerEmail}
								required
								autocomplete="email"
								placeholder="you@example.com"
								class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:border-primary/50 focus:outline-none"
							/>
						</div>
						<button
							onclick={sendRegisterOtp}
							disabled={loading}
							class="shadow-ambient w-full rounded-full bg-gradient-to-r from-primary to-primary-dim py-3.5 font-body font-semibold text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-60"
						>
							{loading ? 'Sending…' : 'Create Account'}
						</button>
					</div>
				</div>
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
