import { OAuth2Client } from 'google-auth-library';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ org: string }> }) {
	const code = request.nextUrl.searchParams.get('code') as string;
	const origin = request.nextUrl.origin;
	const state = request.nextUrl.searchParams.get('state') as string;
	console.log('🚀 ~ GET ~ code:', code);

	const oAuth2Client = new OAuth2Client(process.env.SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID, process.env.SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET, `${process.env.NEXT_PUBLIC_URL}/auth/google`);

	const r = await oAuth2Client.getToken(code);
	console.log('🚀 ~ GET ~ r:', r.tokens);
	// Make sure to set the credentials on the OAuth2 client.
	oAuth2Client.setCredentials(r.tokens);

	// const forwardedHost = request.headers.get('x-forwarded-host'); // original origin before load balancer
	// const isLocalEnv = process.env.NODE_ENV === 'development';
	// if (isLocalEnv) {
	// 	// we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
	// 	return NextResponse.redirect(`${origin}${next}`);
	// } else if (forwardedHost) {
	// 	return NextResponse.redirect(`https://${forwardedHost}${next}`);
	// } else {
	// 	return NextResponse.redirect(`${origin}${next}`);
	// }

	// return NextResponse.json({ r });
	// console.log(`${origin}/${state}/calendar?gsetup=true`);

	return NextResponse.redirect(`${origin}/${state}/calendar?gsetup=true`);
}
