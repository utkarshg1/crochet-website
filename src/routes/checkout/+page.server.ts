import { fail } from '@sveltejs/kit';
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from '$env/static/private';
import type { Actions, PageServerLoad } from './$types';
import type { CartItem } from '$lib/types';
import { calculateShipping } from '$lib/types';

// ── Rate limiter (shared with admin login) ─────────────────────────────
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, max: number, windowMs: number): boolean {
	const now = Date.now();
	const bucket = rateBuckets.get(key);
	if (!bucket || now > bucket.resetAt) {
		rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
		return true;
	}
	bucket.count++;
	return bucket.count <= max;
}

function getClientIp(request: Request): string {
	return (
		request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
		request.headers.get('x-real-ip') ??
		'unknown'
	);
}

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
	const { session, user } = await safeGetSession();
	return { session, user };
};

export const actions: Actions = {
	// ── Step 1: Send OTP to email ───────────────────────────────────────────
	sendOtp: async ({ request, locals: { supabase }, url }) => {
		const data = await request.formData();
		const email = (data.get('email') as string)?.trim().toLowerCase();

		// ── Rate limit: 5 OTP requests per IP per 10 minutes ─────────────
		const ip = getClientIp(request);
		if (!checkRateLimit(`checkout-otp:${ip}`, 5, 10 * 60 * 1000)) {
			return fail(429, { step: 'form', error: 'Too many requests. Try again later.' });
		}

		if (!email || !email.includes('@')) {
			return fail(400, { step: 'form', error: 'Valid email required' });
		}

		const { error } = await supabase.auth.signInWithOtp({
			email,
			options: {
				shouldCreateUser: true,
				data: { full_name: data.get('full_name') as string },
				emailRedirectTo: `${url.origin}/auth/callback`
			}
		});

		if (error) return fail(500, { step: 'form', error: 'Could not send code. Try again.' });

		return { step: 'otp', email };
	},

	// ── Step 2: Verify OTP ──────────────────────────────────────────────────
	verifyOtp: async ({ request, locals: { supabase }, cookies }) => {
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

		// Set a signed cookie to prove OTP was verified (expires in 15 min)
		const verifiedAt = Date.now().toString();
		const payload = `${email}:${verifiedAt}`;
		// Use a simple HMAC-like signature (in production, use a proper secret)
		const signature = await signPayload(payload);
		cookies.set('checkout_verified', `${payload}:${signature}`, {
			path: '/checkout',
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			maxAge: 15 * 60 // 15 minutes
		});

		return { step: 'payment', verified: true };
	},

	// ── Step 3: Create order after Razorpay payment ─────────────────────────
	createOrder: async ({ request, locals: { supabase, safeGetSession }, cookies }) => {
		const { user } = await safeGetSession();
		const data = await request.formData();

		// ── Verify OTP gate ──────────────────────────────────────────────
		const verifiedCookie = cookies.get('checkout_verified');
		if (!verifiedCookie) {
			return fail(403, { error: 'Session expired. Please verify your email again.' });
		}

		const cookieParts = verifiedCookie.split(':');
		if (cookieParts.length < 3) {
			cookies.delete('checkout_verified', { path: '/checkout' });
			return fail(403, { error: 'Invalid session. Please verify your email again.' });
		}

		const [email, verifiedAt, signature] = cookieParts;
		const payload = `${email}:${verifiedAt}`;
		const expectedSig = await signPayload(payload);

		if (signature !== expectedSig) {
			cookies.delete('checkout_verified', { path: '/checkout' });
			return fail(403, { error: 'Invalid session. Please verify your email again.' });
		}

		// Check if cookie has expired (15 min window)
		const age = Date.now() - parseInt(verifiedAt, 10);
		if (age > 15 * 60 * 1000) {
			cookies.delete('checkout_verified', { path: '/checkout' });
			return fail(403, { error: 'Session expired. Please verify your email again.' });
		}

		// Clear the cookie after use (single-use)
		cookies.delete('checkout_verified', { path: '/checkout' });

		// ── Parse and validate items ─────────────────────────────────────
		let items: CartItem[];
		try {
			items = JSON.parse(data.get('items') as string);
		} catch {
			return fail(400, { error: 'Invalid order data.' });
		}

		if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
			return fail(400, { error: 'Invalid order items.' });
		}

		// ── Verify items against database ────────────────────────────────
		const productIds = items.map((i) => i.product_id);
		const { data: dbProducts } = await supabase
			.from('products')
			.select('id, price_paise, stock, title')
			.in('id', productIds);

		if (!dbProducts || dbProducts.length !== productIds.length) {
			return fail(400, { error: 'Some products are no longer available.' });
		}

		const productMap = new Map(dbProducts.map((p) => [p.id, p]));

		// Recalculate totals server-side using DB prices
		let serverSubtotal = 0;
		const validatedItems: CartItem[] = [];

		for (const item of items) {
			const dbProduct = productMap.get(item.product_id);
			if (!dbProduct) {
				return fail(400, { error: `Product "${item.title}" is no longer available.` });
			}
			if (item.qty < 1 || item.qty > dbProduct.stock) {
				return fail(400, {
					error: `"${dbProduct.title}" only has ${dbProduct.stock} in stock.`
				});
			}
			// Use DB price, not client price
			serverSubtotal += dbProduct.price_paise * item.qty;
			validatedItems.push({
				...item,
				price_paise: dbProduct.price_paise, // Override with DB price
				stock: dbProduct.stock
			});
		}

		const serverShipping = calculateShipping(serverSubtotal);
		const serverTotal = serverSubtotal + serverShipping;

		// ── Verify Razorpay payment amount ───────────────────────────────
		const razorpayOrderId = data.get('razorpay_order_id') as string;
		const razorpayPaymentId = data.get('razorpay_payment_id') as string;

		if (!razorpayOrderId || !razorpayPaymentId) {
			return fail(400, { error: 'Missing payment information.' });
		}

		// Verify the Razorpay order amount matches our calculated total
		const razorpayAmount = await verifyRazorpayOrder(razorpayOrderId, serverTotal);
		if (!razorpayAmount) {
			return fail(400, { error: 'Payment verification failed. Please try again.' });
		}

		// ── Generate order number via DB function ────────────────────────
		const { data: orderNum } = await supabase.rpc('generate_order_number');

		const guestEmail = (data.get('email') as string)?.trim().toLowerCase();
		const shippingAddress = JSON.parse(data.get('shipping_address') as string);

		// ── Insert order with server-verified data ───────────────────────
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { data: order, error } = await (supabase as any)
			.from('orders')
			.insert({
				order_number: orderNum ?? `KL-${Date.now()}`,
				user_id: user?.id ?? null,
				guest_name: shippingAddress.full_name,
				guest_email: guestEmail,
				guest_phone: shippingAddress.phone,
				items: validatedItems,
				shipping_address: shippingAddress,
				subtotal_paise: serverSubtotal,
				shipping_paise: serverShipping,
				total_paise: serverTotal,
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

// ── Helpers ────────────────────────────────────────────────────────────

/** Simple HMAC-SHA256 signature for checkout cookies */
async function signPayload(payload: string): Promise<string> {
	const secret = RAZORPAY_KEY_SECRET || 'fallback-dev-secret';
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		'raw',
		encoder.encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
	return Array.from(new Uint8Array(sig))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('')
		.substring(0, 32);
}

/** Verify Razorpay order amount matches expected total */
async function verifyRazorpayOrder(
	razorpayOrderId: string,
	expectedTotalPaise: number
): Promise<boolean> {
	if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
		console.error('Razorpay credentials not configured');
		return false;
	}

	try {
		const credentials = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
		const res = await fetch(`https://api.razorpay.com/v1/orders/${razorpayOrderId}`, {
			headers: {
				Authorization: `Basic ${credentials}`
			}
		});

		if (!res.ok) return false;

		const order = await res.json();
		// Razorpay amount is in paise, same as our total_paise
		return order.amount === expectedTotalPaise && order.status === 'created';
	} catch (err) {
		console.error('Razorpay verification failed:', err);
		return false;
	}
}
