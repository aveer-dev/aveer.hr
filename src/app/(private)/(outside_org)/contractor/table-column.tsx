'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ChevronRight, Info, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CONTRACT } from '@/type/contract.types';

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
					<div className="font-medium">{row.original.org.name}</div>
					<div>{row.original.entity.incorporation_country.name}</div>
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
					currency: 'USD'
				}).format(row.original.salary)}
			</span>
		)
	},
	{
		id: 'status',
		header: 'Status',
		cell: ({ row }) => (
			<Badge className="gap-2 py-1 font-light" variant="secondary">
				{row.original.profile_signed ? row.original.status : 'awaiting your signature'}
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger>
							<Info size={12} className="stroke-1" />
						</TooltipTrigger>
						<TooltipContent>
							<p className="text-xs font-thin">{row.original.profile_signed ? row.original.status : `Your required to review and execute the contract if it's fine by you`}</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</Badge>
		)
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
