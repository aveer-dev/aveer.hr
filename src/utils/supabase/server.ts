import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient as AdminClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { Database } from '@/type/database.types';

export function createClient() {
	const cookieStore = cookies();

	return createServerClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
		cookies: {
			getAll() {
				return cookieStore.getAll();
			},
			setAll(cookiesToSet) {
				try {
					cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
				} catch {
					// The `setAll` method was called from a Server Component.
					// This can be ignored if you have middleware refreshing
					// user sessions.
				}
			}
		}
	});
}

export function createClientAdminServer() {
	return AdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_SUPABASE_SERVICE_ROLE!, {
		auth: {
			autoRefreshToken: false,
			persistSession: false
		}
	});
}
