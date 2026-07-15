<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { cart } from '$lib/cart.svelte';
	import { formatPrice, calculateShipping, FREE_SHIPPING_THRESHOLD_PAISE } from '$lib/types';
	import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// ── Multi-step state ─────────────────────────────────────────────────────
	type Step = 'form' | 'otp' | 'payment';
	let step = $state<Step>('form');
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

	// ── OTP ───────────────────────────────────────────────────────────────────
	let otpValue = $state('');
	let resendCooldown = $state(0);
	let resendInterval: ReturnType<typeof setInterval> | null = null;

	// ── Razorpay ──────────────────────────────────────────────────────────────
	let razorpayLoaded = $state(false);
	let razorpayOrderId = $state('');

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
		} else if (f.step === 'payment' && f.verified) {
			step = 'payment';
			loadRazorpay();
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

	async function initiatePayment() {
		if (!razorpayLoaded) {
			pageError = 'Payment gateway is still loading. Please wait a moment.';
			return;
		}
		loading = true;
		pageError = null;

		try {
			// Call Supabase Edge Function to create Razorpay order
			const res = await fetch(`${PUBLIC_SUPABASE_URL}/functions/v1/create-order`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${PUBLIC_SUPABASE_ANON_KEY}`
				},
				body: JSON.stringify({
					amount_paise: total,
					receipt: `guest-${Date.now()}`,
					notes: { customer_name: formValues.full_name, email: guestEmail }
				})
			});

			const orderData = await res.json();
			if (!res.ok) throw new Error(orderData.error || 'Failed to create order');
			razorpayOrderId = orderData.razorpay_order_id;

			// Open Razorpay checkout
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
					email: guestEmail,
					contact: `+91${formValues.phone}`
				},
				theme: { color: '#a7295a' },
				handler: function (response: { razorpay_payment_id: string; razorpay_order_id: string }) {
					submitOrder(response.razorpay_order_id, response.razorpay_payment_id);
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

	function submitOrder(rzpOrderId: string, rzpPaymentId: string) {
		hiddenRzpOrderId = rzpOrderId;
		hiddenRzpPaymentId = rzpPaymentId;
		// Trigger form submit on next tick
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

			<!-- ── STEP 1: Guest Details Form ─────────────────────────────────── -->
			{#if step === 'form'}
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
								autocomplete="postal-code"
								placeholder="400001"
								maxlength="6"
								pattern="[0-9]{6}"
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
						Your email <strong class="text-secondary">{guestEmail}</strong> is verified ✓
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
						{#if loading}
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
	<input type="hidden" name="email" value={guestEmail} />
	<input type="hidden" name="items" value={JSON.stringify(cart.items)} />
	<input
		type="hidden"
		name="shipping_address"
		value={JSON.stringify({
			full_name: formValues.full_name,
			phone: formValues.phone,
			address_line1: formValues.address_line1,
			address_line2: formValues.address_line2,
			city: formValues.city,
			state: formValues.state_name,
			pincode: formValues.pincode
		})}
	/>
	<input type="hidden" name="subtotal_paise" value={subtotal} />
	<input type="hidden" name="shipping_paise" value={shipping} />
	<input type="hidden" name="razorpay_order_id" value={hiddenRzpOrderId} />
	<input type="hidden" name="razorpay_payment_id" value={hiddenRzpPaymentId} />
</form>
