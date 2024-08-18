import { createBrowserClient } from '@supabase/ssr';
import { Database } from '../../type/database.types';
import { cookieOptions } from './cookieoptions';

export function createClient() {
	// Create a supabase client on the browser with project's credentials
	return createBrowserClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
		cookieOptions: process.env.NEXT_PUBLIC_ENABLE_SUBDOOMAIN == 'true' ? cookieOptions : {}
	});
}
