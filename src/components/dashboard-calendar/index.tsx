import { createClient } from '@/utils/supabase/server';
import { Calendar } from './dashboard-calendar';

export const DashboardCalendar = async ({ org }: { org: string }) => {
	const supabase = await createClient();

	const [{ data, error }, { data: calendar, error: calendarError }] = await Promise.all([
		await supabase.from('contracts').select('id, job_title, profile:profiles!contracts_profile_fkey(first_name, last_name, id, date_of_birth)').match({ org, status: 'signed' }),
		await supabase
			.from('time_off')
			.select(
				'*, hand_over:contracts!time_off_hand_over_fkey(id, job_title, profile:profiles!contracts_profile_fkey(first_name, last_name)), contract:contracts!time_off_contract_fkey(job_title,id, team, unpaid_leave_used, sick_leave_used, paternity_leave_used, paid_leave_used, maternity_leave_used), profile:profiles!time_off_profile_fkey(*)'
			)
			.match({ org, status: 'approved' })
	]);

	if (error) return error.message;
	if (calendarError) return calendarError.message;

	const result = [];

	for (const item of calendar) {
		const startDate = new Date(item.from);
		const endDate = new Date(item.to);
		const name = `${item.leave_type} leave | ${item.profile.first_name} ${item.profile.last_name}`;
		const status = item.status;
		const data = item;

		for (let date = startDate as any; date <= endDate; date.setDate(date.getDate() + 1)) result.push({ date: new Date(date), name, status, data });
	}

	return <Calendar org={org} leaveDays={result} birthdays={data} />;
};
