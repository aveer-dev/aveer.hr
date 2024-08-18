'use client';

import { columns } from '@/components/dashboard/column';
import { DataTable } from '@/components/dashboard/table';
import { Button, buttonVariants } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { PERSON } from '@/type/person';
import { Briefcase, HardHat, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { DashboardFilters } from '@/components/dashboard/filters';

export const ClientTable = ({ org, data }: { org: string; data: PERSON[] }) => {
	const [tableData, updateData] = useState<PERSON[]>(data);
	const [tableLoading, toggleTableLoadingState] = useState(false);

	return (
		<div className="container mx-auto p-0">
			<div className="mb-6 flex w-full items-center gap-6">
				<h1 className="text-2xl font-medium">People</h1>

				<DashboardFilters org={org} toggleTableLoadingState={toggleTableLoadingState} updateData={updateData} />

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button className="ml-auto h-8 gap-4">
							<Plus size={12} />
							App person
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem className="p-0">
							<Link href={`${org}/people/new?type=employee`} className={cn(buttonVariants({ size: 'sm', variant: 'ghost' }), 'h-8 justify-end gap-4')}>
								<Briefcase size={12} />
								App employee
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem className="p-0">
							<Link href={`${org}/people/new?type=contractor`} className={cn(buttonVariants({ size: 'sm', variant: 'ghost' }), 'h-8 justify-end gap-4')}>
								<HardHat size={12} />
								App contractor
							</Link>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<DataTable columns={columns} org={org} data={tableData} loading={tableLoading} />
		</div>
	);
};
