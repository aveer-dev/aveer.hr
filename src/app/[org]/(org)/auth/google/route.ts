import { createClient } from '@/utils/supabase/server';
import { OAuth2Client } from 'google-auth-library';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ org: string }> }) {
	const supabase = await createClient();

	const code = request.nextUrl.searchParams.get('code') as string;
	const origin = request.nextUrl.origin;
	const state = request.nextUrl.searchParams.get('state') as string;

	console.log(process.env.SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID, process.env.SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET);

	const oAuth2Client = new OAuth2Client(process.env.SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID, process.env.SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET, `${process.env.NEXT_PUBLIC_URL}/app/auth/google`);

	const response = await oAuth2Client.getToken(code);

	if (!response || !response.tokens || !response.tokens.refresh_token || !response.tokens.access_token) return NextResponse.redirect(`${origin}/${state}/calendar?state=error`);

	const { error } = await supabase.from('calendar_platform_tokens').upsert({ refresh_token: response.tokens.refresh_token, token: response.tokens.access_token, org: state, platform: 'google' }, { onConflict: 'org' });

	if (error) return NextResponse.redirect(`${origin}/${state}/calendar?state=error`);

	oAuth2Client.setCredentials(response.tokens);

	return NextResponse.redirect(`${origin}/${state}/calendar?state=success`);
}
