import { Suspense } from 'react';
import { DataTable } from '@/components/dashboard/table';
import { createClient } from '@/utils/supabase/server';
import { columns } from '../leave/column';

export const Timeoff = async ({ org, team, contract }: { org: string; team: number | null; contract: number }) => {
	const supabase = createClient();

	const query: { org: string; 'contract.team'?: number; contract?: number } = { org };
	if (team) query['contract.team'] = team;
	else query.contract = contract;

	const { data, error } = await supabase
		.from('time_off')
		.select('*, hand_over:contracts!time_off_hand_over_fkey(id, job_title, profile:profiles!contracts_profile_fkey(first_name, last_name)), contract:contracts!time_off_contract_fkey(job_title,id), profile:profiles!time_off_profile_fkey(*)')
		.match(query);

	if (error) return;

	return (
		<section className="mt-6">
			<div className="mb-6 flex w-full items-center justify-between">
				<h1 className="text-xl font-semibold">Time off</h1>
			</div>

			<Suspense>
				<DataTable data={data} columns={columns} />
			</Suspense>
		</section>
	);
};
