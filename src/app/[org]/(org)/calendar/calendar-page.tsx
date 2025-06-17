import { createClient } from '@/utils/supabase/server';
import { FullCalendar } from '@/components/calendar/calendar';
import { getTeams } from '@/utils/form-data-init';
import { getGCalendars } from '@/components/calendar/calendar-actions';
import { GCalendarSetupDialog } from './google-calendar-setup';
import { CalendarsRepository, ContractRepository, LeaveRepository, OrgSettingsRepository } from '@/dal';

export const CalendarPageComponent = async ({ org, isCalendarState }: { org: string; isCalendarState: string }) => {
	const supabase = await createClient();

	const {
		data: { user }
	} = await supabase.auth.getUser();

	const contractRepo = new ContractRepository();
	const leaveRepo = new LeaveRepository();
	const calendarRepo = new CalendarsRepository();
	const orgSettingsRepo = new OrgSettingsRepository();

	const [leaves, reminders, employees, orgCalendarSettings, calendars, calendarEvents, teams] = await Promise.all([
		leaveRepo.getAllByOrgWithRelations(org),
		supabase.from('reminders').select('*, profile:profiles!reminders_profile_fkey(id, first_name, last_name)').eq('org', org),
		contractRepo.getAllByOrgWithProfile({ org, status: 'signed' }),
		orgSettingsRepo.getByOrg(org),
		calendarRepo.getAllCalendarsByOrg({ org }),
		calendarRepo.getAllCalendarEventsByOrg(org),
		getTeams({ org })
	]);

	const calendar = calendars.data?.find(calendar => calendar.platform == 'google') || null;
	// supabase.from('contracts').select('*, profile:profiles!contracts_profile_fkey(first_name, date_of_birth, id, last_name, email)').match({ org }).or(`status.eq.signed, profile.eq.${user?.id}`),
	// supabase.from('time_off').select('*, profile:profiles!time_off_profile_fkey(first_name, last_name), hand_over(profile(first_name, last_name), job_title)').eq('org', org).neq('status', 'denied'),

	const gCalendars = isCalendarState == 'success' && !calendars ? await getGCalendars({ org }) : false;

	return (
		<section className="mx-auto">
			<FullCalendar
				showCalendarConfigError={isCalendarState == 'error'}
				employees={employees.data || []}
				org={org}
				calendar={calendar}
				contractId={employees.data?.find(contract => contract.profile?.id == user?.id)?.id as number}
				calendarEvents={calendarEvents.data || []}
				reminders={reminders.data || []}
				teams={teams.data || []}
				timeOffs={leaves.data || []}
			/>

			{gCalendars && gCalendars.data && <GCalendarSetupDialog calendars={gCalendars.data} org={org} />}
		</section>
	);
};
