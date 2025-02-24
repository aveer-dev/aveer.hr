'use server';

import { OAuth2Client } from 'google-auth-library';
import { calendar_v3 } from '@googleapis/calendar';
import { createClient } from '@/utils/supabase/server';
import { Database, Json, Tables, TablesInsert, TablesUpdate } from '@/type/database.types';
import { v4 as uuid } from 'uuid';
import { ROLE } from '@/type/contract.types';

export type GaxiosPromise<T = any> = Promise<GaxiosResponse<T>>;
export interface GaxiosXMLHttpRequest {
	responseURL: string;
}
export interface GaxiosResponse<T = any> {
	config: any;
	data: T;
	status: number;
	statusText: string;
	headers: any;
	request: GaxiosXMLHttpRequest;
}

const calendarAPI = async (org?: string) => {
	const oAuth2Client = new OAuth2Client(process.env.SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID, process.env.SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET);
	const supabase = await createClient();

	const [tokens, organisation] = await Promise.all([supabase.from('calendar_platform_tokens').select('token, refresh_token').match({ platform: 'google', org }).single(), org ? supabase.from('organisations').select('name').match({ subdomain: org }).single() : null]);

	if (organisation && organisation.error) throw organisation.error;
	if (tokens.error) throw tokens.error;

	oAuth2Client.setCredentials({
		access_token: tokens.data?.token,
		refresh_token: tokens.data?.refresh_token
	});

	const gCalendar = new calendar_v3.Calendar({ auth: oAuth2Client });
	return { gCalendar, organisation };
};

export const getAuthLink = async (org: string) => {
	const oAuth2Client = new OAuth2Client(process.env.SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID, process.env.SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET, `${process.env.NEXT_PUBLIC_URL}/app/auth/google`);

	const authorizeUrl = oAuth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: [
			'https://www.googleapis.com/auth/userinfo.profile',
			'https://www.googleapis.com/auth/calendar.acls',
			'https://www.googleapis.com/auth/calendar.calendars',
			'https://www.googleapis.com/auth/calendar.events',
			'https://www.googleapis.com/auth/calendar.calendarlist.readonly'
		],
		state: org
	});

	return authorizeUrl;
};

export const createOrgCalendar = async (org: string) => {
	const supabase = await createClient();

	try {
		const { gCalendar, organisation } = await calendarAPI(org);

		const calendar = await gCalendar.calendars.insert({
			requestBody: {
				summary: `${organisation?.data?.name} Calendar`,
				description: `Calendar for the entire ${organisation?.data?.name} organisation, managed by Aveer.hr`
			}
		});

		if (!calendar.data.id) throw { calendar };

		const { error } = await supabase.from('calendars').insert({ org, calendar_id: calendar.data.id as string, platform: 'google' });
		if (error) throw error;

		return JSON.stringify(calendar);
	} catch (error) {
		throw error;
	}
};

export const enableOrganisationCalendar = async (org: string) => {
	const supabase = await createClient();

	const { error } = await supabase.from('org_settings').update({ enable_thirdparty_calendar: true }).eq('org', org);
	if (error) throw error;

	return true;
};

export const updateEmployeeCalendarEvents = async ({ org, events }: { org: string; events: string[] }) => {
	const supabase = await createClient();

	const { error } = await supabase.from('org_settings').update({ calendar_employee_events: events }).eq('org', org);
	if (error) throw error;

	return true;
};

export const addEmployeeToGCalendar = async ({ calendarId, org }: { calendarId: string; org: string }): Promise<calendar_v3.Schema$AclRule> => {
	try {
		const { gCalendar } = await calendarAPI(org);
		const supabase = await createClient();

		const {
			data: { user }
		} = await supabase.auth.getUser();

		const { data } = await gCalendar.acl.insert({ calendarId, sendNotifications: false, requestBody: { role: 'reader', scope: { type: 'user', value: user?.email } } });

		return data;
	} catch (error) {
		throw error;
	}
};

export const addEmployeesToGCalendar = async ({ calendarId, org }: { calendarId: string; org: string }) => {
	try {
		const { gCalendar } = await calendarAPI(org);
		const supabase = await createClient();

		const [{ data: employees, error }, { data: admins, error: adminsError }] = await Promise.all([
			supabase.from('contracts').select('profile:profiles!contracts_profile_fkey(email, first_name, last_name)').match({ org, status: 'signed' }),
			supabase.from('profiles_roles').select('profile(email, first_name, last_name)').match({ organisation: org, role: 'admin', disable: false })
		]);
		if (error) throw error;
		if (adminsError) throw adminsError;

		employees?.forEach(
			async employee => await gCalendar.acl.insert({ calendarId, sendNotifications: false, requestBody: { role: !!admins.find(admin => admin.profile.email == employee.profile?.email) ? 'owner' : 'reader', scope: { type: 'user', value: employee?.profile?.email } } })
		);

		return;
	} catch (error) {
		throw error;
	}
};

export const addEmployeeToCalendar = async (payload: TablesInsert<'contract_calendar_config'>) => {
	try {
		const aclRule = await addEmployeeToGCalendar({ calendarId: payload.calendar_id, org: payload.org });
		if (!aclRule || !aclRule.id) throw { aclRule };

		const supabase = await createClient();

		const {
			data: { user }
		} = await supabase.auth.getUser();

		const { error } = await supabase.from('contract_calendar_config').insert({ ...payload, platform_id: aclRule.id, profile: user?.id });
		if (error) throw error;

		return true;
	} catch (error) {
		throw error;
	}
};

export const removeEmployeeFromGCalendar = async ({ calendarId, ruleId }: { calendarId: string; ruleId: string }) => {
	try {
		const { gCalendar } = await calendarAPI();

		gCalendar.acl.delete({ calendarId, ruleId: ruleId });

		return true;
	} catch (error) {
		throw error;
	}
};

export const removeEmployeeFromCalendar = async ({ calendarId, platformId, org, platform }: { org: string; platform: Database['public']['Enums']['third_party_auth_platforms']; platformId: string; calendarId: string }) => {
	try {
		await removeEmployeeFromGCalendar({ calendarId, ruleId: platformId });
		const supabase = await createClient();

		const {
			data: { user }
		} = await supabase.auth.getUser();

		const { error } = await supabase.from('contract_calendar_config').delete().match({ org, platform, profile: user?.id });
		if (error) throw error;

		return true;
	} catch (error) {
		throw error;
	}
};

export const createGCalendarEvent = async ({ calendarId, payload, org }: { calendarId: string; payload: calendar_v3.Schema$Event; org: string }) => {
	try {
		const { gCalendar } = await calendarAPI(org);

		const response = await gCalendar.events.insert({ calendarId, conferenceDataVersion: 1, requestBody: { ...payload, visibility: 'private', guestsCanInviteOthers: false } });

		return response;
	} catch (error) {
		throw error;
	}
};

export const getGCalendars = async ({ org }: { org: string }) => {
	try {
		const { gCalendar } = await calendarAPI(org);
		const response = await gCalendar.calendarList.list({ minAccessRole: 'owner' });

		return response;
	} catch (error) {
		console.log('🚀 ~ getGCalendars ~ error:', error);
		// throw error;
	}
};

export const uploadGEventsToDB = async ({ org, calendar }: { org: string; calendar: calendar_v3.Schema$CalendarListEntry }) => {
	try {
		if (!calendar.id) return;

		const supabase = await createClient();
		const { error } = await supabase.from('calendars').insert({ org, calendar_id: calendar.id as string, platform: 'google' });
		if (error) throw error;

		const { gCalendar } = await calendarAPI(org);
		// todo: paginated events usecase, where calendar has more than the default number of events API can return, get nextPageToken and get remaining paginated data.
		const response = await gCalendar.events.list({ calendarId: calendar.id });

		if (!response || !response.data) throw 'Error fetching events from Google calendar';

		const insertPayload: TablesInsert<'calendar_events'>[] = (response.data.items as calendar_v3.Schema$Event[])?.map(event => ({
			description: event.description,
			summary: event.summary || 'No summary',
			start: event.start as Json,
			end: event.end as Json,
			recurrence: event.recurrence as any,
			org,
			event_id: event.id as string,
			location: event?.location,
			meeting_link: event?.hangoutLink,
			attendees: (event?.attendees || []) as Json,
			time_zone: event.end?.timeZone,
			calendar_id: calendar.id
		}));

		if (insertPayload.length) {
			const { error } = await supabase.from('calendar_events').upsert(insertPayload);
			if (error) throw error;
		}

		return 'success';
	} catch (error: any) {
		throw error?.message || error || 'An error occured';
	}
};

export const createCalendarEvent = async ({ calendar, payload, attendees, virtual, role }: { role: ROLE; attendees: { email: string }[]; virtual?: boolean; calendar?: Tables<'calendars'> | null; payload: TablesInsert<'calendar_events'> }) => {
	const supabase = await createClient();

	try {
		let event: GaxiosResponse<calendar_v3.Schema$Event> | null = null;

		if (role == 'admin' && calendar && calendar?.platform == 'google') {
			const gCalendarPayload: calendar_v3.Schema$Event = { summary: payload.summary, description: payload.description, location: payload.location, recurrence: [payload.recurrence as string], attendees, start: payload.start as any, end: payload.end as any };
			if (virtual) gCalendarPayload.conferenceData = { createRequest: { requestId: uuid(), conferenceSolutionKey: { type: 'hangoutsMeet' } } };

			event = await createGCalendarEvent({ calendarId: calendar.calendar_id, payload: gCalendarPayload, org: payload.org });
			if (!event.data.id) throw 'Unable to create calendar event';
		}

		const dbInsertData = { ...payload, time_zone: (payload.end as any).timeZone };

		if (event && event.data) {
			dbInsertData.event_id = event.data.id as string;
			dbInsertData.meeting_link = event.data?.hangoutLink;
		}

		const { error, data } = await supabase.from('calendar_events').insert(dbInsertData).select().single();
		if (error) throw error;

		return data;
	} catch (error) {
		throw error;
	}
};

export const updateGCalendarEvent = async ({ calendarId, payload, eventId }: { eventId: string; calendarId: string; payload: calendar_v3.Schema$Event }) => {
	try {
		const { gCalendar } = await calendarAPI();

		const response = await gCalendar.events.update({ calendarId, eventId, conferenceDataVersion: 1, requestBody: { ...payload, visibility: 'private', guestsCanInviteOthers: false } });

		return response;
	} catch (error) {
		throw error;
	}
};

export const updateCalendarEvent = async ({ role, calendar, payload, attendees, virtual, id }: { role: ROLE; id: number; attendees: { email: string }[]; virtual?: boolean; calendar?: TablesUpdate<'calendars'> | null; payload: TablesUpdate<'calendar_events'> }) => {
	const supabase = await createClient();

	try {
		let event: any | undefined = undefined;

		if (role == 'admin' && calendar && calendar?.platform == 'google') {
			const gCalendarPayload: calendar_v3.Schema$Event = { summary: payload.summary, description: payload.description, location: payload.location, recurrence: [payload.recurrence as string], attendees, start: payload.start as any, end: payload.end as any };
			if (virtual) gCalendarPayload.conferenceData = { createRequest: { requestId: uuid(), conferenceSolutionKey: { type: 'hangoutsMeet' } } };

			const event = await updateGCalendarEvent({ calendarId: calendar.calendar_id as string, payload: gCalendarPayload, eventId: payload.event_id! });
			if (!event.data.id) return 'Unable to update calendar event';
		}

		const dbUpdateData = { ...payload, time_zone: (payload.end as any).timeZone };
		if (event) dbUpdateData.meeting_link = event.data?.hangoutLink || null;

		const { error } = await supabase.from('calendar_events').update(dbUpdateData).match({ org: payload.org, id });
		if (error) throw error;

		return true;
	} catch (error) {
		throw error;
	}
};

export const deleteCalendarEvent = async ({ calendarId, eventId, id }: { id: number; eventId: string | null; calendarId: string }) => {
	const supabase = await createClient();

	try {
		if (calendarId && eventId) {
			const { gCalendar } = await calendarAPI();
			await gCalendar.events.delete({ calendarId, eventId });
		}

		const { error } = await supabase.from('calendar_events').delete().match({ id });
		if (error) throw error;

		return true;
	} catch (error) {
		throw error;
	}
};
