import { createClient } from '@/utils/supabase/server';
import { FullCalendar } from '@/components/calendar/calendar';
import { Tables } from '@/type/database.types';
import { getEmployees, getTeams } from '@/utils/form-data-init';
import { getGCalendars } from '@/components/calendar/calendar-actions';
import { GCalendarSetupDialog } from './google-calendar-setup';

export const CalendarPageComponent = async ({ org, isCalendarState }: { org: string; isCalendarState: string }) => {
	const supabase = await createClient();

	const {
		data: { user }
	} = await supabase.auth.getUser();

	const [
		{ data: leaves, error: leaveError },
		{ data: reminders, error: reminderError },
		{ data: dobs, error: dobError },
		{ data: orgCalendarSettings, error: calendarError },
		{ data: calendars, error: calendarsError },
		{ data: calendarEvents, error: calendarEventsError },
		{ data: teams, error: teamsError }
	] = await Promise.all([
		supabase.from('time_off').select('*, profile:profiles!time_off_profile_fkey(first_name, last_name), hand_over(profile(first_name, last_name), job_title)').eq('org', org).neq('status', 'denied'),
		supabase.from('reminders').select('*, profile:profiles!reminders_profile_fkey(id, first_name, last_name)').match({ org, profile: user?.id }),
		supabase.from('contracts').select('*, profile:profiles!contracts_profile_fkey(first_name, date_of_birth, id, last_name, email)').match({ org }).or(`status.eq.signed, profile.eq.${user?.id}`),
		supabase.from('org_settings').select('enable_thirdparty_calendar, calendar_employee_events').eq('org', org).single(),
		supabase.from('calendars').select().match({ org, platform: 'google' }).single(),
		supabase.from('calendar_events').select().match({ org }),
		getTeams({ org })
	]);

	const leaveDays: { date: Date; name: string; status: string; data: any }[] = [];
	const events: { date: Date; data: Tables<'calendar_events'> }[] = [];

	for (const item of leaves!) {
		const startDate = new Date(item.from);
		const endDate = new Date(item.to);
		const name = `${item.leave_type} leave | ${item.profile.first_name} ${item.profile.last_name}`;
		const status = item.status;
		const data = item;

		for (let date = startDate as any; date <= endDate; date.setDate(date.getDate() + 1)) leaveDays.push({ date: new Date(date), name, status, data });
	}

	for (const item of calendarEvents!) {
		const startDate = new Date((item.start as any)?.dateTime);
		const endDate = new Date((item.end as any)?.dateTime);
		const data = item;

		for (let date = startDate as any; date <= endDate; date.setDate(date.getDate() + 1)) events.push({ date: new Date(date), data });
	}

	const gCalendars = isCalendarState == 'success' && !calendars ? await getGCalendars({ org }) : false;

	return (
		<section className="mx-auto">
			<FullCalendar
				showCalendarConfigError={isCalendarState == 'error'}
				employees={dobs}
				orgCalendarConfig={orgCalendarSettings}
				org={org}
				calendar={calendars}
				profile={user?.id!}
				contract={dobs?.find(contract => contract.profile?.id == user?.id)?.id as number}
				leaveDays={leaveDays}
				events={events}
				reminders={reminders || []}
				teams={teams}
				dobs={dobs!.filter(contract => contract.profile?.date_of_birth) as any}
			/>

			{gCalendars && gCalendars.data && <GCalendarSetupDialog calendars={gCalendars.data} org={org} />}
		</section>
	);
};
