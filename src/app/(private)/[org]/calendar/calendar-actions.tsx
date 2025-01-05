'use server';

import { OAuth2Client } from 'google-auth-library';
import { calendar_v3 } from '@googleapis/calendar';
import { createClient } from '@/utils/supabase/server';

export const getAuthLink = async (org: string) => {
	const oAuth2Client = new OAuth2Client(process.env.SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID, process.env.SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET, `${process.env.NEXT_PUBLIC_URL}/auth/google`);
	const authorizeUrl = oAuth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/calendar'],
		state: org
	});

	return authorizeUrl;
};

export const createOrgCalendar = async (org: string) => {
	const oAuth2Client = new OAuth2Client(process.env.SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID, process.env.SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET);
	const supabase = await createClient();

	const [tokens, organisation] = await Promise.all([supabase.from('platform_thirdparty_keys').select('token, refresh_token').match({ platform: 'google' }).single(), supabase.from('organisations').select('name').match({ subdomain: org }).single()]);

	if (organisation.error) throw organisation.error;
	if (tokens.error) throw tokens.error;

	oAuth2Client.setCredentials({
		access_token: tokens.data?.token,
		refresh_token: tokens.data?.refresh_token
	});

	const gCalendar = new calendar_v3.Calendar({ auth: oAuth2Client });

	const calendar = await gCalendar.calendars.insert({
		requestBody: {
			summary: `${organisation.data?.name} Calendar`,
			description: `Calendar for the entire ${organisation.data?.name} organisation, managed by Aveer.hr`
		}
	});
	if (!calendar.data.id) throw { calendar };

	const { error } = await supabase.from('calendars').insert({ org, calendar_id: calendar.data.id as string, platform: 'google' });
	if (error) throw error;

	return JSON.stringify(calendar);
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
