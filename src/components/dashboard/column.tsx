'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '../ui/badge';
import { PERSON } from '@/type/person';

export const columns: ColumnDef<PERSON>[] = [
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
		id: 'name',
		header: 'Name',
		cell: ({ row }) => (
			<div className="grid gap-1">
				<div className="font-medium">
					{row.original.first_name} {row.original.last_name}
				</div>
				<div>{row.original.job_title}</div>
			</div>
		)
	},
	{
		accessorKey: 'country',
		header: 'Country'
	},
	{
		id: 'status',
		header: 'Status',
		cell: ({ row }) => (
			<Badge className="font-light" variant="secondary">
				{row.original['status']}
			</Badge>
		)
	},
	{
		accessorKey: 'employment_type',
		header: 'Employment type'
	},
	{
		accessorKey: 'start_date',
		header: 'Start Date'
	},
	{
		id: 'actions',
		cell: ({ row }) => {
			const payment = row.original;

			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 w-8 p-0 !ring-0 !ring-offset-0">
							<span className="sr-only">Open menu</span>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start">
						<DropdownMenuItem className="text-xs font-light" onClick={() => navigator.clipboard.writeText(payment.id)}>
							Copy payment ID
						</DropdownMenuItem>
						<DropdownMenuItem className="text-xs font-light">View customer</DropdownMenuItem>
						<DropdownMenuItem className="text-xs font-light">View payment details</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		}
	}
];
