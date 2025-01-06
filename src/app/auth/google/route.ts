import { OAuth2Client } from 'google-auth-library';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ org: string }> }) {
	const code = request.nextUrl.searchParams.get('code') as string;
	const origin = request.nextUrl.origin;
	const state = request.nextUrl.searchParams.get('state') as string;

	const oAuth2Client = new OAuth2Client(process.env.AVEER_CALENDAR_GOOGLE_CLIENT_ID, process.env.AVEER_CALENDAR_GOOGLE_SECRET, `${process.env.NEXT_PUBLIC_URL}/auth/google`);

	const r = await oAuth2Client.getToken(code);
	console.log('🚀 ~ GET ~ r:', r.tokens);
	// Make sure to set the credentials on the OAuth2 client.
	oAuth2Client.setCredentials(r.tokens);

	return NextResponse.redirect(`${origin}/${state}/calendar`);
}
