import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { CalendarRange } from 'lucide-react';
import { toast } from 'sonner';

import { FullCalendar } from '@/components/calendar/calendar';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

interface QUERY_BUILDER {
	profile?: string;
	org: string;
}

export const EmployeeCalendar = async ({ org, contractId }: { org: string; contractId?: number }) => {
	const supabase = await createClient();

	const {
		data: { user },
		error
	} = await supabase.auth.getUser();
	if (error || !user) return redirect('/login');

	const { data: orgCalendarConfig, error: calendarConfigError } = await supabase.from('org_settings').select('enable_calendar, calendar_employee_events').eq('org', org).single();
	if (calendarConfigError) toast.error(calendarConfigError.message);

	const timeOffQuery: QUERY_BUILDER & { status?: string } = { org, status: 'approved', profile: user?.id! };
	if (orgCalendarConfig?.enable_calendar && orgCalendarConfig?.calendar_employee_events?.includes('time-off')) delete timeOffQuery.profile;

	const contractsQueryBuilder: QUERY_BUILDER & { status?: string } = { org, profile: user?.id! };
	if (orgCalendarConfig?.enable_calendar && orgCalendarConfig?.calendar_employee_events?.includes('birthdays')) delete timeOffQuery.profile;

	const [{ data: leaves, error: leaveError }, { data: reminders, error: reminderError }, { data: dobs, error: dobError }, { data: calendarConfig, error: calendarError }, { data: calendarDetails, error: calendarDetailsError }] = await Promise.all([
		supabase
			.from('time_off')
			.select('*, profile:profiles!time_off_profile_fkey(first_name, last_name)')
			.match({ ...timeOffQuery }),
		supabase.from('reminders').select('*, profile:profiles!reminders_profile_fkey(id, first_name, last_name)').match({ org, profile: user?.id! }),
		supabase
			.from('contracts')
			.select('id, job_title, profile:profiles!contracts_profile_fkey(first_name, last_name, date_of_birth, id)')
			.match({ ...contractsQueryBuilder }),
		supabase.from('contract_calendar_config').select().match({ org, profile: user?.id! }),
		supabase.from('calendars').select('calendar_id').match({ org, platform: 'google' }).single()
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
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button className="h-8 w-8 rounded-2xl border p-0" variant={'secondary'}>
					<CalendarRange size={12} />
				</Button>
			</AlertDialogTrigger>

			<AlertDialogContent className="block max-h-screen w-full max-w-5xl overflow-y-auto bg-white/20 backdrop-blur-sm">
				<AlertDialogHeader className="flex-row justify-between text-left">
					<AlertDialogTitle className="sr-only">Calendar</AlertDialogTitle>
					<AlertDialogDescription className="sr-only">Organisation calendar of company wide events and meetings</AlertDialogDescription>
				</AlertDialogHeader>

				<section className="mt-8 min-h-96 space-y-8 overflow-scroll p-0.5">
					<FullCalendar
						orgCalendarConfig={orgCalendarConfig}
						calendarConfig={calendarConfig}
						calendarId={calendarDetails?.calendar_id}
						contractId={contractId}
						role="employee"
						org={org}
						profile={user?.id!}
						contract={dobs?.find(contract => contract.profile?.id == user?.id)?.id as number}
						leaveDays={result}
						reminders={reminders || []}
						dobs={dobs!.filter(contract => contract.profile?.date_of_birth) as any}
						enableClose={true}
					/>
				</section>
			</AlertDialogContent>
		</AlertDialog>
	);
};
