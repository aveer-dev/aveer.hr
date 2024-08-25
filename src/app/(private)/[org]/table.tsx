'use client';

import { columns } from '@/components/dashboard/column';
import { DataTable } from '@/components/dashboard/table';
import { buttonVariants } from '@/components/ui/button';
import { PERSON } from '@/type/person';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { DashboardFilters } from '@/components/dashboard/filters';
import { cn } from '@/lib/utils';
import { NavLink } from '@/components/ui/link';

export const ClientTable = ({ org, data }: { org: string; data: PERSON[] }) => {
	const [tableData, updateData] = useState<PERSON[]>(data);
	const [tableLoading, toggleTableLoadingState] = useState(false);

	return (
		<div className="container mx-auto p-0">
			<div className="mb-6 flex w-full items-center gap-6">
				<h1 className="text-2xl font-medium">People</h1>

				<DashboardFilters org={org} toggleTableLoadingState={toggleTableLoadingState} updateData={updateData} />

				<NavLink org={org} href={`/people/new`} className={cn(buttonVariants(), 'ml-auto h-8 justify-end gap-4')}>
					<Plus size={12} />
					Add person
				</NavLink>
			</div>

			<DataTable link={`/people`} columns={columns} org={org} data={tableData} loading={tableLoading} />
		</div>
	);
};
