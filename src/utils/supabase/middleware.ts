import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { cookieOptions } from './cookieoptions';

const handleSubdomainMapping = (request: NextRequest) => {
	const url = request.nextUrl;

	// get the domain string
	let hostname = request.headers.get('host');
	const domain = decodeURIComponent(hostname as string);

	// if on localhost or user disable/unset subdomain, cancel mapping
	if (domain?.includes('localhost') || process.env.NEXT_PUBLIC_ENABLE_SUBDOOMAIN == 'false' || !process.env.NEXT_PUBLIC_ENABLE_SUBDOOMAIN) return;

	// if user nevigates to contractor page, redirect to contractor subdomain
	if (url.pathname.includes('/contractor')) {
		const searchParams = request.nextUrl.searchParams.toString();
		const path = `${url.pathname.split('/contractor')[1]}${searchParams.length > 0 ? `?${searchParams}` : ''}`;
		return NextResponse.redirect(`${url.protocol}//contractor.${process.env.NEXT_PUBLIC_DOMAIN}${path}`);
	}

	// get subdomain and path url for remaping other routes
	const subdomain = domain.endsWith(`.${process.env.NEXT_PUBLIC_DOMAIN}`) ? domain.replace(`.${process.env.NEXT_PUBLIC_DOMAIN}`, '') : null;
	const searchParams = request.nextUrl.searchParams.toString();
	const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ''}`;

	// for contractor subdomains, rewrite to contractor pages
	if (subdomain && subdomain === 'contractor') NextResponse.rewrite(new URL(`/contractor${path}`, request.url));
	// for other pages, rewrite to org pages
	if (subdomain && subdomain !== 'contractor' && subdomain !== 'app') NextResponse.rewrite(new URL(`/${subdomain}${path}`, request.url));
};

export async function updateSession(request: NextRequest) {
	let supabaseResponse = NextResponse.next({
		request
	});

	const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
		cookies: {
			getAll() {
				return request.cookies.getAll();
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
				supabaseResponse = NextResponse.next({
					request
				});
				cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
			}
		},
		cookieOptions: process.env.NEXT_PUBLIC_ENABLE_SUBDOOMAIN == 'true' ? cookieOptions : {}
	});

	// refreshing the auth token
	const user = await supabase.auth.getUser();

	// validate access, logout if needed
	if (!user.data.user && !request.nextUrl.pathname.includes('login') && !request.nextUrl.pathname.includes('signup') && !request.nextUrl.pathname.includes('password')) {
		return NextResponse.redirect(new URL('/login', request.url));
	}

	handleSubdomainMapping(request);

	return supabaseResponse;
}
