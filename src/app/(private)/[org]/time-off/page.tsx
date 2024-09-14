import { DataTable } from '@/components/dashboard/table';
import { createClient } from '@/utils/supabase/server';
import { Suspense } from 'react';
import { columns } from '@/components/leave/column';
import { LeaveCalendar } from '@/components/leave/leave-calendar';

interface props {
	params: { [key: string]: string };
	searchParams: { [key: string]: string };
}

export default async function TimeOffPage({ params }: props) {
	const supabase = createClient();

	const query = supabase
		.from('time_off')
		.select(
			'*, hand_over:contracts!time_off_hand_over_fkey(id, job_title, profile:profiles!contracts_profile_fkey(first_name, last_name)), contract:contracts!time_off_contract_fkey(job_title,id, team, unpaid_leave_used, sick_leave_used, paternity_leave_used, paid_leave_used, maternity_leave_used), profile:profiles!time_off_profile_fkey(*)'
		)
		.eq('org', params.org);

	const [{ data, error }, { data: calendar, error: calendarError }] = await Promise.all([await query, await query.neq('status', 'denied')]);

	if (error) return error.message;
	if (calendarError) return calendarError.message;

	const result = [];

	for (const item of calendar) {
		const startDate = new Date(item.from);
		const endDate = new Date(item.to);
		const name = `${item.leave_type} leave | ${item.profile.first_name} ${item.profile.last_name}`;
		const status = item.status;
		const data = item;

		for (let date = startDate as any; date <= endDate; date.setDate(date.getDate() + 1)) {
			result.push({
				date: new Date(date),
				name,
				status,
				data
			});
		}
	}

	return (
		<Suspense>
			<LeaveCalendar leaveDays={result} />

			<div className="mb-6 mt-24 flex w-full items-center justify-between border-b pb-3">
				<h1 className="text-2xl font-medium">Leave History</h1>
			</div>

			<DataTable data={data.map(item => ({ ...item, reviewType: 'admin' }))} columns={columns} />
		</Suspense>
	);
}
