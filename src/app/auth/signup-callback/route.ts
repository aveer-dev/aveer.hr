import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { TablesInsert } from '@/type/database.types';

export async function GET(request: Request) {
	const { searchParams, origin } = new URL(request.url);
	const code = searchParams.get('code');

	if (code) {
		const supabase = await createClient();
		const { error, data } = await supabase.auth.exchangeCodeForSession(code);
		if (!error) {
			const {
				session: { provider_refresh_token, provider_token },
				user: { id: profile }
			} = data;
			const tokenData: TablesInsert<'third_party_tokens'> = { platform: 'google', refresh_token: provider_refresh_token, token: provider_token as string };
			const { data: tokens } = await supabase.from('third_party_tokens').select('id').match({ platform: 'google', profile }).single();
			if (data) tokenData.id = tokens?.id;
			await supabase.from('third_party_tokens').upsert(tokenData, { ignoreDuplicates: false });

			const forwardedHost = request.headers.get('x-forwarded-host'); // original origin before load balancer
			const isLocalEnv = process.env.NODE_ENV === 'development';
			if (isLocalEnv) {
				// we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
				return NextResponse.redirect(`${origin}/app/create-org`);
			} else if (forwardedHost) {
				return NextResponse.redirect(`https://${forwardedHost}/app/create-org`);
			} else {
				return NextResponse.redirect(`${origin}/app/create-org`);
			}
		}
	}

	// return the user to an error page with instructions
	return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
