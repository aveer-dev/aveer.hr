'use client';

import { columns } from '@/components/dashboard/column';
import { DataTable } from '@/components/dashboard/table';
import { Button, buttonVariants } from '@/components/ui/button';
import { PERSON } from '@/type/person';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { DashboardFilters } from '@/components/dashboard/filters';
import { useRouter } from 'next/navigation';
import { FirstContractDialog } from './first-contract-dialog';
import { NavLink } from '@/components/ui/link';
import { cn } from '@/lib/utils';

export const ClientTable = ({ org, data, probation }: { org: string; data: PERSON[]; probation?: number | null }) => {
	const [tableData, updateData] = useState<PERSON[]>(data.map(person => ({ ...person, probation_days: probation })));
	const [tableLoading, toggleTableLoadingState] = useState(false);
	const [isFirstContractModalOpen, toggleFirstContractModal] = useState(false);
	const router = useRouter();

	return (
		<div className="container mx-auto p-0">
			<div className="mb-6 flex w-full items-center justify-between">
				<div className="flex items-center gap-6">
					<h1 className="text-2xl font-medium">People</h1>

					<DashboardFilters org={org} toggleTableLoadingState={toggleTableLoadingState} updateData={updateData} />
				</div>

				{data.length > 0 && (
					<NavLink org={org} href={`/people/new`} className={cn(buttonVariants(), 'ml-auto h-8 justify-end gap-4')}>
						<Plus size={12} />
						<span className="hidden sm:block">Add person</span>
					</NavLink>
				)}

				{data.length == 0 && (
					<>
						<Button onClick={() => (data.length > 0 ? router.push(`/${org}/people/new`) : toggleFirstContractModal(true))} className={'ml-auto h-8 justify-end gap-4'}>
							<Plus size={12} />
							<span className="hidden sm:block">Add person</span>
						</Button>

						<FirstContractDialog org={org} toggle={toggleFirstContractModal} isOpen={isFirstContractModalOpen} />
					</>
				)}
			</div>

			<DataTable link={`/people`} columns={columns} org={org} data={tableData} loading={tableLoading} />
		</div>
	);
};
