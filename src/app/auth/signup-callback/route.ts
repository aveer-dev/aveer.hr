import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
	const { searchParams, origin } = new URL(request.url);
	const code = searchParams.get('code');

	if (code) {
		const supabase = await createClient();
		const { error, data } = await supabase.auth.exchangeCodeForSession(code);
		if (!error) {
			const {
				session: { provider_refresh_token, provider_token },
				user: {
					app_metadata: { provider }
				}
			} = data;
			await supabase.from('third_party_tokens').insert({ platform: provider as any, refresh_token: provider_refresh_token, token: provider_token as string });

			const forwardedHost = request.headers.get('x-forwarded-host'); // original origin before load balancer
			const isLocalEnv = process.env.NODE_ENV === 'development';
			if (isLocalEnv) {
				// we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
				return NextResponse.redirect(`${origin}/create-org`);
			} else if (forwardedHost) {
				return NextResponse.redirect(`https://${forwardedHost}/create-org`);
			} else {
				return NextResponse.redirect(`${origin}/create-org`);
			}
		}
	}

	// return the user to an error page with instructions
	return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
