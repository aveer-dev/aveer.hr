import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Tables } from '@/type/database.types';
import { EmployeeCalendarComponent } from './calendar-component';

interface QUERY_BUILDER {
	profile?: string;
	org: string;
}

export const EmployeeCalendar = async ({ org, contractId, team }: { org: string; contractId?: number; team?: number | null }) => {
	const supabase = await createClient();

	const {
		data: { user },
		error
	} = await supabase.auth.getUser();
	if (error || !user) return redirect('/app/login');

	const { data: orgCalendarConfig, error: calendarConfigError } = await supabase.from('org_settings').select('enable_thirdparty_calendar, calendar_employee_events').eq('org', org).single();
	if (calendarConfigError) return;

	const timeOffQuery: QUERY_BUILDER & { status?: string } = { org, status: 'approved', profile: user?.id! };
	if (orgCalendarConfig?.calendar_employee_events?.includes('time-off')) delete timeOffQuery.profile;

	const contractsQueryBuilder: QUERY_BUILDER & { status?: string } = { org, profile: user?.id! };
	if (orgCalendarConfig?.calendar_employee_events?.includes('birthdays')) delete timeOffQuery.profile;

	const [{ data: leaves, error: leaveError }, { data: reminders, error: reminderError }, { data: dobs, error: dobError }, { data: calendar, error: calendarDetailsError }, { data: calendarEvents, error: calendarEventsError }] = await Promise.all([
		supabase
			.from('time_off')
			.select('*, profile:profiles!time_off_profile_fkey(first_name, last_name)')
			.match({ ...timeOffQuery }),
		supabase.from('reminders').select('*, profile:profiles!reminders_profile_fkey(id, first_name, last_name)').match({ org, profile: user?.id! }),
		supabase
			.from('contracts')
			.select('id, job_title, profile:profiles!contracts_profile_fkey(first_name, last_name, date_of_birth, id)')
			.match({ ...contractsQueryBuilder }),
		supabase.from('calendars').select().match({ org, platform: 'google' }).single(),
		supabase.from('calendar_events').select().match({ org })
	]);

	const result: { date: Date; name: string; status: string; data: any }[] = [];
	const events: { date: Date; data: Tables<'calendar_events'> }[] = [];

	for (const item of leaves!) {
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

		const isEmployeeInvited = (item.attendees as any[]).length
			? !!(item.attendees as any[]).find(employee => {
					if (employee.single) return employee.single.id == contractId;
					if (employee.team) return employee.team.id == team;
					if (employee.all) return employee.all.find((employee: any) => employee.id == contractId);
					return false;
				})
			: true;

		for (let date = startDate as any; date <= endDate; date.setDate(date.getDate() + 1)) if (isEmployeeInvited) events.push({ date: new Date(date), data });
	}

	return <EmployeeCalendarComponent events={events} result={result} orgCalendarConfig={orgCalendarConfig} org={org} reminders={reminders} contractId={contractId} userId={user.id} dobs={dobs} calendar={calendar} calendarEvents={calendarEvents} />;
};
