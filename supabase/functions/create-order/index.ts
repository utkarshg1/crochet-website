// supabase/functions/create-order/index.ts
// Creates a Razorpay order from the checkout page.
// Called by the browser — CORS headers are required.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ── CORS: restrict to production domain only ───────────────────────────
const ALLOWED_ORIGINS = [
	'https://kraftedloops.in',
	'https://www.kraftedloops.in',
	'http://localhost:5173', // dev
	'http://localhost:4173' // preview
];

function getCorsHeaders(origin: string | null): Record<string, string> {
	const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
	return {
		'Access-Control-Allow-Origin': allowed,
		'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
		'Access-Control-Allow-Methods': 'POST, OPTIONS'
	};
}

interface CreateOrderRequest {
	amount_paise: number;
	receipt?: string;
	notes?: Record<string, string>;
}

serve(async (req: Request): Promise<Response> => {
	const origin = req.headers.get('Origin');
	const corsHeaders = getCorsHeaders(origin);

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

	// ── Verify caller has a valid Supabase session ─────────────────────
	const authHeader = req.headers.get('Authorization');
	if (!authHeader) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' }
		});
	}

	const supabaseUrl = Deno.env.get('SUPABASE_URL');
	const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

	if (!supabaseUrl || !anonKey) {
		return new Response(JSON.stringify({ error: 'Service misconfigured' }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' }
		});
	}

	const supabase = createClient(supabaseUrl, anonKey, {
		auth: { autoRefreshToken: false, persistSession: false }
	});

	// Verify the JWT is valid (even if it's an anon token)
	const token = authHeader.replace('Bearer ', '');
	const {
		data: { user },
		error: authError
	} = await supabase.auth.getUser(token);

	if (authError || !user) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' }
		});
	}

	try {
		// ── 1. Parse + validate request body ──────────────────────────────────
		let body: CreateOrderRequest;
		try {
			body = await req.json();
		} catch {
			return new Response(JSON.stringify({ error: 'Invalid request' }), {
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
			return new Response(JSON.stringify({ error: 'Invalid amount' }), {
				status: 422,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' }
			});
		}

		// Razorpay enforces a minimum of ₹1 (100 paise)
		if (amount_paise < 100) {
			return new Response(JSON.stringify({ error: 'Amount too small' }), {
				status: 422,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' }
			});
		}

		// ── 2. Load Razorpay credentials from environment ──────────────────────
		const keyId = Deno.env.get('RAZORPAY_KEY_ID');
		const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

		if (!keyId || !keySecret) {
			console.error('create-order: Razorpay credentials not set');
			return new Response(JSON.stringify({ error: 'Payment gateway not configured' }), {
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' }
			});
		}

		// ── 3. Call Razorpay Orders API ────────────────────────────────────────
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
			console.error('create-order: Razorpay API error', razorpayRes.status);
			return new Response(JSON.stringify({ error: 'Failed to create payment order' }), {
				status: 502,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' }
			});
		}

		const order = await razorpayRes.json();

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
	} catch (err) {
		console.error('create-order: unhandled error', err);
		return new Response(JSON.stringify({ error: 'Internal server error' }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' }
		});
	}
});
