import type { CartItem } from '$lib/types';

const CART_STORAGE_KEY = 'krafted-loops-cart';

function loadFromStorage(): CartItem[] {
	if (typeof localStorage === 'undefined') return [];
	try {
		const raw = localStorage.getItem(CART_STORAGE_KEY);
		return raw ? (JSON.parse(raw) as CartItem[]) : [];
	} catch {
		return [];
	}
}

function saveToStorage(items: CartItem[]) {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

// Svelte 5 runes-based reactive cart
let items = $state<CartItem[]>([]);
let initialized = $state(false);

export const cart = {
	get items(): CartItem[] {
		return items;
	},

	get count(): number {
		return items.reduce((sum, item) => sum + item.qty, 0);
	},

	get subtotal(): number {
		return items.reduce((sum, item) => sum + item.price_paise * item.qty, 0);
	},

	init() {
		if (initialized) return;
		items = loadFromStorage();
		initialized = true;
	},

	add(product: Omit<CartItem, 'qty'>, qty = 1) {
		const key = product.product_id + (product.color ?? '');
		const existing = items.find((i) => i.product_id + (i.color ?? '') === key);
		if (existing) {
			existing.qty = Math.min(existing.qty + qty, product.stock);
		} else {
			items = [...items, { ...product, qty }];
		}
		saveToStorage(items);
	},

	remove(productId: string, color?: string | null) {
		const key = productId + (color ?? '');
		items = items.filter((i) => i.product_id + (i.color ?? '') !== key);
		saveToStorage(items);
	},

	update(productId: string, color: string | null | undefined, qty: number) {
		const key = productId + (color ?? '');
		if (qty <= 0) {
			items = items.filter((i) => i.product_id + (i.color ?? '') !== key);
		} else {
			const item = items.find((i) => i.product_id + (i.color ?? '') === key);
			if (item) item.qty = Math.min(qty, item.stock);
		}
		saveToStorage(items);
	},

	clear() {
		items = [];
		saveToStorage(items);
	}
};
