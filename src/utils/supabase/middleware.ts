import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { cookieOptions } from './cookieoptions';

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
	if (!user.data.user && !request.nextUrl.pathname.includes('login') && !request.nextUrl.pathname.includes('signup') && !request.nextUrl.pathname.includes('auth') && !request.nextUrl.pathname.includes('password') && !request.nextUrl.pathname.includes('job')) {
		return NextResponse.redirect(new URL(`${process.env.NEXT_PUBLIC_URL}/login`, request.url));
	}

	// start ----- handleSubdomainMapping(request);
	const url = request.nextUrl;

	// get the domain string
	let hostname = request.headers.get('host');
	const domain = decodeURIComponent(hostname as string);

	// if on localhost or user disable/unset subdomain, cancel mapping
	if (domain?.includes('localhost') || process.env.NEXT_PUBLIC_ENABLE_SUBDOOMAIN == 'false' || !process.env.NEXT_PUBLIC_ENABLE_SUBDOOMAIN) return;

	// get subdomain and path url for remaping other routes
	const subdomain = domain.endsWith(`.${process.env.NEXT_PUBLIC_DOMAIN}`) ? domain.replace(`.${process.env.NEXT_PUBLIC_DOMAIN}`, '') : null;
	const searchParams = request.nextUrl.searchParams.toString();
	const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ''}`;

	if (subdomain && path.includes('firebase-messaging-sw')) return NextResponse.rewrite(new URL(`/firebase-messaging-sw.js`, request.url));

	// if user nevigates to employee page, redirect to employee subdomain
	if (url.pathname.includes('/employee')) {
		const searchParams = request.nextUrl.searchParams.toString();
		const path = `${url.pathname.split('/employee')[1]}${searchParams.length > 0 ? `?${searchParams}` : ''}`;
		return NextResponse.redirect(`${url.protocol}//employee.${process.env.NEXT_PUBLIC_DOMAIN}${path}`);
	}

	if (subdomain && subdomain !== 'app' && (path.includes('login') || path.includes('signup') || path.includes('password'))) return NextResponse.redirect(new URL(`${process.env.NEXT_PUBLIC_URL}/login`, request.url));

	// for employee subdomains, rewrite to employee pages
	if (subdomain && subdomain === 'employee') return NextResponse.rewrite(new URL(`/employee${path}`, request.url));

	// for other pages, rewrite to org pages
	if (subdomain && subdomain !== 'employee' && subdomain !== 'app') {
		if (path.split('/')[1] == subdomain) return NextResponse.rewrite(new URL(`${path}`, request.url));
		return NextResponse.rewrite(new URL(`/${subdomain}${path}`, request.url));
	}

	return supabaseResponse;
}
