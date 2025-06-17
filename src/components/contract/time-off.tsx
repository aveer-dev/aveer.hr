import { Suspense } from 'react';
import { DataTable } from '@/components/dashboard/table';
import { columns } from '../leave/column';
import { Separator } from '@/components/ui/separator';
import { ROLE } from '@/type/contract.types';
import { Tables } from '@/type/database.types';
import { getLeaveRequests } from './contract-assignments/utils';

interface props {
	org: string;
	team?: number | null;
	contract: Tables<'contracts'>;
	reviewType: ROLE;
	manager?: Tables<'managers'> | null;
}

export const Timeoff = async ({ org, contract, reviewType, manager }: props) => {
	const leaveRequests = await getLeaveRequests({ org, contract, manager });

	return (
		<section className="mt-6">
			<div className="flex w-full items-center justify-between">
				<h2 className="text-base font-medium text-support">Leave review</h2>
			</div>

			<Suspense>
				<Separator className="mb-4 mt-2" />
				{leaveRequests && <DataTable data={leaveRequests.map(item => ({ ...item, reviewType: !manager && reviewType !== 'admin' && item?.contract.direct_report == contract.id ? 'manager' : reviewType, activeUserContract: contract.id })) as any} columns={columns} />}
			</Suspense>
		</section>
	);
};
