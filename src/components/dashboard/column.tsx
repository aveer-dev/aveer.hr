'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { PERSON } from '@/type/person';
import { format } from 'date-fns';
import { NavLink } from '@/components/ui/link';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { ContractStatus } from '@/components/ui/status-badge';

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
		enableHiding: false,
		size: 50
	},
	{
		id: 'name',
		header: 'Name',
		cell: ({ row }) => {
			return (
				<div className="grid gap-1">
					<div className="whitespace-nowrap font-medium">
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
		cell: ({ row }) => <span>{row.original.profile?.nationality?.name || '-'}</span>,
		size: 100
	},
	{
		id: 'status',
		header: 'Status',
		cell: ({ row }) => <ContractStatus state={row.original.status} start_date={row.original.start_date} end_date={row.original.end_date} />,
		size: 80
	},
	{
		id: 'employment_type',
		header: 'Employment type',
		cell: ({ row }) => <span className="capitalize">{row.original.employment_type}</span>,
		size: 80
	},
	{
		accessorKey: 'team.name',
		header: 'Team',
		size: 80
	},
	{
		id: 'start_date',
		header: 'Start Date',
		cell: ({ row }) => <span className="whitespace-nowrap">{format(row.original.start_date, 'PP')}</span>,
		size: 80
	},
	{
		id: 'actions',
		cell: ({ row }) => {
			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 w-8 p-0 !ring-0 !ring-offset-0">
							<span className="sr-only">Open menu</span>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem className="h-7 p-0 text-xs font-light">
							<DropdownListItem org={row.original.org} href={`/people/${row.original.id}`}>
								View
							</DropdownListItem>
						</DropdownMenuItem>
						<DropdownMenuItem className="h-7 p-0 text-xs font-light">
							<DropdownListItem org={row.original.org} href={`/people/${row.original.id}/edit`}>
								Edit
							</DropdownListItem>
						</DropdownMenuItem>
						<DropdownMenuItem className="h-7 p-0 text-xs font-light">
							<DropdownListItem org={row.original.org} href={`/people/new?duplicate=${row.original.id}`}>
								Duplicate
							</DropdownListItem>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
		size: 50
	}
];

const DropdownListItem = ({ children, href, org }: { children: ReactNode; href: string; org?: string }) => (
	<NavLink org={org} className={cn(buttonVariants({ size: 'sm', variant: 'ghost' }), 'h-7 w-full cursor-pointer justify-start')} href={href}>
		{children}
	</NavLink>
);
