// ─── Domain Types ───────────────────────────────────────────────────────────

export interface Category {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	image_url: string | null;
	display_order: number;
	created_at: string;
	product_count?: number;
}

export interface ProductImage {
	url: string;
	alt: string;
}

export interface Product {
	id: string;
	slug: string;
	title: string;
	description: string;
	price_paise: number;
	compare_at_price_paise: number | null;
	stock: number;
	category_id: string | null;
	category?: Category;
	images: ProductImage[];
	colors: string[];
	dimensions: string | null;
	materials: string | null;
	care_instructions: string | null;
	is_featured: boolean;
	is_new: boolean;
	tags: string[];
	created_at: string;
	updated_at: string;
}

export interface CartItem {
	product_id: string;
	slug: string;
	title: string;
	price_paise: number;
	image_url: string;
	image_alt: string;
	color: string | null;
	qty: number;
	stock: number;
}

export interface ShippingAddress {
	full_name: string;
	phone: string;
	address_line1: string;
	address_line2?: string;
	city: string;
	state: string;
	pincode: string;
}

export interface Order {
	id: string;
	order_number: string;
	user_id: string | null;
	guest_name: string | null;
	guest_email: string | null;
	guest_phone: string | null;
	items: CartItem[];
	shipping_address: ShippingAddress;
	subtotal_paise: number;
	shipping_paise: number;
	total_paise: number;
	status: OrderStatus;
	razorpay_order_id: string | null;
	razorpay_payment_id: string | null;
	created_at: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface WishlistItem {
	id: string;
	user_id: string;
	product_id: string;
	created_at: string;
	product?: Product;
}

export interface Discount {
	id: string;
	code: string;
	type: 'percentage' | 'fixed';
	value: number;
	min_order_paise: number;
	max_uses: number | null;
	used_count: number;
	valid_until: string | null;
	is_active: boolean;
}

// ─── Utility ─────────────────────────────────────────────────────────────────

/** Format paise → ₹ with Indian locale */
export function formatPrice(paise: number): string {
	return new Intl.NumberFormat('en-IN', {
		style: 'currency',
		currency: 'INR',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(paise / 100);
}

/** Free shipping threshold: ₹500 */
export const FREE_SHIPPING_THRESHOLD_PAISE = 50000;
export const SHIPPING_PAISE = 8000; // ₹80

export function calculateShipping(subtotalPaise: number): number {
	return subtotalPaise >= FREE_SHIPPING_THRESHOLD_PAISE ? 0 : SHIPPING_PAISE;
}
