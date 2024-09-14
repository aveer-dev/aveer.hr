import { Suspense } from 'react';
import { DataTable } from '@/components/dashboard/table';
import { createClient } from '@/utils/supabase/server';
import { columns } from '../leave/column';
import { Separator } from '../ui/separator';

export const Timeoff = async ({ org, team, contract, reviewType }: { org: string; team: number | null; contract: number; reviewType: string }) => {
	const supabase = createClient();

	const query: { org: string; 'contract.team'?: number; contract?: number } = { org };
	if (team) query['contract.team'] = team;
	else query.contract = contract;

	const { data, error } = await supabase
		.from('time_off')
		.select(
			'*, hand_over:contracts!time_off_hand_over_fkey(id, job_title, profile:profiles!contracts_profile_fkey(first_name, last_name)), contract:contracts!time_off_contract_fkey(job_title,id, team, unpaid_leave_used, sick_leave_used, paternity_leave_used, paid_leave_used, maternity_leave_used), profile:profiles!time_off_profile_fkey(*)'
		)
		.match(query);

	if (error) return;

	return (
		<section className="mt-6">
			<div className="flex w-full items-center justify-between">
				<h2 className="text-lg font-medium">Leave review</h2>
			</div>

			<Suspense>
				<Separator className="mb-4 mt-2" />
				<DataTable data={data.map(item => ({ ...item, reviewType }))} columns={columns} />
			</Suspense>
		</section>
	);
};
