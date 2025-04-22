import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { cookieOptions } from './cookieoptions';

/**
 * List of public paths that don't require authentication
 */
const PUBLIC_PATHS = ['/', '/privacy-policy', 'login', 'signup', 'auth', 'password', 'job', 'shared-doc'] as const;

/**
 * Checks if a path is public and doesn't require authentication
 * @param pathname - The path to check
 * @returns boolean indicating if the path is public
 */
const isPublicPath = (pathname: string): boolean => {
	return PUBLIC_PATHS.some(path => pathname.includes(path));
};

/**
 * Creates a Supabase client with cookie handling
 * @param request - The incoming request
 * @param response - The response to modify
 * @returns Supabase client instance
 */
const createSupabaseClient = (request: NextRequest, response: NextResponse) => {
	return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
		cookies: {
			getAll: () => request.cookies.getAll(),
			setAll: cookiesToSet => {
				cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
				cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
			}
		},
		cookieOptions: process.env.NEXT_PUBLIC_ENABLE_SUBDOOMAIN === 'true' ? cookieOptions : {}
	});
};

/**
 * Handles subdomain routing and redirects
 * @param request - The incoming request
 * @param domain - The current domain
 * @param path - The current path
 * @returns NextResponse for subdomain handling or null if no subdomain handling needed
 */
const handleSubdomainRouting = (request: NextRequest, domain: string, path: string): NextResponse | null => {
	const subdomain = domain.endsWith(`.${process.env.NEXT_PUBLIC_DOMAIN}`) ? domain.replace(`.${process.env.NEXT_PUBLIC_DOMAIN}`, '') : null;

	// Skip subdomain handling for localhost or if disabled
	if (domain?.includes('localhost') || process.env.NEXT_PUBLIC_ENABLE_SUBDOOMAIN !== 'true') {
		return null;
	}

	// Handle Firebase service worker
	if (subdomain && path.includes('firebase-messaging-sw')) {
		return NextResponse.rewrite(new URL('/firebase-messaging-sw.js', request.url));
	}

	// If we're already on the employee subdomain, just rewrite the path
	if (subdomain === 'employee') {
		return NextResponse.rewrite(new URL(path, request.url));
	}

	// If we're already on the app subdomain, just rewrite the path
	if (subdomain === 'app') {
		return NextResponse.rewrite(new URL(path, request.url));
	}

	// Handle employee subdomain redirects
	if (request.nextUrl.pathname.includes('/employee')) {
		const employeePath = request.nextUrl.pathname.split('/employee')[1];
		const baseUrl = `${request.nextUrl.protocol}//employee.${process.env.NEXT_PUBLIC_DOMAIN}`;
		const redirectUrl = new URL(employeePath.startsWith('/') ? employeePath : `/${employeePath}`, baseUrl);
		if (request.nextUrl.searchParams.toString()) {
			redirectUrl.search = request.nextUrl.searchParams.toString();
		}
		return NextResponse.redirect(redirectUrl);
	}

	// Handle app subdomain redirects
	if (request.nextUrl.pathname.includes('/app')) {
		const appPath = request.nextUrl.pathname.split('/app')[1];
		const baseUrl = `${request.nextUrl.protocol}//app.${process.env.NEXT_PUBLIC_DOMAIN}`;
		const redirectUrl = new URL(appPath.startsWith('/') ? appPath : `/${appPath}`, baseUrl);
		if (request.nextUrl.searchParams.toString()) {
			redirectUrl.search = request.nextUrl.searchParams.toString();
		}
		return NextResponse.redirect(redirectUrl);
	}

	// Redirect auth pages to app subdomain
	if (subdomain && subdomain !== 'app' && (path.includes('login') || path.includes('signup') || path.includes('password'))) {
		return NextResponse.redirect(new URL(`${process.env.NEXT_PUBLIC_URL}/app/login`, request.url));
	}

	// Handle organization subdomain rewrites
	if (subdomain && subdomain !== 'employee' && subdomain !== 'app') {
		return NextResponse.rewrite(new URL(path, request.url));
	}

	return null;
};

/**
 * Middleware function to handle authentication, session management, and subdomain routing
 * @param request - The incoming request
 * @returns NextResponse with appropriate redirects or rewrites
 */
export async function updateSession(request: NextRequest) {
	// Security check for CVE-2025-29927
	const middlewareSubrequest = request.headers.get('x-middleware-subrequest');
	if (middlewareSubrequest && !middlewareSubrequest.startsWith('_next/')) {
		return new NextResponse('Unauthorized', { status: 401 });
	}

	const response = NextResponse.next({ request });
	const supabase = createSupabaseClient(request, response);

	// Refresh auth token
	const {
		data: { user }
	} = await supabase.auth.getUser();
	const domain = decodeURIComponent(request.headers.get('host') || '');
	const path = `${request.nextUrl.pathname}${request.nextUrl.searchParams.toString() ? `?${request.nextUrl.searchParams.toString()}` : ''}`;

	// Handle authentication
	if (!user && !isPublicPath(request.nextUrl.pathname)) {
		return NextResponse.redirect(new URL(`${process.env.NEXT_PUBLIC_URL}${domain?.includes('localhost') ? '/app' : ''}/login`, request.url));
	}

	// Handle subdomain routing
	const subdomainResponse = handleSubdomainRouting(request, domain, path);
	if (subdomainResponse) {
		return subdomainResponse;
	}

	return response;
}
