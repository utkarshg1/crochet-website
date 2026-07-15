// supabase/functions/create-order/index.ts
// Creates a Razorpay order from the checkout page.
// Called by the browser — CORS headers are required.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
	'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

interface CreateOrderRequest {
	amount_paise: number;
	receipt?: string;
	notes?: Record<string, string>;
}

interface RazorpayOrderResponse {
	id: string;
	amount: number;
	currency: string;
	receipt: string;
	status: string;
}

serve(async (req: Request): Promise<Response> => {
	// Preflight — browsers send this before the real POST
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	if (req.method !== 'POST') {
		return new Response(JSON.stringify({ error: 'Method not allowed' }), {
			status: 405,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' }
		});
	}

	try {
		// ── 1. Parse + validate request body ──────────────────────────────────
		let body: CreateOrderRequest;
		try {
			body = await req.json();
		} catch {
			return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
				status: 400,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' }
			});
		}

		const { amount_paise, receipt, notes } = body;

		if (
			amount_paise === undefined ||
			amount_paise === null ||
			typeof amount_paise !== 'number' ||
			!Number.isInteger(amount_paise) ||
			amount_paise <= 0
		) {
			return new Response(
				JSON.stringify({
					error: 'amount_paise is required and must be a positive integer (paise)'
				}),
				{
					status: 422,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' }
				}
			);
		}

		// Razorpay enforces a minimum of ₹1 (100 paise)
		if (amount_paise < 100) {
			return new Response(JSON.stringify({ error: 'amount_paise must be at least 100 (₹1.00)' }), {
				status: 422,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' }
			});
		}

		// ── 2. Load Razorpay credentials from environment ──────────────────────
		const keyId = Deno.env.get('RAZORPAY_KEY_ID');
		const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

		if (!keyId || !keySecret) {
			console.error('create-order: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not set');
			return new Response(JSON.stringify({ error: 'Payment gateway not configured' }), {
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' }
			});
		}

		// ── 3. Call Razorpay Orders API ────────────────────────────────────────
		// Razorpay uses HTTP Basic auth: key_id:key_secret, base64-encoded.
		const credentials = btoa(`${keyId}:${keySecret}`);

		const razorpayPayload: Record<string, unknown> = {
			amount: amount_paise,
			currency: 'INR'
		};

		if (receipt) razorpayPayload.receipt = receipt;
		if (notes && Object.keys(notes).length > 0) razorpayPayload.notes = notes;

		const razorpayRes = await fetch('https://api.razorpay.com/v1/orders', {
			method: 'POST',
			headers: {
				Authorization: `Basic ${credentials}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(razorpayPayload)
		});

		// ── 4. Handle Razorpay errors ──────────────────────────────────────────
		if (!razorpayRes.ok) {
			let razorpayError: unknown;
			try {
				razorpayError = await razorpayRes.json();
			} catch {
				razorpayError = { description: 'Unknown error from Razorpay' };
			}
			console.error('create-order: Razorpay API error', razorpayRes.status, razorpayError);

			// Surface a safe message — never leak raw gateway errors to the browser
			return new Response(
				JSON.stringify({ error: 'Failed to create payment order. Please try again.' }),
				{
					status: 502,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' }
				}
			);
		}

		const order: RazorpayOrderResponse = await razorpayRes.json();

		// ── 5. Return minimal order object the frontend needs ──────────────────
		return new Response(
			JSON.stringify({
				razorpay_order_id: order.id,
				amount: order.amount,
				currency: order.currency
			}),
			{
				status: 200,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' }
			}
		);
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : 'Internal server error';
		console.error('create-order: unhandled error', err);
		return new Response(JSON.stringify({ error: message }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' }
		});
	}
});
