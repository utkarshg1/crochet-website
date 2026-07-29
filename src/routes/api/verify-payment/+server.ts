import { json } from '@sveltejs/kit';
import { RAZORPAY_KEY_SECRET } from '$env/static/private';

async function verifySignature(
	orderId: string,
	paymentId: string,
	signature: string
): Promise<boolean> {
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		'raw',
		encoder.encode(RAZORPAY_KEY_SECRET),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const sigBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(`${orderId}|${paymentId}`));
	const computed = Array.from(new Uint8Array(sigBytes))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
	return computed === signature;
}

export async function POST({ request }) {
	let body: {
		razorpay_order_id?: string;
		razorpay_payment_id?: string;
		razorpay_signature?: string;
	};
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid request body' }, { status: 400 });
	}

	const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

	if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
		return json({ error: 'Missing required payment fields' }, { status: 400 });
	}

	try {
		const isValid = await verifySignature(
			razorpay_order_id,
			razorpay_payment_id,
			razorpay_signature
		);

		if (isValid) {
			return json({ verified: true });
		}

		return json({ error: 'Signature mismatch' }, { status: 400 });
	} catch (err) {
		console.error('verify-payment: verification error', err);
		return json({ error: 'Verification failed' }, { status: 500 });
	}
}
