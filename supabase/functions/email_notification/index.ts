import { createClient } from 'supabase';
import { Resend } from 'resend';
import { renderAsync } from 'react-email';
import { NotificationEmail } from './_templates/notification-email.tsx';
import React from 'react';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const resend = new Resend(RESEND_API_KEY);

const getEmailBody = async ({ link, name, title, body }: { link: string; name: string; title: string; body: string }) => {
	const html = await renderAsync(React.createElement(NotificationEmail, { link, name, title, body }));

	return html;
};

const SendEmail = async ({ payload, nameAndEmails }: { payload: WebhookPayload; nameAndEmails: { email: string; first_name: string }[] }) => {
	for (const contact of nameAndEmails) {
		const html = await getEmailBody({ link: payload.record.link, name: contact.first_name, title: payload.record.title, body: payload.record.body });

		const { error } = await resend.emails.send({
			from: 'Aveer.hr <support@notification.aveer.hr>',
			to: contact.email,
			subject: payload.record.title,
			html
		});

		if (error) {
			console.log('error', error);
		}
	}

	return;
};

interface Notification {
	id: string;
	title: string;
	org: string;
	for: 'admin' | 'employee';
	link: string;
	body: string;
	contracts: number[];
}

interface WebhookPayload {
	type: 'INSERT';
	table: string;
	record: Notification;
	schema: 'public';
}

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

const getEmails = async ({ payload }: { payload: WebhookPayload }) => {
	if (payload.record.for === 'admin') {
		const { data } = await supabase.from('profiles_roles').select('profile(email, first_name)').match({ organisation: payload.record.org });
		const details: { email: string; first_name: string }[] = data!.map(d => ({ email: (d.profile as unknown as { email: string })!.email, first_name: (d.profile as unknown as { first_name: string })!.first_name }));
		return details;
	}

	if (payload.record.contracts.length > 0) {
		const { data } = await supabase.from('contracts').select('profile:profiles!contracts_profile_fkey(email, first_name)').eq('org', payload.record.org).in('id', payload.record.contracts);
		const details: { email: string; first_name: string }[] = data!.map(d => ({ email: (d.profile as unknown as { email: string })!.email, first_name: (d.profile as unknown as { first_name: string })!.first_name }));
		return details;
	}

	const { data } = await supabase.from('contracts').select('profile:profiles!contracts_profile_fkey(email, first_name)').match({ org: payload.record.org, status: 'signed' });

	const details: { email: string; first_name: string }[] = data!.map(d => ({ email: (d.profile as unknown as { email: string })!.email, first_name: (d.profile as unknown as { first_name: string })!.first_name }));

	return details;
};

const handler = async (request: Request): Promise<Response> => {
	const payload: WebhookPayload = await request.json();

	const namesAndEmails = await getEmails({ payload });
	await SendEmail({ payload, nameAndEmails: namesAndEmails });

	return new Response('Ok', {
		status: 200,
		headers: {
			'Content-Type': 'application/json'
		}
	});
};

Deno.serve(handler);
