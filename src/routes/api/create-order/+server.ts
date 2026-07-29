import { json } from '@sveltejs/kit';
import Razorpay from 'razorpay';
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from '$env/static/private';

const razorpay = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });

export async function POST({ request }) {
	let body: { amount_paise?: number; receipt?: string; notes?: Record<string, string> };
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid request body' }, { status: 400 });
	}

	const { amount_paise, receipt, notes } = body;

	if (
		amount_paise === undefined ||
		amount_paise === null ||
		typeof amount_paise !== 'number' ||
		!Number.isInteger(amount_paise) ||
		amount_paise < 100
	) {
		return json({ error: 'Invalid amount (minimum 100 paise)' }, { status: 400 });
	}

	try {
		const order = await razorpay.orders.create({
			amount: amount_paise,
			currency: 'INR',
			receipt: receipt || `receipt-${Date.now()}`,
			notes: notes || {}
		});

		return json({
			order_id: order.id,
			amount: order.amount,
			currency: order.currency
		});
	} catch (err) {
		console.error('create-order: Razorpay API error', err);
		return json({ error: 'Failed to create payment order' }, { status: 500 });
	}
}
