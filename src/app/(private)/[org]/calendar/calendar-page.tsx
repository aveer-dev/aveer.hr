import { createClient } from '@/utils/supabase/server';
import { FullCalendar } from '@/components/calendar/calendar';
import { redirect } from 'next/navigation';

export const CalendarPageComponent = async ({ org }: { org: string }) => {
	const supabase = await createClient();

	const {
		data: { user },
		error
	} = await supabase.auth.getUser();
	if (error || !user) return redirect('/login');

	const [{ data: leaves, error: leaveError }, { data: reminders, error: reminderError }, { data: dobs, error: dobError }, { data: calendar, error: calendarError }] = await Promise.all([
		supabase.from('time_off').select('*, profile:profiles!time_off_profile_fkey(first_name, last_name), hand_over(profile(first_name, last_name), job_title)').eq('org', org),
		supabase.from('reminders').select('*, profile:profiles!reminders_profile_fkey(id, first_name, last_name)').match({ org, profile: user?.id }),
		supabase.from('contracts').select('id, job_title, profile:profiles!contracts_profile_fkey(first_name, last_name, date_of_birth, id)').eq('org', org),
		supabase.from('org_settings').select('enable_calendar, calendar_employee_events').eq('org', org).single()
	]);

	const result: { date: Date; name: string; status: string; data: any }[] = [];

	for (const item of leaves!) {
		const startDate = new Date(item.from);
		const endDate = new Date(item.to);
		const name = `${item.leave_type} leave | ${item.profile.first_name} ${item.profile.last_name}`;
		const status = item.status;
		const data = item;

		for (let date = startDate as any; date <= endDate; date.setDate(date.getDate() + 1)) result.push({ date: new Date(date), name, status, data });
	}

	return (
		<section className="mx-auto">
			<FullCalendar
				orgCalendarConfig={calendar}
				org={org}
				profile={user?.id!}
				contract={dobs?.find(contract => contract.profile?.id == user?.id)?.id as number}
				leaveDays={result}
				reminders={reminders || []}
				dobs={dobs!.filter(contract => contract.profile?.date_of_birth) as any}
			/>
		</section>
	);
};
