// supabase/functions/razorpay-webhook/index.ts
// Receives Razorpay webhook events, verifies the HMAC-SHA256 signature,
// then updates the Supabase orders table.
//
// This is a server-to-server call from Razorpay — no CORS headers needed.
// The raw body MUST be read before any JSON parsing because the HMAC is
// computed over the exact bytes Razorpay sent.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Verifies the Razorpay webhook signature using Web Crypto API.
 *
 * Razorpay signs the raw request body with HMAC-SHA256 using the webhook
 * secret and sends the hex digest in the `x-razorpay-signature` header.
 */
async function verifyRazorpaySignature(
	rawBody: string,
	signature: string,
	secret: string
): Promise<boolean> {
	const encoder = new TextEncoder();

	const key = await crypto.subtle.importKey(
		'raw',
		encoder.encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false, // not extractable
		['sign']
	);

	const signatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody));

	// Convert the ArrayBuffer to a lowercase hex string
	const computedHex = Array.from(new Uint8Array(signatureBytes))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');

	// Constant-time comparison to prevent timing attacks.
	// Both strings are hex, so they have the same length when equal.
	if (computedHex.length !== signature.length) return false;

	let mismatch = 0;
	for (let i = 0; i < computedHex.length; i++) {
		mismatch |= computedHex.charCodeAt(i) ^ signature.charCodeAt(i);
	}
	return mismatch === 0;
}

// ── Razorpay payload types (only the fields we use) ──────────────────────────

interface RazorpayPaymentEntity {
	id: string; // razorpay_payment_id  e.g. "pay_xxx"
	order_id: string; // razorpay_order_id    e.g. "order_xxx"
	amount: number;
	currency: string;
	status: string;
}

interface RazorpayWebhookPayload {
	event: string;
	payload: {
		payment: {
			entity: RazorpayPaymentEntity;
		};
	};
}

// ── Handler ───────────────────────────────────────────────────────────────────

serve(async (req: Request): Promise<Response> => {
	if (req.method !== 'POST') {
		return new Response(JSON.stringify({ error: 'Method not allowed' }), {
			status: 405,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	// ── 1. Read raw body as text before doing anything else ───────────────────
	// req.text() gives us the exact bytes sent by Razorpay. If we called
	// req.json() first, the raw text would be consumed and unavailable.
	let rawBody: string;
	try {
		rawBody = await req.text();
	} catch {
		return new Response(JSON.stringify({ error: 'Failed to read request body' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	// ── 2. Extract and validate the signature header ──────────────────────────
	const signature = req.headers.get('x-razorpay-signature');
	if (!signature) {
		console.warn('razorpay-webhook: missing x-razorpay-signature header');
		return new Response(JSON.stringify({ error: 'Missing signature' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	// ── 3. Load webhook secret ────────────────────────────────────────────────
	const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');
	if (!webhookSecret) {
		console.error('razorpay-webhook: RAZORPAY_WEBHOOK_SECRET not set');
		return new Response(JSON.stringify({ error: 'Webhook not configured' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	// ── 4. Verify HMAC-SHA256 signature ───────────────────────────────────────
	// This is the critical security gate. Reject anything that doesn't match
	// before touching the payload — prevents spoofed webhook attacks.
	let isValid: boolean;
	try {
		isValid = await verifyRazorpaySignature(rawBody, signature, webhookSecret);
	} catch (err) {
		console.error('razorpay-webhook: signature verification threw', err);
		return new Response(JSON.stringify({ error: 'Signature verification failed' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	if (!isValid) {
		console.warn('razorpay-webhook: invalid signature — request rejected');
		return new Response(JSON.stringify({ error: 'Invalid signature' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	// ── 5. Parse JSON payload (safe now that signature is verified) ───────────
	let webhookPayload: RazorpayWebhookPayload;
	try {
		webhookPayload = JSON.parse(rawBody);
	} catch {
		return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const { event, payload } = webhookPayload;
	console.log(`razorpay-webhook: received event "${event}"`);

	// ── 6. Handle payment.captured ────────────────────────────────────────────
	if (event === 'payment.captured') {
		const paymentEntity = payload?.payment?.entity;

		if (!paymentEntity?.order_id || !paymentEntity?.id) {
			console.error(
				'razorpay-webhook: payment.captured missing order_id or payment id',
				paymentEntity
			);
			return new Response(JSON.stringify({ error: 'Malformed payment payload' }), {
				status: 422,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const razorpayOrderId = paymentEntity.order_id;
		const razorpayPaymentId = paymentEntity.id;

		// ── 7. Build service-role Supabase client ─────────────────────────────
		// Service role key bypasses Row Level Security — use it only here in
		// a verified server-to-server context, never expose it to the browser.
		const supabaseUrl = Deno.env.get('SUPABASE_URL');
		const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

		if (!supabaseUrl || !serviceRoleKey) {
			console.error('razorpay-webhook: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set');
			return new Response(JSON.stringify({ error: 'Database not configured' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const supabase = createClient(supabaseUrl, serviceRoleKey, {
			auth: {
				// Disable auto-refresh and session persistence — this is a short-lived
				// Edge Function invocation, not a long-lived client session.
				autoRefreshToken: false,
				persistSession: false
			}
		});

		// ── 8. Update the orders table ────────────────────────────────────────
		// Match on razorpay_order_id (set when the order was first created).
		// We move status to 'processing' — a background job or second webhook
		// (payment.captured is the right hook) can advance it further.
		const { error: dbError } = await supabase
			.from('orders')
			.update({
				status: 'processing',
				razorpay_payment_id: razorpayPaymentId,
				updated_at: new Date().toISOString()
			})
			.eq('razorpay_order_id', razorpayOrderId);

		if (dbError) {
			console.error(`razorpay-webhook: DB update failed for order ${razorpayOrderId}`, dbError);
			// Return 500 so Razorpay retries the webhook — it will retry for up to
			// 24 hours with exponential back-off when it receives a non-2xx response.
			return new Response(JSON.stringify({ error: 'Database update failed' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		console.log(
			`razorpay-webhook: order ${razorpayOrderId} updated → status=processing, payment=${razorpayPaymentId}`
		);
	} else {
		// Log unhandled events but always return 200 so Razorpay stops retrying.
		console.log(`razorpay-webhook: unhandled event "${event}" — acknowledged`);
	}

	// ── 9. Acknowledge receipt ─────────────────────────────────────────────────
	// Razorpay expects a 200 within 5 seconds; anything else triggers a retry.
	return new Response(JSON.stringify({ received: true }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
});
