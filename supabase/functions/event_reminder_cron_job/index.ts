// runs a cron job
// written with AI

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { sendEmailAndGetId } from '../_utils/send-email-get-Id.ts';
import { subMinutes, addHours, isWithinInterval } from 'npm:date-fns';
import { Person, CalendarEvent, AttendeeGroup, OrgDetails } from '../_utils/types.ts';

// Initialize clients
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const BATCH_SIZE = 50; // Configurable batch size for processing

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Function to fetch events in batches
async function* fetchEventsBatches(startTime: Date, endTime: Date) {
	let lastId = '';

	while (true) {
		const query = supabase.from('calendar_events').select('*').gte('start.dateTime', startTime.toISOString()).lte('start.dateTime', endTime.toISOString()).order('id', { ascending: true }).limit(BATCH_SIZE);

		if (lastId) {
			query.gt('id', lastId);
		}

		const { data: events, error } = await query;

		if (error) {
			console.error('Error fetching events batch:', error);
			break;
		}

		if (!events || events.length === 0) {
			break;
		}

		yield events;
		lastId = events[events.length - 1].id;
	}
}

// Cache for organization details
const orgCache = new Map<string, OrgDetails>();

// Function to get organization details with caching
async function getOrgDetails(subdomain: string): Promise<OrgDetails | null> {
	if (orgCache.has(subdomain)) {
		return orgCache.get(subdomain)!;
	}

	const { data, error } = await supabase.from('organisations').select('subdomain, name').eq('subdomain', subdomain).single();

	if (error || !data) {
		console.error('Error fetching org details:', error);
		return null;
	}

	orgCache.set(subdomain, data);
	return data;
}

// Process attendees and send emails
async function processAttendees(event: CalendarEvent, orgDetails: OrgDetails, reminderTime: Date): Promise<void> {
	const updatedAttendees = [...event.attendees];
	const updatePromises: Promise<any>[] = [];

	for (const attendeeGroup of updatedAttendees) {
		// Process single attendee
		if (attendeeGroup.single && !attendeeGroup.single.email_id) {
			const emailData = await sendEmailAndGetId(attendeeGroup.single, event, orgDetails, reminderTime, 'job');
			if (emailData) {
				attendeeGroup.single.email_id = emailData.id;
				updatePromises.push(supabase.from('calendar_events').update({ attendees: updatedAttendees }).eq('id', event.id));
			}
		}

		// Process team attendees in parallel
		if (attendeeGroup.team?.people?.length) {
			const emailPromises = attendeeGroup.team.people.filter(person => !person.email_id).map(person => sendEmailAndGetId(person, event, orgDetails, reminderTime, 'job'));

			const emailResults = await Promise.all(emailPromises);

			emailResults.forEach((emailData, index) => {
				if (emailData) {
					attendeeGroup.team!.people[index].email_id = emailData.id;
				}
			});
		}

		// Process all attendees in parallel
		if (attendeeGroup.all?.length) {
			const emailPromises = attendeeGroup.all.filter(person => !person.email_id).map(person => sendEmailAndGetId(person, event, orgDetails, reminderTime, 'job'));

			const emailResults = await Promise.all(emailPromises);

			emailResults.forEach((emailData, index) => {
				if (emailData) {
					attendeeGroup.all![index].email_id = emailData.id;
				}
			});
		}
	}

	// Batch update the database
	if (updatePromises.length > 0) {
		await Promise.all(updatePromises);
	}
}

// Main cron handler
Deno.serve(async (req: Request) => {
	try {
		const now = new Date();
		const twentyFourHoursLater = addHours(now, 24);
		let processedEvents = 0;
		let errorCount = 0;

		// Process events in batches
		for await (const eventsBatch of fetchEventsBatches(now, twentyFourHoursLater)) {
			const processPromises = eventsBatch.map(async event => {
				try {
					const { start, reminders, attendees } = event;

					if (!start || !reminders || !attendees?.length) {
						return;
					}

					const orgDetails = await getOrgDetails(event.org);
					if (!orgDetails) {
						return;
					}

					const eventStartDateTime = new Date(start.dateTime);

					// Process reminders in parallel
					const reminderPromises = reminders.map(async reminder => {
						const reminderTime = subMinutes(eventStartDateTime, reminder.minutes);

						if (isWithinInterval(reminderTime, { start: now, end: twentyFourHoursLater })) {
							await processAttendees(event, orgDetails, reminderTime);
						}
					});

					await Promise.all(reminderPromises);
					processedEvents++;
				} catch (error) {
					console.error('Error processing event:', error);
					errorCount++;
				}
			});

			await Promise.all(processPromises);
		}

		return new Response(
			JSON.stringify({
				message: 'Calendar events processed',
				stats: {
					processedEvents,
					errorCount,
					timeRange: {
						start: now.toISOString(),
						end: twentyFourHoursLater.toISOString()
					}
				}
			}),
			{
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	} catch (error) {
		console.error('Cron job error:', error);
		return new Response(JSON.stringify({ error: 'Internal server error' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
});
