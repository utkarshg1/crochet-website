export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
	// Allows to automatically instantiate createClient with right options
	// instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
	__InternalSupabase: {
		PostgrestVersion: '14.5';
	};
	public: {
		Tables: {
			carts: {
				Row: {
					created_at: string | null;
					id: string;
					items: Json | null;
					session_id: string;
					updated_at: string | null;
					user_id: string | null;
				};
				Insert: {
					created_at?: string | null;
					id?: string;
					items?: Json | null;
					session_id: string;
					updated_at?: string | null;
					user_id?: string | null;
				};
				Update: {
					created_at?: string | null;
					id?: string;
					items?: Json | null;
					session_id?: string;
					updated_at?: string | null;
					user_id?: string | null;
				};
				Relationships: [];
			};
			categories: {
				Row: {
					created_at: string | null;
					description: string | null;
					display_order: number | null;
					id: string;
					image_url: string | null;
					name: string;
					slug: string;
					tagline: string | null;
				};
				Insert: {
					created_at?: string | null;
					description?: string | null;
					display_order?: number | null;
					id?: string;
					image_url?: string | null;
					name: string;
					slug: string;
					tagline?: string | null;
				};
				Update: {
					created_at?: string | null;
					description?: string | null;
					display_order?: number | null;
					id?: string;
					image_url?: string | null;
					name?: string;
					slug?: string;
					tagline?: string | null;
				};
				Relationships: [];
			};
			discounts: {
				Row: {
					code: string;
					id: string;
					is_active: boolean | null;
					max_uses: number | null;
					min_order_paise: number | null;
					type: string;
					used_count: number | null;
					valid_until: string | null;
					value: number;
				};
				Insert: {
					code: string;
					id?: string;
					is_active?: boolean | null;
					max_uses?: number | null;
					min_order_paise?: number | null;
					type?: string;
					used_count?: number | null;
					valid_until?: string | null;
					value: number;
				};
				Update: {
					code?: string;
					id?: string;
					is_active?: boolean | null;
					max_uses?: number | null;
					min_order_paise?: number | null;
					type?: string;
					used_count?: number | null;
					valid_until?: string | null;
					value?: number;
				};
				Relationships: [];
			};
			newsletter_subscribers: {
				Row: {
					created_at: string | null;
					email: string;
					id: string;
				};
				Insert: {
					created_at?: string | null;
					email: string;
					id?: string;
				};
				Update: {
					created_at?: string | null;
					email?: string;
					id?: string;
				};
				Relationships: [];
			};
			orders: {
				Row: {
					created_at: string | null;
					guest_email: string | null;
					guest_name: string | null;
					guest_phone: string | null;
					id: string;
					items: Json;
					order_number: string;
					razorpay_order_id: string | null;
					razorpay_payment_id: string | null;
					shipping_address: Json;
					shipping_paise: number;
					status: string;
					subtotal_paise: number;
					total_paise: number;
					updated_at: string | null;
					user_id: string | null;
				};
				Insert: {
					created_at?: string | null;
					guest_email?: string | null;
					guest_name?: string | null;
					guest_phone?: string | null;
					id?: string;
					items?: Json;
					order_number: string;
					razorpay_order_id?: string | null;
					razorpay_payment_id?: string | null;
					shipping_address?: Json;
					shipping_paise?: number;
					status?: string;
					subtotal_paise?: number;
					total_paise?: number;
					updated_at?: string | null;
					user_id?: string | null;
				};
				Update: {
					created_at?: string | null;
					guest_email?: string | null;
					guest_name?: string | null;
					guest_phone?: string | null;
					id?: string;
					items?: Json;
					order_number?: string;
					razorpay_order_id?: string | null;
					razorpay_payment_id?: string | null;
					shipping_address?: Json;
					shipping_paise?: number;
					status?: string;
					subtotal_paise?: number;
					total_paise?: number;
					updated_at?: string | null;
					user_id?: string | null;
				};
				Relationships: [];
			};
			products: {
				Row: {
					care_instructions: string | null;
					category_id: string | null;
					colors: string[] | null;
					compare_at_price_paise: number | null;
					created_at: string | null;
					description: string;
					dimensions: string | null;
					id: string;
					images: Json | null;
					is_featured: boolean | null;
					is_new: boolean | null;
					materials: string | null;
					price_paise: number;
					slug: string;
					stock: number;
					tags: string[] | null;
					title: string;
					updated_at: string | null;
				};
				Insert: {
					care_instructions?: string | null;
					category_id?: string | null;
					colors?: string[] | null;
					compare_at_price_paise?: number | null;
					created_at?: string | null;
					description: string;
					dimensions?: string | null;
					id?: string;
					images?: Json | null;
					is_featured?: boolean | null;
					is_new?: boolean | null;
					materials?: string | null;
					price_paise: number;
					slug: string;
					stock?: number;
					tags?: string[] | null;
					title: string;
					updated_at?: string | null;
				};
				Update: {
					care_instructions?: string | null;
					category_id?: string | null;
					colors?: string[] | null;
					compare_at_price_paise?: number | null;
					created_at?: string | null;
					description?: string;
					dimensions?: string | null;
					id?: string;
					images?: Json | null;
					is_featured?: boolean | null;
					is_new?: boolean | null;
					materials?: string | null;
					price_paise?: number;
					slug?: string;
					stock?: number;
					tags?: string[] | null;
					title?: string;
					updated_at?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'products_category_id_fkey';
						columns: ['category_id'];
						isOneToOne: false;
						referencedRelation: 'categories';
						referencedColumns: ['id'];
					}
				];
			};
			profiles: {
				Row: {
					created_at: string | null;
					full_name: string;
					id: string;
					is_admin: boolean | null;
					phone: string;
					updated_at: string | null;
				};
				Insert: {
					created_at?: string | null;
					full_name: string;
					id: string;
					is_admin?: boolean | null;
					phone: string;
					updated_at?: string | null;
				};
				Update: {
					created_at?: string | null;
					full_name?: string;
					id?: string;
					is_admin?: boolean | null;
					phone?: string;
					updated_at?: string | null;
				};
				Relationships: [];
			};
			wishlists: {
				Row: {
					created_at: string;
					id: string;
					product_id: string;
					user_id: string;
				};
				Insert: {
					created_at?: string;
					id?: string;
					product_id: string;
					user_id: string;
				};
				Update: {
					created_at?: string;
					id?: string;
					product_id?: string;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'wishlists_product_id_fkey';
						columns: ['product_id'];
						isOneToOne: false;
						referencedRelation: 'products';
						referencedColumns: ['id'];
					}
				];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			check_email_exists: { Args: { check_email: string }; Returns: boolean };
			generate_order_number: { Args: never; Returns: string };
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
				DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
		: never = never
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
			DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
		? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema['Tables']
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
		: never = never
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
		? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema['Tables']
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
		: never = never
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
		? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	DefaultSchemaEnumNameOrOptions extends
		| keyof DefaultSchema['Enums']
		| { schema: keyof DatabaseWithoutInternals },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
		: never = never
> = DefaultSchemaEnumNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
		? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
		: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema['CompositeTypes']
		| { schema: keyof DatabaseWithoutInternals },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
		: never = never
> = PublicCompositeTypeNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
		? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
		: never;

export const Constants = {
	public: {
		Enums: {}
	}
} as const;
