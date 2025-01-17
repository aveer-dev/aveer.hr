import { createClient } from '@/utils/supabase/server';
import { Calendar } from './dashboard-calendar';
import { getEmployees, getTeams } from '@/utils/form-data-init';
import { Tables } from '@/type/database.types';

export const DashboardCalendar = async ({ org }: { org: string }) => {
	const supabase = await createClient();

	const [{ data, error }, { data: calendar, error: calendarError }, { data: calendarEvents, error: calendarEventsError }, { data: teams, error: teamsError }, { data: calendars, error: calendarsError }] = await Promise.all([
		getEmployees({ org }),
		supabase
			.from('time_off')
			.select(
				'*, hand_over:contracts!time_off_hand_over_fkey(id, job_title, profile:profiles!contracts_profile_fkey(first_name, last_name)), contract:contracts!time_off_contract_fkey(job_title,id, team, unpaid_leave_used, sick_leave_used, paternity_leave_used, paid_leave_used, maternity_leave_used), profile:profiles!time_off_profile_fkey(*)'
			)
			.match({ org, status: 'approved' }),
		supabase.from('calendar_events').select().match({ org }),
		getTeams({ org }),
		supabase.from('calendars').select().match({ org, platform: 'google' }).single()
	]);

	if (error) return error.message;
	if (calendarError) return calendarError.message;

	const result = [];
	const events: { date: Date; data: Tables<'calendar_events'> }[] = [];

	for (const item of calendar) {
		const startDate = new Date(item.from);
		const endDate = new Date(item.to);
		const name = `${item.leave_type} leave | ${item.profile.first_name} ${item.profile.last_name}`;
		const status = item.status;
		const data = item;

		for (let date = startDate as any; date <= endDate; date.setDate(date.getDate() + 1)) result.push({ date: new Date(date), name, status, data });
	}

	for (const item of calendarEvents!) {
		const startDate = new Date((item.start as any)?.dateTime);
		const endDate = new Date((item.end as any)?.dateTime);
		const data = item;

		for (let date = startDate as any; date <= endDate; date.setDate(date.getDate() + 1)) events.push({ date: new Date(date), data });
	}

	return <Calendar events={events} teams={teams} employees={data} org={org} leaveDays={result} calendar={calendars} birthdays={data} />;
};
