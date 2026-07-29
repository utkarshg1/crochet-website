<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { cart } from '$lib/cart.svelte';
	import { formatPrice, calculateShipping, FREE_SHIPPING_THRESHOLD_PAISE } from '$lib/types';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const user = $derived(data.user);

	// ── Multi-step state ─────────────────────────────────────────────────────
	type Step = 'address' | 'form' | 'otp' | 'payment';
	// svelte-ignore state_referenced_locally
	const initialStep: Step = user ? 'address' : 'form';
	let step = $state<Step>(initialStep);
	let loading = $state(false);
	let pageError = $state<string | null>(null);

	// ── Guest form values ─────────────────────────────────────────────────────
	let guestEmail = $state('');
	let formValues = $state({
		full_name: '',
		phone: '',
		email: '',
		address_line1: '',
		address_line2: '',
		city: '',
		state_name: '',
		pincode: ''
	});

	// ── Address management (logged-in) ────────────────────────────────────────
	// svelte-ignore state_referenced_locally
	const initialAddresses = data.addresses ?? [];
	let addresses = $state<Array<Record<string, unknown>>>(initialAddresses);
	let selectedAddressId = $state<string>('');
	let editingAddressId = $state<string>('');
	let showingAddressForm = $state(false);

	// svelte-ignore state_referenced_locally
	const initialFullName = user ? ((data.profile?.full_name as string) ?? '') : '';
	// svelte-ignore state_referenced_locally
	const initialPhone = user ? ((data.profile?.phone as string) ?? '') : '';
	let addressForm = $state({
		full_name: initialFullName,
		phone: initialPhone,
		address_line1: '',
		address_line2: '',
		city: '',
		state_name: '',
		pincode: '',
		is_default: false
	});

	// ── OTP ───────────────────────────────────────────────────────────────────
	let otpValue = $state('');
	let resendCooldown = $state(0);
	let resendInterval: ReturnType<typeof setInterval> | null = null;

	// ── Razorpay ──────────────────────────────────────────────────────────────
	let razorpayLoaded = $state(false);
	let razorpayOrderId = $state('');
	let verifyingPayment = $state(false);

	// ── Derived cart values ───────────────────────────────────────────────────
	const subtotal = $derived(cart.subtotal);
	const shipping = $derived(calculateShipping(subtotal));
	const total = $derived(subtotal + shipping);

	// ── React to form action results ──────────────────────────────────────────
	$effect(() => {
		if (!form) return;
		const f = form as Record<string, unknown>;
		if (f.step === 'otp' && f.email) {
			step = 'otp';
			guestEmail = f.email as string;
			startResendCooldown();
		} else if ((f.step === 'payment' && f.verified) || (f.addressSaved && f.proceedPayment)) {
			step = 'payment';
			loadRazorpay();
		} else if (f.addressSaved && f.address) {
			if (f.replacing) {
				addresses = addresses.map((a) =>
					(a.id as string) === (f.address as Record<string, unknown>).id
						? (f.address as Record<string, unknown>)
						: a
				);
			} else {
				addresses = [...addresses, f.address as Record<string, unknown>];
			}
			showingAddressForm = false;
			editingAddressId = '';
			resetAddressForm();
		} else if (f.deleted) {
			const deletedId = f.address_id as string;
			addresses = addresses.filter((a) => a.id !== deletedId);
			if (selectedAddressId === deletedId) selectedAddressId = '';
		} else if (f.orderId) {
			cart.clear();
			goto(`/order/${f.orderId}`);
		}
		if (f.error) {
			pageError = f.error as string;
			loading = false;
		}
	});

	function startResendCooldown() {
		resendCooldown = 30;
		resendInterval = setInterval(() => {
			resendCooldown -= 1;
			if (resendCooldown <= 0) {
				clearInterval(resendInterval!);
				resendInterval = null;
			}
		}, 1000);
	}

	function loadRazorpay() {
		if (typeof window === 'undefined' || razorpayLoaded) return;
		const script = document.createElement('script');
		script.src = 'https://checkout.razorpay.com/v1/checkout.js';
		script.onload = () => (razorpayLoaded = true);
		document.head.appendChild(script);
	}

	function selectAddress(addressId: string) {
		selectedAddressId = addressId;
		const addr = addresses.find((a) => a.id === addressId) as Record<string, unknown>;
		if (addr) {
			formValues.full_name = addr.full_name as string;
			formValues.phone = addr.phone as string;
		}
	}

	function editAddress(addr: Record<string, unknown>) {
		editingAddressId = addr.id as string;
		addressForm = {
			full_name: (addr.full_name as string) ?? '',
			phone: (addr.phone as string) ?? '',
			address_line1: (addr.address_line1 as string) ?? '',
			address_line2: (addr.address_line2 as string) ?? '',
			city: (addr.city as string) ?? '',
			state_name: (addr.state as string) ?? '',
			pincode: (addr.pincode as string) ?? '',
			is_default: (addr.is_default as boolean) ?? false
		};
		showingAddressForm = true;
	}

	function showAddAddress() {
		editingAddressId = '';
		resetAddressForm();
		showingAddressForm = true;
	}

	function resetAddressForm() {
		addressForm = {
			full_name: (data.profile?.full_name as string) ?? '',
			phone: (data.profile?.phone as string) ?? '',
			address_line1: '',
			address_line2: '',
			city: '',
			state_name: '',
			pincode: '',
			is_default: false
		};
	}

	async function initiatePayment() {
		if (!razorpayLoaded) {
			pageError = 'Payment gateway is still loading. Please wait a moment.';
			return;
		}
		loading = true;
		pageError = null;

		try {
			const res = await fetch('/api/create-order', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					amount_paise: total,
					receipt: `receipt-${Date.now()}`,
					notes: { customer_name: formValues.full_name, email: guestEmail || data.user?.email }
				})
			});

			const orderData = await res.json();
			if (!res.ok) throw new Error(orderData.error || 'Failed to create order');
			razorpayOrderId = orderData.order_id;

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const rzp = new (window as any).Razorpay({
				key: (import.meta.env.PUBLIC_RAZORPAY_KEY_ID as string) || '',
				amount: total,
				currency: 'INR',
				order_id: razorpayOrderId,
				name: 'Krafted Loops Studio',
				description: 'Handmade Crochet Products',
				image: '/favicon.svg',
				prefill: {
					name: formValues.full_name,
					email: guestEmail || (data.user?.email as string),
					contact: `+91${formValues.phone}`
				},
				theme: { color: '#a7295a' },
				handler: async function (response: {
					razorpay_payment_id: string;
					razorpay_order_id: string;
					razorpay_signature: string;
				}) {
					const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;
					verifyingPayment = true;
					try {
						const verifyRes = await fetch('/api/verify-payment', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								razorpay_order_id,
								razorpay_payment_id,
								razorpay_signature
							})
						});
						const verifyData = await verifyRes.json();
						if (!verifyRes.ok || !verifyData.verified) {
							throw new Error(verifyData.error || 'Payment verification failed');
						}
						submitOrder(razorpay_order_id, razorpay_payment_id, razorpay_signature);
					} catch (err) {
						pageError =
							err instanceof Error
								? err.message
								: 'Payment verification failed. Please contact support.';
						loading = false;
						verifyingPayment = false;
					}
				},
				modal: {
					ondismiss: () => {
						loading = false;
					}
				}
			});
			rzp.open();
		} catch (err) {
			pageError = err instanceof Error ? err.message : 'Payment failed. Please try again.';
			loading = false;
		}
	}

	// Hidden form submit after successful Razorpay payment
	let orderFormEl: HTMLFormElement;
	let hiddenRzpOrderId = $state('');
	let hiddenRzpPaymentId = $state('');
	let hiddenRzpSignature = $state('');

	function submitOrder(rzpOrderId: string, rzpPaymentId: string, rzpSignature: string) {
		hiddenRzpOrderId = rzpOrderId;
		hiddenRzpPaymentId = rzpPaymentId;
		hiddenRzpSignature = rzpSignature;
		setTimeout(() => orderFormEl?.requestSubmit(), 0);
	}

	onMount(() => {
		cart.init();
		if (cart.count === 0) goto('/cart');
	});
</script>

<svelte:head>
	<title>Checkout — Krafted Loops Studio</title>
	<meta name="description" content="Secure checkout for handmade crochet products." />
</svelte:head>

<!-- ── Page header ──────────────────────────────────────────────────────────── -->
<section class="bg-surface-low py-10">
	<div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
		<h1 class="font-display text-4xl font-semibold text-on-surface">Checkout</h1>
		<p class="mt-1 font-body text-sm text-on-surface-muted">
			<a href="/" class="hover:text-primary">Home</a> /
			<a href="/cart" class="hover:text-primary">Bag</a> /
			<span class="text-on-surface">Checkout</span>
		</p>
	</div>
</section>

<!-- ── Progress steps ──────────────────────────────────────────────────────── -->
<div class="border-b border-surface-high bg-surface-card">
	<div class="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
		<ol class="flex items-center gap-0" aria-label="Checkout progress">
			{#if user}
				{@const prog = [
					{ id: 'address', label: 'Address', num: 1 },
					{ id: 'payment', label: 'Payment', num: 2 }
				]}
				{#each prog as s, i}
					{@const isComplete = step === 'payment' && s.id === 'address'}
					{@const isActive = step === s.id}
					<li class="flex items-center">
						<div class="flex items-center gap-2">
							<span
								class="flex h-8 w-8 items-center justify-center rounded-full font-body text-sm font-bold transition-colors {isComplete
									? 'bg-secondary text-white'
									: isActive
										? 'bg-primary text-white'
										: 'bg-surface-high text-on-surface-muted'}"
							>
								{isComplete ? '✓' : s.num}
							</span>
							<span
								class="font-body text-sm font-medium {isActive
									? 'text-on-surface'
									: 'text-on-surface-muted'}">{s.label}</span
							>
						</div>
						{#if i < 1}
							<div class="mx-3 h-px w-8 bg-surface-high sm:w-16"></div>
						{/if}
					</li>
				{/each}
			{:else}
				{#each [{ id: 'form', label: 'Details', num: 1 }, { id: 'otp', label: 'Verify', num: 2 }, { id: 'payment', label: 'Payment', num: 3 }] as s, i}
					{@const isComplete =
						(step === 'otp' && s.id === 'form') || (step === 'payment' && s.id !== 'payment')}
					{@const isActive = step === s.id}
					<li class="flex items-center">
						<div class="flex items-center gap-2">
							<span
								class="flex h-8 w-8 items-center justify-center rounded-full font-body text-sm font-bold transition-colors {isComplete
									? 'bg-secondary text-white'
									: isActive
										? 'bg-primary text-white'
										: 'bg-surface-high text-on-surface-muted'}"
							>
								{isComplete ? '✓' : s.num}
							</span>
							<span
								class="font-body text-sm font-medium {isActive
									? 'text-on-surface'
									: 'text-on-surface-muted'}">{s.label}</span
							>
						</div>
						{#if i < 2}
							<div class="mx-3 h-px w-8 bg-surface-high sm:w-16"></div>
						{/if}
					</li>
				{/each}
			{/if}
		</ol>
	</div>
</div>

<!-- ── Main layout ───────────────────────────────────────────────────────────── -->
<div class="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
	<div class="flex flex-col gap-8 lg:flex-row lg:items-start">
		<!-- ═══ Left: Step content ════════════════════════════════════════════ -->
		<div class="flex-1">
			<!-- Error banner -->
			{#if pageError}
				<div class="mb-4 rounded-2xl bg-primary/10 px-4 py-3 font-body text-sm text-primary">
					{pageError}
				</div>
			{/if}

			<!-- ── STEP: Address (logged-in users) ───────────────────────────── -->
			{#if step === 'address' && user}
				<div class="shadow-ambient rounded-3xl bg-surface-card p-6 sm:p-8">
					<h2 class="font-display text-2xl font-semibold text-on-surface">Shipping Address</h2>
					<p class="mt-1 font-body text-sm text-on-surface-muted">
						Select a saved address or add a new one.
					</p>

					<!-- Saved addresses -->
					{#if addresses.length > 0}
						<ul class="mt-6 space-y-3">
							{#each addresses as addr (addr.id as string)}
								{@const a = addr as Record<string, unknown>}
								<li>
									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<div
										onclick={() => selectAddress(a.id as string)}
										onkeydown={(e) => {
											if (e.key === 'Enter' || e.key === ' ') {
												e.preventDefault();
												selectAddress(a.id as string);
											}
										}}
										role="button"
										tabindex="0"
										class="w-full rounded-2xl border-2 p-4 text-left transition-all {selectedAddressId ===
										(a.id as string)
											? 'border-primary bg-primary/5'
											: 'border-on-surface/10 bg-surface-high hover:border-primary/30'}"
									>
										<div class="flex items-start justify-between gap-3">
											<div class="min-w-0 flex-1">
												<p class="font-body font-semibold text-on-surface">
													{a.full_name as string}
												</p>
												<p class="mt-0.5 font-body text-sm text-on-surface-muted">
													{a.address_line1 as string}{a.address_line2 ? `, ${a.address_line2}` : ''}
												</p>
												<p class="font-body text-sm text-on-surface-muted">
													{a.city as string}, {a.state as string} — {a.pincode as string}
												</p>
												<p class="mt-0.5 font-body text-sm text-on-surface-muted">
													{a.phone as string}
												</p>
											</div>
											<div class="flex shrink-0 flex-col items-end gap-1">
												{#if a.is_default}
													<span
														class="rounded-full bg-secondary/10 px-2.5 py-0.5 font-body text-[10px] font-semibold text-secondary"
														>Default</span
													>
												{/if}
												<button
													type="button"
													onclick={(e) => {
														e.stopPropagation();
														editAddress(a);
													}}
													class="font-body text-xs text-secondary underline hover:no-underline"
												>
													Edit
												</button>
											</div>
										</div>
									</div>
								</li>
							{/each}
						</ul>
					{/if}

					<!-- Add / Edit address form -->
					{#if showingAddressForm}
						<div class="mt-6 rounded-2xl border border-on-surface/10 bg-surface-low p-4 sm:p-6">
							<h3 class="font-display text-lg font-semibold text-on-surface">
								{editingAddressId ? 'Edit Address' : 'Add New Address'}
							</h3>
							<form
								method="POST"
								action="?/saveAddress"
								use:enhance={() => {
									loading = true;
									pageError = null;
									return async ({ update }) => {
										await update();
										loading = false;
									};
								}}
								class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"
							>
								<input type="hidden" name="address_id" value={editingAddressId} />
								<input
									type="hidden"
									name="is_default"
									value={addressForm.is_default ? 'true' : 'false'}
								/>
								<input type="hidden" name="proceed_payment" value="false" />
								<div class="sm:col-span-2">
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
										class="w-full rounded-xl border border-on-surface/10 bg-surface-card px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:border-primary/50 focus:outline-none"
									/>
								</div>
								<div>
									<label
										for="addr-phone"
										class="mb-1 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
										>Phone *</label
									>
									<div class="flex gap-2">
										<span
											class="flex items-center rounded-xl border border-on-surface/10 bg-surface-card px-3 font-body text-sm text-on-surface-muted"
											>+91</span
										>
										<input
											id="addr-phone"
											name="phone"
											type="tel"
											bind:value={addressForm.phone}
											required
											maxlength="10"
											placeholder="98765 43210"
											class="min-w-0 flex-1 rounded-xl border border-on-surface/10 bg-surface-card px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:border-primary/50 focus:outline-none"
										/>
									</div>
								</div>
								<div class="sm:col-span-2">
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
										class="w-full rounded-xl border border-on-surface/10 bg-surface-card px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:border-primary/50 focus:outline-none"
									/>
								</div>
								<div class="sm:col-span-2">
									<input
										id="addr-line2"
										name="address_line2"
										type="text"
										bind:value={addressForm.address_line2}
										placeholder="Landmark / Apartment name (optional)"
										class="w-full rounded-xl border border-on-surface/10 bg-surface-card px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:border-primary/50 focus:outline-none"
									/>
								</div>
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
										class="w-full rounded-xl border border-on-surface/10 bg-surface-card px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:border-primary/50 focus:outline-none"
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
										class="w-full rounded-xl border border-on-surface/10 bg-surface-card px-4 py-3 font-body text-sm text-on-surface focus:border-primary/50 focus:outline-none"
									>
										<option value="" disabled>Select state</option>
										{#each ['Andhra Pradesh', 'Assam', 'Bihar', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'] as st}
											<option value={st}>{st}</option>
										{/each}
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
										title="Pincode must be exactly 6 digits"
										maxlength="6"
										placeholder="400001"
										oninput={() => { addressForm.pincode = addressForm.pincode.replace(/\D/g, ''); }}
										class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:border-primary/50 focus:outline-none"
									/>
								</div>
								<div class="flex items-center gap-2 sm:col-span-2">
									<input
										id="addr-default"
										name="is_default"
										type="checkbox"
										bind:checked={addressForm.is_default}
										class="h-4 w-4 rounded border-on-surface/30 text-primary focus:ring-primary"
									/>
									<label for="addr-default" class="font-body text-sm text-on-surface-muted"
										>Set as default address</label
									>
								</div>
								<div class="flex gap-3 sm:col-span-2">
									<button
										type="submit"
										disabled={loading}
										class="shadow-ambient flex-1 rounded-full bg-gradient-to-r from-primary to-primary-dim py-3 font-body font-semibold text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-60"
									>
										{editingAddressId ? 'Update Address' : 'Save Address'}
									</button>
									<button
										type="button"
										onclick={() => {
											showingAddressForm = false;
											editingAddressId = '';
										}}
										class="rounded-full bg-surface-high px-6 py-3 font-body font-medium text-on-surface transition-colors hover:bg-surface-low"
									>
										Cancel
									</button>
								</div>
							</form>
						</div>
					{/if}

					<!-- Actions -->
					<div class="mt-6 flex flex-col gap-3 sm:flex-row">
						{#if !showingAddressForm}
							<button
								onclick={showAddAddress}
								class="rounded-full border-2 border-dashed border-on-surface/20 bg-surface-card px-6 py-3 font-body text-sm font-medium text-on-surface-muted transition-colors hover:border-primary/30 hover:text-primary"
							>
								+ Add New Address
							</button>
						{/if}
						<button
							onclick={() => {
								if (!selectedAddressId && addresses.length > 0) {
									const def = addresses.find((a) => a.is_default) ?? addresses[0];
									selectAddress(def.id as string);
								}
								if (selectedAddressId || addresses.length > 0) {
									step = 'payment';
									loadRazorpay();
								} else {
									pageError = 'Please add a shipping address first.';
								}
							}}
							disabled={addresses.length === 0 && !showingAddressForm}
							class="shadow-ambient flex-1 rounded-full bg-gradient-to-r from-primary to-primary-dim py-3 font-body font-semibold text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-60"
						>
							Continue to Payment
						</button>
					</div>
				</div>

				<!-- ── STEP 1: Guest Details Form ─────────────────────────────────── -->
			{:else if step === 'form'}
				<div class="shadow-ambient rounded-3xl bg-surface-card p-6 sm:p-8">
					<h2 class="font-display text-2xl font-semibold text-on-surface">Continue as Guest</h2>
					<p class="mt-1 font-body text-sm text-on-surface-muted">
						No account required. We'll verify your email before payment.
					</p>

					<form
						method="POST"
						action="?/sendOtp"
						use:enhance={() => {
							loading = true;
							pageError = null;
							return async ({ update }) => {
								await update();
								loading = false;
							};
						}}
						class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
					>
						<div class="sm:col-span-2">
							<label
								for="full_name"
								class="mb-1 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
								>Full Name *</label
							>
							<input
								id="full_name"
								name="full_name"
								type="text"
								bind:value={formValues.full_name}
								required
								autocomplete="name"
								placeholder="Priya Sharma"
								class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:border-primary/50 focus:outline-none"
							/>
						</div>

						<div>
							<label
								for="phone"
								class="mb-1 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
								>Phone *</label
							>
							<div class="flex gap-2">
								<span
									class="flex items-center rounded-xl border border-on-surface/10 bg-surface-high px-3 font-body text-sm text-on-surface-muted"
									>+91</span
								>
								<input
									id="phone"
									name="phone"
									type="tel"
									bind:value={formValues.phone}
									required
									autocomplete="tel"
									placeholder="98765 43210"
									maxlength="10"
									class="min-w-0 flex-1 rounded-xl border border-on-surface/10 bg-surface-high px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:border-primary/50 focus:outline-none"
								/>
							</div>
						</div>

						<div>
							<label
								for="email"
								class="mb-1 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
								>Email *</label
							>
							<input
								id="email"
								name="email"
								type="email"
								bind:value={formValues.email}
								required
								autocomplete="email"
								placeholder="priya@example.com"
								class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:border-primary/50 focus:outline-none"
							/>
						</div>

						<div class="sm:col-span-2">
							<label
								for="address_line1"
								class="mb-1 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
								>Address *</label
							>
							<input
								id="address_line1"
								name="address_line1"
								type="text"
								bind:value={formValues.address_line1}
								required
								autocomplete="address-line1"
								placeholder="Flat 4B, Rose Apartments, MG Road"
								class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:border-primary/50 focus:outline-none"
							/>
						</div>

						<div class="sm:col-span-2">
							<input
								id="address_line2"
								name="address_line2"
								type="text"
								bind:value={formValues.address_line2}
								autocomplete="address-line2"
								placeholder="Landmark / Apartment name (optional)"
								class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:border-primary/50 focus:outline-none"
							/>
						</div>

						<div>
							<label
								for="city"
								class="mb-1 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
								>City *</label
							>
							<input
								id="city"
								name="city"
								type="text"
								bind:value={formValues.city}
								required
								autocomplete="address-level2"
								placeholder="Mumbai"
								class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:border-primary/50 focus:outline-none"
							/>
						</div>

						<div>
							<label
								for="state_name"
								class="mb-1 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
								>State *</label
							>
							<select
								id="state_name"
								name="state_name"
								bind:value={formValues.state_name}
								required
								class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-3 font-body text-sm text-on-surface focus:border-primary/50 focus:outline-none"
							>
								<option value="" disabled selected>Select state</option>
								{#each ['Andhra Pradesh', 'Assam', 'Bihar', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'] as st}
									<option value={st}>{st}</option>
								{/each}
							</select>
						</div>

						<div>
							<label
								for="pincode"
								class="mb-1 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
								>Pincode *</label
							>
							<input
								id="pincode"
								name="pincode"
								type="text"
								bind:value={formValues.pincode}
								required
								inputmode="numeric"
								pattern="[0-9]{6}"
								title="Pincode must be exactly 6 digits"
								maxlength="6"
								placeholder="400001"
								oninput={() => { formValues.pincode = formValues.pincode.replace(/\D/g, ''); }}
								class="w-full rounded-xl border border-on-surface/10 bg-surface-high px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:border-primary/50 focus:outline-none"
							/>
						</div>

						<div class="mt-2 sm:col-span-2">
							<button
								type="submit"
								disabled={loading}
								class="shadow-ambient w-full rounded-full bg-gradient-to-r from-primary to-primary-dim py-4 font-body font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-95 disabled:opacity-60"
							>
								{loading ? 'Sending code…' : 'Send Verification Code'}
							</button>
							<p class="mt-3 text-center font-body text-sm text-on-surface-muted">
								Already have an account?
								<a href="/account" class="text-secondary hover:underline">Sign in</a>
							</p>
						</div>
					</form>
				</div>

				<!-- ── STEP 2: OTP Verification ───────────────────────────────────── -->
			{:else if step === 'otp'}
				<div class="shadow-ambient rounded-3xl bg-surface-card p-8 text-center">
					<div class="mb-4 text-6xl" aria-hidden="true">📧</div>
					<h2 class="font-display text-2xl font-semibold text-on-surface">Check your email</h2>
					<p class="mt-2 font-body text-sm text-on-surface-muted">
						We've sent a 6-digit code to <strong class="text-on-surface">{guestEmail}</strong>
					</p>

					<form
						method="POST"
						action="?/verifyOtp"
						use:enhance={() => {
							loading = true;
							pageError = null;
							return async ({ update }) => {
								await update();
								loading = false;
							};
						}}
						class="mt-8 space-y-4"
					>
						<input type="hidden" name="email" value={guestEmail} />
						<input
							name="token"
							type="text"
							bind:value={otpValue}
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
							class="shadow-ambient w-full rounded-full bg-gradient-to-r from-primary to-primary-dim py-4 font-body font-semibold text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-60"
						>
							{loading ? 'Verifying…' : 'Verify & Continue'}
						</button>
					</form>

					<div class="mt-4 space-y-2">
						{#if resendCooldown > 0}
							<p class="font-body text-sm text-on-surface-muted">
								Resend code in <span class="font-semibold text-secondary">{resendCooldown}s</span>
							</p>
						{:else}
							<form
								method="POST"
								action="?/sendOtp"
								use:enhance={() => {
									return async ({ update }) => {
										await update();
										startResendCooldown();
									};
								}}
							>
								<input type="hidden" name="email" value={guestEmail} />
								<input type="hidden" name="full_name" value={formValues.full_name} />
								<button
									type="submit"
									class="font-body text-sm text-secondary underline hover:no-underline"
								>
									Didn't get the code? Resend
								</button>
							</form>
						{/if}
						<button
							onclick={() => {
								step = 'form';
								pageError = null;
							}}
							class="block w-full font-body text-sm text-on-surface-muted hover:text-primary"
						>
							← Change email
						</button>
					</div>
				</div>

				<!-- ── STEP 3: Payment ─────────────────────────────────────────────── -->
			{:else if step === 'payment'}
				<div class="shadow-ambient rounded-3xl bg-surface-card p-8">
					<h2 class="font-display text-2xl font-semibold text-on-surface">Complete Payment</h2>
					<p class="mt-1 font-body text-sm text-on-surface-muted">
						{#if user}
							Welcome back, <strong class="text-secondary"
								>{(data.profile?.full_name as string) ?? data.user?.email}</strong
							> ✓
						{:else}
							Your email <strong class="text-secondary">{guestEmail}</strong> is verified ✓
						{/if}
					</p>

					<div class="mt-6 rounded-2xl bg-surface-low p-4">
						<p class="mb-2 font-body text-sm text-on-surface-muted">Order total</p>
						<p class="font-display text-3xl font-semibold text-on-surface">{formatPrice(total)}</p>
						{#if calculateShipping(subtotal) === 0}
							<p class="mt-1 font-body text-xs font-semibold text-secondary">
								Free shipping included 🎉
							</p>
						{/if}
					</div>

					<button
						onclick={initiatePayment}
						disabled={loading}
						class="shadow-ambient mt-6 w-full rounded-full bg-gradient-to-r from-primary to-primary-dim py-4 font-body font-semibold text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-60"
					>
						{#if verifyingPayment}
							<span class="inline-flex items-center gap-2">
								<svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
									<circle
										class="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										stroke-width="4"
									/>
									<path
										class="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
									/>
								</svg>
								Verifying…
							</span>
						{:else if loading}
							<span class="inline-flex items-center gap-2">
								<svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
									<circle
										class="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										stroke-width="4"
									/>
									<path
										class="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
									/>
								</svg>
								Processing…
							</span>
						{:else}
							Pay {formatPrice(total)} with Razorpay
						{/if}
					</button>

					<div class="mt-4 flex items-center justify-center gap-4">
						<span class="font-body text-xs text-on-surface-muted">🔒 256-bit SSL</span>
						<span class="font-body text-xs text-on-surface-muted">💳 UPI · Cards · Net Banking</span
						>
					</div>
				</div>
			{/if}
		</div>

		<!-- ═══ Right: Order summary ══════════════════════════════════════════ -->
		<aside class="lg:w-80">
			<div class="shadow-ambient rounded-3xl bg-surface-card p-6 lg:sticky lg:top-24">
				<h2 class="font-display text-xl font-semibold text-on-surface">Your Order</h2>
				<ul class="mt-4 space-y-3">
					{#each cart.items as item (item.product_id + (item.color ?? ''))}
						<li class="flex items-center gap-3">
							<div
								class="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-high"
							>
								{#if item.image_url && !item.image_url.startsWith('/placeholder')}
									<img
										src={item.image_url}
										alt={item.image_alt}
										class="h-full w-full object-cover"
									/>
								{:else}
									<span class="text-xl" aria-hidden="true">🧶</span>
								{/if}
							</div>
							<div class="min-w-0 flex-1">
								<p class="line-clamp-1 font-body text-sm font-medium text-on-surface">
									{item.title}
								</p>
								{#if item.color}<p class="font-body text-xs text-on-surface-muted">
										{item.color}
									</p>{/if}
							</div>
							<div class="text-right">
								<p class="font-body text-sm font-semibold text-on-surface">
									{formatPrice(item.price_paise * item.qty)}
								</p>
								<p class="font-body text-xs text-on-surface-muted">×{item.qty}</p>
							</div>
						</li>
					{/each}
				</ul>
				<hr class="my-4 border-surface-high" />
				<div class="space-y-2">
					<div class="flex justify-between font-body text-sm text-on-surface">
						<span>Subtotal</span><span>{formatPrice(subtotal)}</span>
					</div>
					<div class="flex justify-between font-body text-sm text-on-surface">
						<span>Shipping</span>
						<span class={shipping === 0 ? 'font-semibold text-secondary' : ''}>
							{shipping === 0 ? 'FREE' : formatPrice(shipping)}
						</span>
					</div>
				</div>
				<hr class="my-4 border-surface-high" />
				<div class="flex justify-between">
					<span class="font-body font-semibold text-on-surface">Total</span>
					<span class="font-display text-xl font-semibold text-on-surface"
						>{formatPrice(total)}</span
					>
				</div>
			</div>
		</aside>
	</div>
</div>

<!-- Hidden form for post-payment order creation -->
<form
	bind:this={orderFormEl}
	method="POST"
	action="?/createOrder"
	use:enhance={() => {
		loading = true;
		return async ({ update }) => {
			await update();
			loading = false;
		};
	}}
	class="hidden"
	aria-hidden="true"
>
	<input type="hidden" name="email" value={guestEmail || (data.user?.email as string)} />
	<input type="hidden" name="items" value={JSON.stringify(cart.items)} />
	<input type="hidden" name="address_id" value={selectedAddressId} />
	<input
		type="hidden"
		name="shipping_address"
		value={JSON.stringify({
			full_name:
				formValues.full_name ||
				(selectedAddressId ? addresses.find((a) => a.id === selectedAddressId)?.full_name : ''),
			phone:
				formValues.phone ||
				(selectedAddressId ? addresses.find((a) => a.id === selectedAddressId)?.phone : ''),
			address_line1:
				formValues.address_line1 ||
				(selectedAddressId
					? ((addresses.find((a) => a.id === selectedAddressId) as Record<string, unknown>)
							?.address_line1 as string)
					: ''),
			address_line2:
				formValues.address_line2 ||
				(selectedAddressId
					? ((addresses.find((a) => a.id === selectedAddressId) as Record<string, unknown>)
							?.address_line2 as string)
					: ''),
			city:
				formValues.city ||
				(selectedAddressId
					? ((addresses.find((a) => a.id === selectedAddressId) as Record<string, unknown>)
							?.city as string)
					: ''),
			state:
				formValues.state_name ||
				(selectedAddressId
					? ((addresses.find((a) => a.id === selectedAddressId) as Record<string, unknown>)
							?.state as string)
					: ''),
			pincode:
				formValues.pincode ||
				(selectedAddressId
					? ((addresses.find((a) => a.id === selectedAddressId) as Record<string, unknown>)
							?.pincode as string)
					: '')
		})}
	/>
	<input type="hidden" name="subtotal_paise" value={subtotal} />
	<input type="hidden" name="shipping_paise" value={shipping} />
	<input type="hidden" name="razorpay_order_id" value={hiddenRzpOrderId} />
	<input type="hidden" name="razorpay_payment_id" value={hiddenRzpPaymentId} />
	<input type="hidden" name="razorpay_signature" value={hiddenRzpSignature} />
</form>
