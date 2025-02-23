import React from 'react';
import { renderAsync } from 'react-email';
import { Resend } from 'resend';
import { EventEmail } from '../_templates/event-email.tsx';
import { Person, CalendarEvent, OrgDetails } from './types.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const resend = new Resend(RESEND_API_KEY);

// Email generation function
async function getEmailBody({ orgDetails, person, event }: { orgDetails: OrgDetails; person: Person; event: CalendarEvent }): Promise<string> {
	return await renderAsync(React.createElement(EventEmail, { orgDetails, person, event }));
}

export async function sendEmailAndGetId(person: Person, event: CalendarEvent, orgDetails: OrgDetails, scheduledAt: Date, type: 'job' | 'function' = 'function'): Promise<{ id: string } | null> {
	// Skip if email already scheduled
	if (type == 'job' && person.email_id) {
		return null;
	}

	try {
		const html = await getEmailBody({ event, person, orgDetails });

		const { data, error } = await resend.emails.send({
			from: `${orgDetails.name} on Aveer.hr <support@notification.aveer.hr>`,
			to: person.profile.email,
			subject: `New event on aveer.hr | ${event.summary}`,
			scheduledAt,
			html
		});

		if (error) {
			console.error(`Error sending email to ${person.profile.email}:`, error);
			return null;
		}

		return data;
	} catch (error) {
		console.error(`Exception sending email to ${person.profile.email}:`, error);
		return null;
	}
}
