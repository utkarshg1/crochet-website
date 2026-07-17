import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/database.types';

type AdminCheckResult = { ok: true } | { ok: false; status: number; error: string };

export async function requireAdmin(
	supabase: SupabaseClient<Database>,
	user: { id: string }
): Promise<AdminCheckResult> {
	const { data: profile, error } = await supabase
		.from('profiles')
		.select('is_admin')
		.eq('id', user.id)
		.single();

	if (error || !profile?.is_admin) {
		return { ok: false, status: 403, error: 'Forbidden' };
	}
	return { ok: true };
}
