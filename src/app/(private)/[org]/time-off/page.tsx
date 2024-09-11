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

	const { data, error } = await supabase
		.from('time_off')
		.select(
			'*, hand_over:contracts!time_off_hand_over_fkey(id, job_title, profile:profiles!contracts_profile_fkey(first_name, last_name)), contract:contracts!time_off_contract_fkey(job_title,id, team, unpaid_leave_used, sick_leave_used, paternity_leave_used, paid_leave_used, maternity_leave_used), profile:profiles!time_off_profile_fkey(*)'
		)
		.match({ org: params.org });

	if (error) return;

	const result = [];

	for (const item of data) {
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

			<div className="mb-6 mt-20 flex w-full items-center justify-between">
				<h1 className="text-2xl font-medium">Leave History</h1>
			</div>

			<DataTable data={data.map(item => ({ ...item, reviewType: 'admin' }))} columns={columns} />
		</Suspense>
	);
}
