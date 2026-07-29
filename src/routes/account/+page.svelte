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
	}: {
		data: PageData;
		form: {
			error?: string;
			registered?: boolean;
			email?: string;
			resetSent?: boolean;
			exists?: boolean;
			resendSuccess?: boolean;
			resendEmail?: string;
			address?: Record<string, unknown>;
			deleted?: boolean;
			address_id?: string;
		};
	} = $props();

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
	let resetLoading = $state(false);

	// ── Address management ───────────────────────────────────────────────────
	let showingAddressForm = $state(false);
	let editingAddressId = $state<string>('');
	let addressForm = $state({
		full_name: '',
		phone: '',
		address_line1: '',
		address_line2: '',
		city: '',
		state_name: '',
		pincode: '',
		is_default: false
	});

	function resetAddressForm() {
		addressForm = {
			full_name: '',
			phone: '',
			address_line1: '',
			address_line2: '',
			city: '',
			state_name: '',
			pincode: '',
			is_default: false
		};
	}

	// Handle saveAddress / deleteAddress form responses
	let addressFormError = $state('');
	$effect(() => {
		if (form?.address || form?.deleted) {
			addressFormError = '';
		} else if (form?.error) {
			addressFormError = form.error;
		}
	});

	// Password visibility toggles
	let showLoginPassword = $state(false);
	let showRegisterPassword = $state(false);
	let showRegisterConfirm = $state(false);

	// Resend state
	let resendCooldown = $state(0);
	let resendTimer: ReturnType<typeof setInterval> | null = null;
	let resendLoading = $state(false);

	function startResendCooldown() {
		resendCooldown = 60;
		resendTimer = setInterval(() => {
			resendCooldown--;
			if (resendCooldown <= 0) {
				if (resendTimer) clearInterval(resendTimer);
				resendTimer = null;
			}
		}, 1000);
	}

	// Modal state
	let showError = $state(false);
	let errorMessage = $state('');

	// No-account modal
	let showNoAccountModal = $state(false);

	// Dismiss the "Check Your Email" screen without a full page navigation
	let registeredDismissed = $state(false);

	// Show error modal whenever form returns an error
	$effect(() => {
		if (form?.error) {
			errorMessage = form.error;
			showError = true;
		}
	});

	let supabase: ReturnType<typeof createClient>;
	onMount(() => {
		supabase = createClient();
	});

	function validatePhone(phone: string): boolean {
		const digits = phone.replace(/\D/g, '');
		return digits.length === 10;
	}

	async function checkEmailAndSwitch() {
		if (!loginEmail.trim() || !loginEmail.includes('@')) return;
		loading = true;
		const formBody = new FormData();
		formBody.append('email', loginEmail.trim().toLowerCase());
		const res = await fetch('?/checkEmail', { method: 'POST', body: formBody });
		const result = await res.json();
		loading = false;

		const exists = result.data?.exists ?? true;
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
				<form
					method="POST"
					action="?/signOut"
					use:enhance={() => {
						return async ({ result }) => {
							if (result.type === 'redirect') {
								window.location.href = result.location;
							}
						};
					}}
					class="mt-6"
				>
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

		<!-- ── Addresses ──────────────────────────────────────────────────────── -->
		<div class="mt-10">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="font-display text-xl font-semibold text-on-surface">Saved Addresses</h2>
				<button
					onclick={() => {
						editingAddressId = '';
						resetAddressForm();
						showingAddressForm = true;
					}}
					class="rounded-full bg-gradient-to-r from-primary to-primary-dim px-4 py-2 font-body text-sm font-semibold text-white transition-all hover:brightness-110"
				>
					+ Add Address
				</button>
			</div>

			{#if data.addresses && data.addresses.length > 0}
				<div class="grid gap-4 sm:grid-cols-2">
					{#each data.addresses as addr (addr.id)}
						{@const isEditing = editingAddressId === (addr.id as string)}
						{#if isEditing && showingAddressForm}
							<!-- inline edit form -->
							<div class="shadow-ambient rounded-3xl bg-surface-card p-5 sm:col-span-2">
								<h3 class="mb-4 font-display text-lg font-semibold text-on-surface">
									Edit Address
								</h3>
								<form
									method="POST"
									action="?/saveAddress"
									use:enhance={() => {
										return async ({ result, update }) => {
											await update();
											if (result.type === 'success' && !result.data?.error) {
												showingAddressForm = false;
												editingAddressId = '';
												resetAddressForm();
											}
										};
									}}
								>
									<input type="hidden" name="address_id" value={addr.id as string} />
									{@render addressFormFields()}
								</form>
							</div>
						{:else}
							<div class="shadow-ambient rounded-3xl bg-surface-card p-5">
								<div class="flex items-start justify-between gap-2">
									<div class="min-w-0 flex-1">
										<p class="font-body font-semibold text-on-surface">
											{addr.full_name as string}
										</p>
										<p class="mt-0.5 font-body text-xs text-on-surface-muted">
											{addr.phone as string}
										</p>
										<p class="mt-1 font-body text-sm text-on-surface">
											{addr.address_line1 as string}{addr.address_line2
												? `, ${addr.address_line2 as string}`
												: ''}
										</p>
										<p class="font-body text-sm text-on-surface">
											{addr.city as string}, {addr.state as string} – {addr.pincode as string}
										</p>
										{#if addr.is_default}
											<span
												class="mt-2 inline-block rounded-full bg-secondary-container/40 px-2.5 py-0.5 font-body text-xs font-medium text-secondary"
												>Default</span
											>
										{/if}
									</div>
									<div class="flex shrink-0 gap-1">
										<button
											onclick={() => {
												editingAddressId = addr.id as string;
												addressForm = {
													full_name: addr.full_name as string,
													phone: addr.phone as string,
													address_line1: addr.address_line1 as string,
													address_line2: (addr.address_line2 as string) ?? '',
													city: addr.city as string,
													state_name: addr.state as string,
													pincode: addr.pincode as string,
													is_default: (addr.is_default as boolean) ?? false
												};
												showingAddressForm = true;
											}}
											class="rounded-lg p-2 text-on-surface-muted transition-colors hover:bg-surface-high hover:text-on-surface"
											aria-label="Edit address"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="h-4 w-4"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
												><path
													d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
												/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg
											>
										</button>
										<form method="POST" action="?/deleteAddress" use:enhance>
											<input type="hidden" name="address_id" value={addr.id as string} />
											<button
												type="submit"
												class="rounded-lg p-2 text-on-surface-muted transition-colors hover:bg-surface-high hover:text-primary"
												aria-label="Delete address"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													class="h-4 w-4"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													stroke-width="2"
													stroke-linecap="round"
													stroke-linejoin="round"
													><polyline points="3 6 5 6 21 6" /><path
														d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
													/></svg
												>
											</button>
										</form>
									</div>
								</div>
							</div>
						{/if}
					{/each}
				</div>
			{:else}
				<div class="shadow-ambient rounded-3xl bg-surface-card p-10 text-center">
					<p class="font-display text-xl text-on-surface">No addresses saved</p>
					<p class="mt-2 font-body text-sm text-on-surface-muted">
						Add an address to use during checkout.
					</p>
				</div>
			{/if}

			<!-- Add new address form -->
			{#if showingAddressForm && !editingAddressId}
				<div class="shadow-ambient mt-4 rounded-3xl bg-surface-card p-5">
					<h3 class="mb-4 font-display text-lg font-semibold text-on-surface">Add New Address</h3>
					<form
						method="POST"
						action="?/saveAddress"
						use:enhance={() => {
							return async ({ result, update }) => {
								await update();
								if (result.type === 'success' && !result.data?.error) {
									showingAddressForm = false;
									resetAddressForm();
								}
							};
						}}
					>
						{@render addressFormFields()}
					</form>
				</div>
			{/if}
		</div>

		{#snippet addressFormFields()}
			<div class="space-y-4">
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<label
							for="addr-name"
							class="mb-1 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
							>Full Name *</label
						>
						<input
							id="addr-name"
							name="full_name"
							type="text"
							bind:value={addressForm.full_name}
							required
							placeholder="Priya Sharma"
							class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:border-primary/50 focus:outline-none"
						/>
					</div>
					<div>
						<label
							for="addr-phone"
							class="mb-1 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
							>Phone *</label
						>
						<input
							id="addr-phone"
							name="phone"
							type="tel"
							bind:value={addressForm.phone}
							required
							maxlength="10"
							placeholder="98765 43210"
							inputmode="numeric"
							class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:border-primary/50 focus:outline-none"
						/>
					</div>
				</div>
				<div>
					<label
						for="addr-line1"
						class="mb-1 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
						>Address *</label
					>
					<input
						id="addr-line1"
						name="address_line1"
						type="text"
						bind:value={addressForm.address_line1}
						required
						placeholder="Flat 4B, Rose Apartments, MG Road"
						class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:border-primary/50 focus:outline-none"
					/>
				</div>
				<div>
					<label
						for="addr-line2"
						class="mb-1 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
						>Address Line 2</label
					>
					<input
						id="addr-line2"
						name="address_line2"
						type="text"
						bind:value={addressForm.address_line2}
						placeholder="Landmark / Apartment name (optional)"
						class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:border-primary/50 focus:outline-none"
					/>
				</div>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<div>
						<label
							for="addr-city"
							class="mb-1 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
							>City *</label
						>
						<input
							id="addr-city"
							name="city"
							type="text"
							bind:value={addressForm.city}
							required
							placeholder="Mumbai"
							class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:border-primary/50 focus:outline-none"
						/>
					</div>
					<div>
						<label
							for="addr-state"
							class="mb-1 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
							>State *</label
						>
						<select
							id="addr-state"
							name="state"
							bind:value={addressForm.state_name}
							required
							class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-3 font-body text-sm text-on-surface focus:border-primary/50 focus:outline-none"
						>
							<option value="" disabled>Select state</option>
							<option value="Andhra Pradesh">Andhra Pradesh</option>
							<option value="Arunachal Pradesh">Arunachal Pradesh</option>
							<option value="Assam">Assam</option>
							<option value="Bihar">Bihar</option>
							<option value="Chhattisgarh">Chhattisgarh</option>
							<option value="Goa">Goa</option>
							<option value="Gujarat">Gujarat</option>
							<option value="Haryana">Haryana</option>
							<option value="Himachal Pradesh">Himachal Pradesh</option>
							<option value="Jharkhand">Jharkhand</option>
							<option value="Karnataka">Karnataka</option>
							<option value="Kerala">Kerala</option>
							<option value="Madhya Pradesh">Madhya Pradesh</option>
							<option value="Maharashtra">Maharashtra</option>
							<option value="Manipur">Manipur</option>
							<option value="Meghalaya">Meghalaya</option>
							<option value="Mizoram">Mizoram</option>
							<option value="Nagaland">Nagaland</option>
							<option value="Odisha">Odisha</option>
							<option value="Punjab">Punjab</option>
							<option value="Rajasthan">Rajasthan</option>
							<option value="Sikkim">Sikkim</option>
							<option value="Tamil Nadu">Tamil Nadu</option>
							<option value="Telangana">Telangana</option>
							<option value="Tripura">Tripura</option>
							<option value="Uttar Pradesh">Uttar Pradesh</option>
							<option value="Uttarakhand">Uttarakhand</option>
							<option value="West Bengal">West Bengal</option>
							<option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
							<option value="Chandigarh">Chandigarh</option>
							<option value="Dadra and Nagar Haveli and Daman and Diu"
								>Dadra and Nagar Haveli and Daman and Diu</option
							>
							<option value="Delhi">Delhi</option>
							<option value="Jammu and Kashmir">Jammu and Kashmir</option>
							<option value="Ladakh">Ladakh</option>
							<option value="Lakshadweep">Lakshadweep</option>
							<option value="Puducherry">Puducherry</option>
						</select>
					</div>
					<div>
						<label
							for="addr-pincode"
							class="mb-1 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
							>Pincode *</label
						>
						<input
							id="addr-pincode"
							name="pincode"
							type="text"
							bind:value={addressForm.pincode}
							required
							inputmode="numeric"
							pattern="[0-9]{6}"
							maxlength="6"
							placeholder="400001"
							class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:border-primary/50 focus:outline-none"
						/>
					</div>
				</div>
				<div class="flex items-center gap-2">
					<input
						id="addr-default"
						name="is_default"
						type="checkbox"
						bind:checked={addressForm.is_default}
						class="h-4 w-4 rounded border-on-surface/10 text-primary focus:ring-primary"
					/>
					<label for="addr-default" class="font-body text-sm text-on-surface-muted"
						>Set as default address</label
					>
				</div>
				{#if addressFormError}
					<p class="font-body text-sm text-primary">{addressFormError}</p>
				{/if}
				<div class="flex gap-3">
					<button
						type="submit"
						class="rounded-full bg-gradient-to-r from-primary to-primary-dim px-6 py-2.5 font-body text-sm font-semibold text-white transition-all hover:brightness-110"
					>
						{editingAddressId ? 'Update Address' : 'Save Address'}
					</button>
					<button
						type="button"
						onclick={() => {
							showingAddressForm = false;
							editingAddressId = '';
						}}
						class="rounded-full bg-surface-high px-6 py-2.5 font-body text-sm font-medium text-on-surface transition-colors hover:bg-surface-low"
					>
						Cancel
					</button>
				</div>
			</div>
		{/snippet}

		<!-- ── LOGGED OUT STATE ─────────────────────────────────────────────────── -->
	{:else}
		<div class="mx-auto max-w-lg">
			{#if form?.registered && !registeredDismissed}
				<!-- ── Email Confirmation ──────────────────────────────────────────── -->
				<div class="shadow-ambient rounded-3xl bg-surface-card p-8 text-center">
					<div class="mb-4 text-5xl" aria-hidden="true">📧</div>
					<h2 class="font-display text-2xl font-semibold text-on-surface">Check Your Email</h2>
					<p class="mt-2 font-body text-sm text-on-surface-muted">
						We sent a confirmation link to <strong class="text-on-surface">{form.email}</strong>.<br
						/>
						Click the link to activate your account, then sign in.
					</p>

					<form
						method="POST"
						action="?/resendConfirmation"
						use:enhance={() => {
							resendLoading = true;
							return async ({ result, update }) => {
								await update();
								resendLoading = false;
								if (result.type === 'success' && !result.data?.error) {
									startResendCooldown();
								}
							};
						}}
						class="mt-6"
					>
						<input type="hidden" name="email" value={form.email ?? ''} />
						<button
							type="submit"
							disabled={resendLoading || resendCooldown > 0}
							class="shadow-ambient w-full rounded-full bg-gradient-to-r from-primary to-primary-dim px-6 py-2.5 font-body text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-50"
						>
							{#if resendLoading}
								Resending…
							{:else if resendCooldown > 0}
								Resend in {resendCooldown}s
							{:else}
								Resend confirmation email
							{/if}
						</button>
					</form>

					{#if form?.resendSuccess}
						<p class="mt-2 font-body text-xs text-secondary">Confirmation resent!</p>
					{/if}

					<button
						onclick={() => {
							registeredDismissed = true;
							activeTab = 'login';
						}}
						class="shadow-ambient mt-2 inline-block w-full rounded-full bg-surface-high px-6 py-2.5 font-body text-sm font-medium text-on-surface transition-colors hover:bg-surface-low"
					>
						← Back to Sign In
					</button>
				</div>
			{:else}
				<!-- ── Tab Bar ─────────────────────────────────────────────────── -->
				<div
					class="mb-6 flex flex-col gap-2 rounded-2xl bg-surface-high p-2 md:flex-row md:gap-0 md:p-1"
				>
					<button
						onclick={() => {
							activeTab = 'login';
						}}
						class="w-full rounded-xl py-2.5 font-body text-sm font-semibold transition-all md:flex-1 {activeTab ===
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
						class="w-full rounded-xl py-2.5 font-body text-sm font-semibold transition-all md:flex-1 {activeTab ===
						'register'
							? 'bg-primary text-white shadow-md'
							: 'text-on-surface-muted hover:text-on-surface'}"
					>
						Create Account
					</button>
					<button
						onclick={() => {
							resetEmail = loginEmail;
							activeTab = 'reset';
						}}
						class="w-full rounded-xl py-2.5 font-body text-sm font-semibold transition-all md:flex-1 {activeTab ===
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
						<form
							method="POST"
							action="?/signIn"
							use:enhance={() => {
								loading = true;
								return async ({ result, update }) => {
									if (result.type === 'redirect') {
										window.location.href = result.location;
									} else {
										await update();
										loading = false;
									}
								};
							}}
							class="mt-6 space-y-4"
						>
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
								<div class="relative">
									<input
										id="login-password"
										name="password"
										type={showLoginPassword ? 'text' : 'password'}
										bind:value={loginPassword}
										required
										minlength="8"
										autocomplete="current-password"
										placeholder="••••••••"
										class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-3 pr-10 font-body text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:border-primary/50 focus:outline-none"
									/>
									<button
										type="button"
										onclick={() => (showLoginPassword = !showLoginPassword)}
										class="absolute top-1/2 right-3 -translate-y-1/2 text-on-surface-muted transition-colors hover:text-on-surface"
										tabindex="-1"
									>
										{#if showLoginPassword}
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="h-4 w-4"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
												><path
													d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"
												/><path
													d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"
												/><line x1="1" y1="1" x2="23" y2="23" /></svg
											>
										{:else}
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="h-4 w-4"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
												><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle
													cx="12"
													cy="12"
													r="3"
												/></svg
											>
										{/if}
									</button>
								</div>
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
						<form
							method="POST"
							action="?/signUp"
							use:enhance={() => {
								loading = true;
								return async ({ result, update }) => {
									await update();
									loading = false;
								};
							}}
							class="mt-6 space-y-4"
						>
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
								<div class="relative">
									<input
										id="reg-password"
										name="password"
										type={showRegisterPassword ? 'text' : 'password'}
										bind:value={registerPassword}
										required
										minlength="8"
										autocomplete="new-password"
										placeholder="At least 8 characters"
										class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-3 pr-10 font-body text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:border-primary/50 focus:outline-none"
									/>
									<button
										type="button"
										onclick={() => (showRegisterPassword = !showRegisterPassword)}
										class="absolute top-1/2 right-3 -translate-y-1/2 text-on-surface-muted transition-colors hover:text-on-surface"
										tabindex="-1"
									>
										{#if showRegisterPassword}
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="h-4 w-4"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
												><path
													d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"
												/><path
													d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"
												/><line x1="1" y1="1" x2="23" y2="23" /></svg
											>
										{:else}
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="h-4 w-4"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
												><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle
													cx="12"
													cy="12"
													r="3"
												/></svg
											>
										{/if}
									</button>
								</div>
							</div>
							<div>
								<label
									for="reg-confirm"
									class="mb-1 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
								>
									Confirm Password
								</label>
								<div class="relative">
									<input
										id="reg-confirm"
										type={showRegisterConfirm ? 'text' : 'password'}
										bind:value={registerConfirm}
										required
										minlength="8"
										autocomplete="new-password"
										placeholder="Repeat password"
										class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-3 pr-10 font-body text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:border-primary/50 focus:outline-none"
									/>
									<button
										type="button"
										onclick={() => (showRegisterConfirm = !showRegisterConfirm)}
										class="absolute top-1/2 right-3 -translate-y-1/2 text-on-surface-muted transition-colors hover:text-on-surface"
										tabindex="-1"
									>
										{#if showRegisterConfirm}
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="h-4 w-4"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
												><path
													d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"
												/><path
													d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"
												/><line x1="1" y1="1" x2="23" y2="23" /></svg
											>
										{:else}
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="h-4 w-4"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
												><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle
													cx="12"
													cy="12"
													r="3"
												/></svg
											>
										{/if}
									</button>
								</div>
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

						{#if form?.resetSent}
							<div class="mt-6 rounded-2xl bg-secondary-container/30 px-4 py-5 text-center">
								<div class="mb-2 text-4xl" aria-hidden="true">📧</div>
								<p class="font-body text-sm font-medium text-on-surface">Check your email!</p>
								<p class="mt-1 font-body text-xs text-on-surface-muted">
									We sent a password reset link to <strong class="text-on-surface"
										>{form.email}</strong
									>.
								</p>
							</div>
							<button
								onclick={() => {
									activeTab = 'login';
								}}
								class="shadow-ambient mt-6 w-full rounded-full bg-gradient-to-r from-primary to-primary-dim py-3.5 font-body font-semibold text-white transition-all hover:brightness-110 active:scale-95"
							>
								← Back to Sign In
							</button>
						{:else}
							<form
								method="POST"
								action="?/resetPassword"
								use:enhance={() => {
									resetLoading = true;
									return async ({ result, update }) => {
										await update();
										resetLoading = false;
									};
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
										name="email"
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
			<div class="shadow-ambient max-w-md rounded-2xl bg-surface-card p-8 text-center" role="alert">
				<div class="mb-3 text-5xl" aria-hidden="true">👋</div>
				<p class="font-display text-xl font-semibold text-on-surface">No account found</p>
				<p class="mt-2 font-body text-sm text-on-surface-muted">Please create an account first.</p>
			</div>
		</div>
	{/if}

	<!-- ── Error Modal ─────────────────────────────────────────────────────── -->
	{#if showError}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
			onclick={(e) => {
				if (e.target === e.currentTarget) showError = false;
			}}
			onkeydown={(e) => {
				if (e.key === 'Escape') showError = false;
			}}
		>
			<div class="shadow-ambient max-w-md rounded-2xl bg-surface-card p-8 text-center" role="alert">
				<div class="mb-3 text-5xl" aria-hidden="true">⚠️</div>
				<p class="font-display text-xl font-semibold text-on-surface">Oops!</p>
				<p class="mt-2 font-body text-sm text-on-surface-muted">{errorMessage}</p>
				<button
					onclick={() => (showError = false)}
					class="shadow-ambient mt-6 rounded-full bg-gradient-to-r from-primary to-primary-dim px-6 py-2.5 font-body text-sm font-semibold text-white hover:brightness-110"
				>
					OK
				</button>
			</div>
		</div>
	{/if}
</div>
