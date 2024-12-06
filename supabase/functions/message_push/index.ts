import { createClient } from 'supabase';
import { JWT } from 'google-auth';

const serviceAccount = {
	type: 'service_account',
	project_id: Deno.env.get('GOOGLE_PROJECT_ID'),
	private_key_id: Deno.env.get('GOOGLE_PRIVATE_KEY_ID'),
	private_key: (Deno.env.get('GOOGLE_PRIVATE_KEY') as string).replace(/\\n/g, '\n'),
	client_email: Deno.env.get('GOOGLE_CLIENT_EMAIL') as string,
	client_id: Deno.env.get('GOOGLE_CLIENT_ID'),
	auth_uri: 'https://accounts.google.com/o/oauth2/auth',
	token_uri: 'https://oauth2.googleapis.com/token',
	auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
	client_x509_cert_url: Deno.env.get('GOOGLE_CLIENT_URL'),
	universe_domain: 'googleapis.com'
};

interface Notification {
	id: string;
	title: string;
	org: string;
	draft: boolean;
}

interface WebhookPayload {
	type: 'INSERT';
	table: string;
	record: Notification;
	schema: 'public';
}

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

const sendNotification = async ({ accessToken, token, notification }: { accessToken: string; token: string; notification: { title: string; body: string } }) => {
	try {
		const res = await fetch(`https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`
			},
			body: JSON.stringify({
				message: { token, webpush: { notification } }
			})
		});

		await res.json();

		return;
	} catch (error) {
		throw error;
	}
};

const getAccessToken = ({ clientEmail, privateKey }: { clientEmail: string; privateKey: string }): Promise<string> => {
	return new Promise((resolve, reject) => {
		const jwtClient = new JWT({
			email: clientEmail,
			key: privateKey,
			scopes: ['https://www.googleapis.com/auth/firebase.messaging']
		});
		jwtClient.authorize((err, tokens) => {
			if (err) {
				reject(err);
				return;
			}
			resolve(tokens!.access_token!);
		});
	});
};

Deno.serve(async req => {
	const payload: WebhookPayload = await req.json();

	if (payload.record.draft) return new Response('ok', { status: 200 });

	const { data } = await supabase.from('contracts').select('profile:profiles!contracts_profile_fkey(fcm_token)').match({ org: payload.record.org, status: 'signed' });

	const fcmTokens = data!.map(d => (d.profile as unknown as { fcm_token: string[] })!.fcm_token.toString());

	const accessToken = await getAccessToken({
		clientEmail: serviceAccount.client_email,
		privateKey: serviceAccount.private_key
	});

	const notification = {
		title: 'New message from HR',
		body: payload.record.title,
		icon: 'https://api.aveer.hr/storage/v1/object/public/platform%20assets/logo/aveer-round.png'
	};

	for await (const token of fcmTokens) {
		await sendNotification({ accessToken, token, notification });
	}

	return new Response('ok', { status: 200 });
});
