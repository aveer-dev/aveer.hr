import { DataTable } from '@/components/dashboard/table';
import { createClient } from '@/utils/supabase/server';
import { Suspense } from 'react';
import { columns } from '@/components/leave/column';
import { ROLE } from '@/type/contract.types';

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
		.eq('org', params.org);

	if (error) return error.message;

	const reviewType: ROLE = 'admin';

	return (
		<Suspense>
			<div className="mb-6 flex w-full items-center justify-between border-b pb-3">
				<h1 className="text-2xl font-medium">Leave History</h1>
			</div>

			<DataTable data={data.map(item => ({ ...item, reviewType }))} columns={columns} />
		</Suspense>
	);
}
