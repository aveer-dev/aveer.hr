'use server';

import { OAuth2Client } from 'google-auth-library';
import { calendar_v3 } from '@googleapis/calendar';
import { createClient } from '@/utils/supabase/server';
import { Database, TablesInsert } from '@/type/database.types';
import { v4 as uuid } from 'uuid';

const calendarAPI = async (org?: string) => {
	const oAuth2Client = new OAuth2Client(process.env.AVEER_CALENDAR_GOOGLE_CLIENT_ID, process.env.AVEER_CALENDAR_GOOGLE_SECRET);
	const supabase = await createClient();

	const [tokens, organisation] = await Promise.all([supabase.from('platform_thirdparty_keys').select('token, refresh_token').match({ platform: 'google' }).single(), org ? supabase.from('organisations').select('name').match({ subdomain: org }).single() : null]);

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
	const oAuth2Client = new OAuth2Client(process.env.AVEER_CALENDAR_GOOGLE_CLIENT_ID, process.env.AVEER_CALENDAR_GOOGLE_SECRET, `${process.env.NEXT_PUBLIC_URL}/auth/google`);
	const authorizeUrl = oAuth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/calendar'],
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
	} catch (error) {}
};

export const enableOrganisationCalendar = async (org: string) => {
	const supabase = await createClient();

	const { error } = await supabase.from('org_settings').update({ enable_calendar: true }).eq('org', org);
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

export const createGCalendarEvent = async ({ calendarId, payload }: { calendarId: string; payload: calendar_v3.Schema$Event }) => {
	try {
		const { gCalendar } = await calendarAPI();

		const response = gCalendar.events.insert({ calendarId, conferenceDataVersion: 1, requestBody: { ...payload, visibility: 'private', guestsCanInviteOthers: false } });

		return response;
	} catch (error) {
		throw error;
	}
};

export const createCalendarEvent = async ({ calendarId, payload, virtual }: { virtual?: boolean; org: string; calendarId: string; payload: TablesInsert<'calendar_events'> }) => {
	const supabase = await createClient();

	try {
		const gCalendarPayload: calendar_v3.Schema$Event = { summary: payload.summary, description: payload.description, recurrence: [payload.recurrence as string], attendees: payload.attendees as any, start: payload.start as any, end: payload.end as any };
		if (virtual) gCalendarPayload.conferenceData = { createRequest: { requestId: uuid(), conferenceSolutionKey: { type: 'hangoutsMeet' } } };

		const event = await createGCalendarEvent({ calendarId, payload: gCalendarPayload });
		if (!event.data.id) return 'Unable to create calendar event';

		const { error } = await supabase.from('calendar_events').insert({ ...payload, event_id: event.data.id, time_zone: (payload.end as any).timeZone });
		if (error) throw error;

		return true;
	} catch (error) {
		throw error;
	}
};
