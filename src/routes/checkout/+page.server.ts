import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
	const { session, user } = await safeGetSession();
	return { session, user };
};

export const actions: Actions = {
	// ── Step 1: Send OTP to email ───────────────────────────────────────────
	sendOtp: async ({ request, locals: { supabase } }) => {
		const data = await request.formData();
		const email = (data.get('email') as string)?.trim();

		if (!email || !email.includes('@')) {
			return fail(400, { step: 'form', error: 'Valid email required' });
		}

		const { error } = await supabase.auth.signInWithOtp({
			email,
			options: {
				shouldCreateUser: true,
				data: { full_name: data.get('full_name') as string }
			}
		});

		if (error) return fail(500, { step: 'form', error: error.message });

		return { step: 'otp', email };
	},

	// ── Step 2: Verify OTP ──────────────────────────────────────────────────
	verifyOtp: async ({ request, locals: { supabase } }) => {
		const data = await request.formData();
		const email = data.get('email') as string;
		const token = data.get('token') as string;

		if (!token || token.length !== 6) {
			return fail(400, { step: 'otp', error: 'Enter the 6-digit code' });
		}

		const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });

		if (error) {
			return fail(400, { step: 'otp', error: 'Invalid or expired code. Try again.' });
		}

		return { step: 'payment', verified: true };
	},

	// ── Step 3: Create order after Razorpay payment ─────────────────────────
	createOrder: async ({ request, locals: { supabase, safeGetSession } }) => {
		const { user } = await safeGetSession();
		const data = await request.formData();

		const items = JSON.parse(data.get('items') as string);
		const shippingAddress = JSON.parse(data.get('shipping_address') as string);
		const subtotalPaise = parseInt(data.get('subtotal_paise') as string, 10);
		const shippingPaise = parseInt(data.get('shipping_paise') as string, 10);
		const razorpayOrderId = data.get('razorpay_order_id') as string;
		const razorpayPaymentId = data.get('razorpay_payment_id') as string;
		const guestEmail = data.get('email') as string;

		// Generate order number via DB function
		const { data: orderNum } = await supabase.rpc('generate_order_number');

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { data: order, error } = await (supabase as any)
			.from('orders')
			.insert({
				order_number: orderNum ?? `KL-${Date.now()}`,
				user_id: user?.id ?? null,
				guest_name: shippingAddress.full_name,
				guest_email: guestEmail,
				guest_phone: shippingAddress.phone,
				items,
				shipping_address: shippingAddress,
				subtotal_paise: subtotalPaise,
				shipping_paise: shippingPaise,
				total_paise: subtotalPaise + shippingPaise,
				status: 'processing',
				razorpay_order_id: razorpayOrderId,
				razorpay_payment_id: razorpayPaymentId
			})
			.select()
			.single();

		if (error) {
			console.error('Order insert error:', error);
			return fail(500, { error: 'Could not save order. Please contact us.' });
		}

		return { orderId: order.id, orderNumber: order.order_number };
	}
};
