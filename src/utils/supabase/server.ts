import { createServerClient } from '@supabase/ssr';
import { createClient as AdminClient } from '@supabase/supabase-js';
import { cookies, type UnsafeUnwrappedCookies } from 'next/headers';
import { Database } from '@/type/database.types';
import { cookieOptions } from './cookieoptions';

export async function createClient() {
	const cookieStore = await cookies();

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
		},
		cookieOptions: process.env.NEXT_PUBLIC_ENABLE_SUBDOOMAIN == 'true' ? cookieOptions : {}
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
