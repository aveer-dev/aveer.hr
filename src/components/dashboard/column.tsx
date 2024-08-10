'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Info, MoreHorizontal } from 'lucide-react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '../ui/badge';
import { PERSON } from '@/type/person';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
		cell: ({ row }) => {
			return (
				<div className="grid gap-1">
					<div className="font-medium">
						{row.original.profile.first_name} {row.original.profile.last_name}
					</div>
					<div>{row.original.job_title}</div>
				</div>
			);
		}
	},
	{
		id: `nationality`,
		header: 'Country',
		cell: ({ row }) => <span>{row.original.profile.nationality.name}</span>
	},
	{
		id: 'status',
		header: 'Status',
		cell: ({ row }) => (
			<Badge className="gap-2 py-1 font-light" variant="secondary">
				{row.original['status']}
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger>
							<Info size={12} className="stroke-1" />
						</TooltipTrigger>
						<TooltipContent>
							<p className="text-xs font-thin">{row.original['status']}</p>
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
					<DropdownMenuContent align="end">
						<DropdownMenuItem className="text-xs font-light" asChild>
							<Button size={'sm'} variant={'ghost'} className="h-7 w-full cursor-pointer justify-start focus:!ring-0">
								View
							</Button>
						</DropdownMenuItem>
						<DropdownMenuItem className="text-xs font-light" asChild>
							<Button size={'sm'} variant={'ghost'} className="h-7 w-full cursor-pointer justify-start focus:!ring-0">
								Edit
							</Button>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		}
	}
];
