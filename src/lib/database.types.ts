// Auto-generated Supabase database types (will be regenerated after schema creation)
// Run: supabase gen types typescript --local > src/lib/database.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
	public: {
		Tables: {
			profiles: {
				Row: {
					id: string;
					full_name: string | null;
					phone: string | null;
					is_admin: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id: string;
					full_name?: string | null;
					phone?: string | null;
					is_admin?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					full_name?: string | null;
					phone?: string | null;
					is_admin?: boolean;
					updated_at?: string;
				};
			};
			categories: {
				Row: {
					id: string;
					name: string;
					slug: string;
					description: string | null;
					image_url: string | null;
					display_order: number;
					created_at: string;
				};
				Insert: {
					id?: string;
					name: string;
					slug: string;
					description?: string | null;
					image_url?: string | null;
					display_order?: number;
					created_at?: string;
				};
				Update: {
					name?: string;
					slug?: string;
					description?: string | null;
					image_url?: string | null;
					display_order?: number;
				};
			};
			products: {
				Row: {
					id: string;
					slug: string;
					title: string;
					description: string;
					price_paise: number;
					compare_at_price_paise: number | null;
					stock: number;
					category_id: string | null;
					images: Json;
					colors: string[];
					dimensions: string | null;
					materials: string | null;
					care_instructions: string | null;
					is_featured: boolean;
					is_new: boolean;
					tags: string[];
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					slug: string;
					title: string;
					description: string;
					price_paise: number;
					compare_at_price_paise?: number | null;
					stock?: number;
					category_id?: string | null;
					images?: Json;
					colors?: string[];
					dimensions?: string | null;
					materials?: string | null;
					care_instructions?: string | null;
					is_featured?: boolean;
					is_new?: boolean;
					tags?: string[];
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					slug?: string;
					title?: string;
					description?: string;
					price_paise?: number;
					compare_at_price_paise?: number | null;
					stock?: number;
					category_id?: string | null;
					images?: Json;
					colors?: string[];
					dimensions?: string | null;
					materials?: string | null;
					care_instructions?: string | null;
					is_featured?: boolean;
					is_new?: boolean;
					tags?: string[];
					updated_at?: string;
				};
			};
			carts: {
				Row: {
					id: string;
					session_id: string;
					user_id: string | null;
					items: Json;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					session_id: string;
					user_id?: string | null;
					items?: Json;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					items?: Json;
					user_id?: string | null;
					updated_at?: string;
				};
			};
			orders: {
				Row: {
					id: string;
					order_number: string;
					user_id: string | null;
					guest_name: string | null;
					guest_email: string | null;
					guest_phone: string | null;
					items: Json;
					shipping_address: Json;
					subtotal_paise: number;
					shipping_paise: number;
					total_paise: number;
					status: string;
					razorpay_order_id: string | null;
					razorpay_payment_id: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					order_number: string;
					user_id?: string | null;
					guest_name?: string | null;
					guest_email?: string | null;
					guest_phone?: string | null;
					items: Json;
					shipping_address: Json;
					subtotal_paise: number;
					shipping_paise?: number;
					total_paise: number;
					status?: string;
					razorpay_order_id?: string | null;
					razorpay_payment_id?: string | null;
					created_at?: string;
				};
				Update: {
					status?: string;
					razorpay_order_id?: string | null;
					razorpay_payment_id?: string | null;
				};
			};
			discounts: {
				Row: {
					id: string;
					code: string;
					type: string;
					value: number;
					min_order_paise: number;
					max_uses: number | null;
					used_count: number;
					valid_until: string | null;
					is_active: boolean;
				};
				Insert: {
					id?: string;
					code: string;
					type: string;
					value: number;
					min_order_paise?: number;
					max_uses?: number | null;
					used_count?: number;
					valid_until?: string | null;
					is_active?: boolean;
				};
				Update: {
					code?: string;
					type?: string;
					value?: number;
					min_order_paise?: number;
					max_uses?: number | null;
					used_count?: number;
					valid_until?: string | null;
					is_active?: boolean;
				};
			};
		};
		Views: Record<string, never>;
		Functions: Record<string, never>;
		Enums: Record<string, never>;
	};
}
