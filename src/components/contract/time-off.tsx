import { Suspense } from 'react';
import { DataTable } from '@/components/dashboard/table';
import { createClient } from '@/utils/supabase/server';
import { columns } from '../leave/column';
import { Separator } from '@/components/ui/separator';
import { ROLE } from '@/type/contract.types';
import { Tables } from '@/type/database.types';
import { LEVEL } from '@/type/roles.types';

interface props {
	org: string;
	team?: number | null;
	contract: Tables<'contracts'>;
	reviewType: ROLE;
	manager?: Tables<'managers'> | null;
}

export const Timeoff = async ({ org, contract, reviewType, manager }: props) => {
	const supabase = createClient();

	const { data, error } = await supabase
		.from('time_off')
		.select(
			'*, hand_over:contracts!time_off_hand_over_fkey(id, job_title, profile:profiles!contracts_profile_fkey(first_name, last_name)), contract:contracts!time_off_contract_fkey(job_title,id, team, unpaid_leave_used, sick_leave_used, paternity_leave_used, paid_leave_used, maternity_leave_used), profile:profiles!time_off_profile_fkey(*)'
		)
		.match({ org });

	if (error) return;

	/* if current user is a manager, check if it's current user own boarding,
	 * then check if it's for the team the current user is the manager of or the person is an independent reviewer
	 *
	 * else, just check if the person is an independent reviewer */
	const filtereddata = data?.filter(timeoff => {
		const levels = timeoff.levels as unknown as LEVEL[];

		return manager ? manager.person !== timeoff.contract.id && (timeoff.contract.team == contract.team || levels.find(level => level.id == String(contract.id))) : levels.find(level => level.id == String(contract.id));
	});

	return (
		<section className="mt-6">
			<div className="flex w-full items-center justify-between">
				<h2 className="text-lg font-medium">Leave review</h2>
			</div>

			<Suspense>
				<Separator className="mb-4 mt-2" />
				<DataTable data={filtereddata.map(item => ({ ...item, reviewType, activeUserContract: contract.id }))} columns={columns} />
			</Suspense>
		</section>
	);
};
