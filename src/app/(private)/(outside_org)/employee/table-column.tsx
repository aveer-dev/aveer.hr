'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ChevronRight } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { CONTRACT } from '@/type/contract.types';
import { ContractStatus } from '@/components/ui/status-badge';

export const columns: ColumnDef<CONTRACT>[] = [
	{
		id: 'select',
		header: ({ table }) => (
			<Checkbox
				className="h-5 w-5 border-none bg-muted data-[state=checked]:bg-accent data-[state=checked]:text-primary"
				checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
				onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => <Checkbox checked={row.getIsSelected()} className="h-5 w-5 border-none bg-muted data-[state=checked]:bg-accent data-[state=checked]:text-primary" onCheckedChange={value => row.toggleSelected(!!value)} aria-label="Select row" />,
		enableSorting: false,
		enableHiding: false
	},
	{
		id: 'org',
		header: 'Company',
		cell: ({ row }) => {
			return (
				<div className="grid gap-1">
					<div className="font-medium">{row.original.org?.name}</div>
					<div>{row.original.entity.incorporation_country?.name}</div>
				</div>
			);
		}
	},
	{
		id: `salary`,
		header: 'Salary',
		cell: ({ row }) => (
			<span>
				{new Intl.NumberFormat('en-US', {
					style: 'currency',
					currency: row.original.entity.incorporation_country.currency_code
				}).format(row.original.salary)}
			</span>
		)
	},
	{
		id: 'status',
		header: 'Status',
		cell: ({ row }) => <ContractStatus state={row.original.status} start_date={row.original.start_date} end_date={row.original.end_date} />
	},
	{
		id: 'employment_type',
		header: 'Employment type',
		cell: ({ row }) => <span className="capitalize">{row.original.employment_type}</span>
	},
	{
		id: 'start_date',
		header: 'Start Date',
		cell: ({ row }) => <span>{format(row.original.start_date, 'PP')}</span>
	},
	{
		id: 'actions',
		cell: () => (
			<Button variant="ghost" className="h-8 w-8 p-0 !ring-0 !ring-offset-0">
				<ChevronRight width={12} />
			</Button>
		)
	}
];
