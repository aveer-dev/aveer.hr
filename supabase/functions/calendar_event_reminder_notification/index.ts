import { createClient } from 'supabase';
import { subMinutes, isWithinInterval, addHours } from 'npm:date-fns';
import { sendEmailAndGetId, sendNewEventNotification } from '../_utils/send-emails.ts';
import { Person, CalendarEvent, AttendeeGroup, OrgDetails, WebhookPayload } from '../_utils/types.ts';

// Initialize clients
const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

// Function to process all attendees and send/update emails
async function processAttendees(event: CalendarEvent, orgDetails: OrgDetails, reminderTime: Date): Promise<AttendeeGroup[]> {
	const { data: existingEventData } = await supabase.from('calendar_events').select('attendees').eq('id', event.id).single();

	const existingEmailIds = new Set<string>();
	if (existingEventData) {
		existingEventData.attendees.forEach(group => {
			if (group.single?.email_id) existingEmailIds.add(group.single.email_id);
			group.team?.people?.forEach(person => person.email_id && existingEmailIds.add(person.email_id));
			group.all?.forEach(person => person.email_id && existingEmailIds.add(person.email_id));
		});
	}

	const updatedAttendees = [...event.attendees];

	for (const attendeeGroup of updatedAttendees) {
		if (attendeeGroup.single && !existingEmailIds.has(attendeeGroup.single.email_id || '')) {
			const emailData = await sendEmailAndGetId(attendeeGroup.single, event, orgDetails, reminderTime);
			if (emailData) {
				attendeeGroup.single.email_id = emailData.id;
			}
		}

		if (attendeeGroup.team?.people?.length) {
			for (const person of attendeeGroup.team.people) {
				if (!existingEmailIds.has(person.email_id || '')) {
					const emailData = await sendEmailAndGetId(person, event, orgDetails, reminderTime);
					if (emailData) {
						person.email_id = emailData.id;
					}
				}
			}
		}

		if (attendeeGroup.all?.length) {
			for (const person of attendeeGroup.all) {
				if (!existingEmailIds.has(person.email_id || '')) {
					const emailData = await sendEmailAndGetId(person, event, orgDetails, reminderTime);
					if (emailData) {
						person.email_id = emailData.id;
					}
				}
			}
		}
	}

	return updatedAttendees;
}

// Function to send immediate notifications to all attendees about a new event
async function notifyAllAttendees(event: CalendarEvent, orgDetails: OrgDetails): Promise<void> {
	const attendees = event.attendees || [];
	const notificationPromises: Promise<any>[] = [];

	for (const attendeeGroup of attendees) {
		// Process single attendee
		if (attendeeGroup.single) {
			notificationPromises.push(sendNewEventNotification(attendeeGroup.single, event, orgDetails));
		}

		// Process team attendees
		if (attendeeGroup.team?.people?.length) {
			for (const person of attendeeGroup.team.people) {
				notificationPromises.push(sendNewEventNotification(person, event, orgDetails));
			}
		}

		// Process all attendees
		if (attendeeGroup.all?.length) {
			for (const person of attendeeGroup.all) {
				notificationPromises.push(sendNewEventNotification(person, event, orgDetails));
			}
		}
	}

	// Send all notifications in parallel
	await Promise.allSettled(notificationPromises);
}

// Function to handle event updates
async function handleEventUpdate(oldEvent: CalendarEvent, newEvent: CalendarEvent, orgDetails: OrgDetails): Promise<void> {
	const oldStartTime = new Date(oldEvent.start.dateTime);
	const newStartTime = new Date(newEvent.start.dateTime);
	const now = new Date();
	const twentyFourHoursLater = addHours(now, 24);

	// If start time changed, update all reminder times
	if (oldStartTime.getTime() !== newStartTime.getTime()) {
		for (const reminder of newEvent.reminders) {
			const reminderTime = subMinutes(newStartTime, reminder.minutes);
			if (isWithinInterval(reminderTime, { start: now, end: twentyFourHoursLater })) {
				const updatedAttendees = await processAttendees(newEvent, orgDetails, reminderTime);
				await supabase.from('calendar_events').update({ attendees: updatedAttendees }).eq('id', newEvent.id);
			}
		}
	}

	// Handle attendee changes
	const existingEmailIds = new Set(oldEvent.attendees.flatMap(group => [group.single?.email_id, ...(group.team?.people?.map(p => p.email_id) || []), ...(group.all?.map(p => p.email_id) || [])]).filter(Boolean));

	// Process new attendees
	for (const reminder of newEvent.reminders) {
		const reminderTime = subMinutes(newStartTime, reminder.minutes);
		if (isWithinInterval(reminderTime, { start: now, end: twentyFourHoursLater })) {
			const updatedAttendees = await processAttendees(newEvent, orgDetails, reminderTime, existingEmailIds);
			await supabase.from('calendar_events').update({ attendees: updatedAttendees }).eq('id', newEvent.id);
		}
	}
}

// Main webhook handler
const handler = async (request: Request): Promise<Response> => {
	try {
		const payload: WebhookPayload = await request.json();
		const { record: event, type, old_record } = payload;

		if (!event.attendees?.length) {
			return new Response('No attendees to process', { status: 200 });
		}

		if (!event.start || !event.reminders) {
			return new Response('Missing start date or reminders', { status: 400 });
		}

		const { data: orgDetails } = await supabase.from('organisations').select('subdomain, name').eq('subdomain', event.org).single();

		if (!orgDetails) {
			return new Response('Organisation not found', { status: 404 });
		}

		const now = new Date();
		const twentyFourHoursLater = addHours(now, 24);

		if (type === 'UPDATE' && old_record) {
			await handleEventUpdate(old_record, event, orgDetails);
		} else if (type === 'INSERT') {
			// Send immediate notifications about the new event
			await notifyAllAttendees(event, orgDetails);

			// Process reminders for the new event
			for (const reminder of event.reminders) {
				const reminderTime = subMinutes(new Date(event.start.dateTime), reminder.minutes);
				if (isWithinInterval(reminderTime, { start: now, end: twentyFourHoursLater })) {
					const updatedAttendees = await processAttendees(event, orgDetails, reminderTime);
					await supabase.from('calendar_events').update({ attendees: updatedAttendees }).eq('id', event.id);
				}
			}
		}

		return new Response('Processing complete', { status: 200 });
	} catch (error) {
		console.error('Webhook handler error:', error);
		return new Response('Internal server error', { status: 500 });
	}
};

Deno.serve(handler);
