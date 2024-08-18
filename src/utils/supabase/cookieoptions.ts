import { CookieOptions } from '@supabase/ssr';

export const cookieOptions: CookieOptions = {
	domain: `.${process.env.NEXT_PUBLIC_DOMAIN}`,
	sameSite: 'Lax',
	secure: true
};
