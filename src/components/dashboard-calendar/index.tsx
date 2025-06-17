import { createClient } from '@/utils/supabase/server';
import { Calendar } from './dashboard-calendar';
import { ROLE } from '@/type/contract.types';
import { CalendarsRepository, ContractRepository, LeaveRepository, TeamRepository } from '@/dal';

export const DashboardCalendar = async ({ org, userType = 'admin' }: { org: string; userType?: ROLE }) => {
	const supabase = await createClient();

	const {
		data: { user }
	} = await supabase.auth.getUser();

	const contractRepo = new ContractRepository();
	const leaveRepo = new LeaveRepository();
	const calendarRepo = new CalendarsRepository();
	const teamsRepo = new TeamRepository();

	const [employees, timeOffs, calendarEvents, teams, calendars] = await Promise.all([
		contractRepo.getAllByOrgWithRelations(org, 'signed'),
		leaveRepo.getAllByOrgWithRelations(org),
		calendarRepo.getAllCalendarEventsByOrg(org),
		teamsRepo.getAllByOrg(org),
		calendarRepo.getAllCalendarsByOrg({ org })
	]);

	if (employees.error) return employees.error.message;
	if (timeOffs.error) return timeOffs.error.message;
	if (calendarEvents.error) return calendarEvents.error.message;
	if (teams.error) return teams.error.message;
	if (calendars.error) return calendars.error.message;

	const calendar = calendars.data?.filter(calendar => calendar.platform == 'google')[0] || null;

	return <Calendar userId={user?.id!} calendarEvents={calendarEvents.data || []} role={userType} teams={teams.data || []} employees={employees.data || []} org={org} calendar={calendar} userType={'admin'} timeOffs={timeOffs.data || []} />;
};
