'use client';

import { columns } from '@/components/dashboard/column';
import { DataTable } from '@/components/dashboard/table';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PERSON } from '@/type/person';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { DashboardFilters } from '@/components/dashboard/filters';

export const ClientTable = ({ orgId, data }: { orgId: string; data: PERSON[] }) => {
	const [tableData, updateData] = useState<PERSON[]>(data);
	const [tableLoading, toggleTableLoadingState] = useState(false);

	return (
		<div className="container mx-auto p-0">
			<div className="mb-6 flex w-full items-center gap-6">
				<h1 className="text-2xl font-medium">People</h1>

				<DashboardFilters toggleTableLoadingState={toggleTableLoadingState} updateData={updateData} />

				<Link href={`${orgId}/add-people`} className={cn(buttonVariants({ size: 'sm' }), 'ml-auto h-8 gap-4')}>
					<Plus size={12} />
					App person
				</Link>
			</div>

			{data && <DataTable columns={columns} data={tableData} loading={tableLoading} />}
		</div>
	);
};
