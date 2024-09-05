'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button, buttonVariants } from '@/components//ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { differenceInBusinessDays, format } from 'date-fns';
import { NavLink } from '@/components/ui/link';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { Tables } from '@/type/database.types';
import { Badge } from '@/components/ui/badge';

export const columns: ColumnDef<Tables<'time_off'> & { profile: Tables<'profiles'> }>[] = [
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
		header: 'Employee',
		cell: ({ row }) => {
			return (
				<div className="">
					{row.original.profile.first_name} {row.original.profile.last_name}
				</div>
			);
		}
	},
	{
		accessorKey: 'leave_type',
		header: 'Leave type',
		cell: ({ row }) => (
			<Badge className="capitalize" variant={'secondary'}>
				{row.original.leave_type} leave
			</Badge>
		)
	},
	{
		id: 'status',
		header: 'Status',
		cell: ({ row }) => <Badge variant={row.original.status == 'approved' ? 'secondary-success' : row.original.status == 'denied' ? 'secondary-destructive' : row.original.status == 'pending' ? 'secondary-warn' : 'secondary'}>{row.original.status}</Badge>
	},
	{
		id: 'duration',
		header: 'Duration',
		cell: ({ row }) => (
			<div>
				<span>{format(row.original.from, 'PP')}</span> - <span>{format(row.original.to, 'PP')}</span>
			</div>
		),
		enableHiding: true
	},
	{
		id: 'days',
		header: 'Days',
		cell: ({ row }) => <span className="whitespace-nowrap">{differenceInBusinessDays(row.original.to, row.original.from)}</span>
		// },
		// {
		// 	id: 'actions',
		// 	cell: ({ row }) => {
		// 		return (
		// 			<DropdownMenu>
		// 				<DropdownMenuTrigger asChild>
		// 					<Button variant="ghost" className="h-8 w-8 p-0 !ring-0 !ring-offset-0">
		// 						<span className="sr-only">Open menu</span>
		// 						<MoreHorizontal className="h-4 w-4" />
		// 					</Button>
		// 				</DropdownMenuTrigger>
		// 				<DropdownMenuContent align="end">
		// 					<DropdownMenuItem className="h-7 p-0 text-xs font-light">
		// 						<DropdownListItem org={row.original.org} href={`/people/${row.original.id}`}>
		// 							View
		// 						</DropdownListItem>
		// 					</DropdownMenuItem>
		// 					<DropdownMenuItem className="h-7 p-0 text-xs font-light">
		// 						<DropdownListItem org={row.original.org} href={`/people/${row.original.id}/edit`}>
		// 							Edit
		// 						</DropdownListItem>
		// 					</DropdownMenuItem>
		// 					<DropdownMenuItem className="h-7 p-0 text-xs font-light">
		// 						<DropdownListItem org={row.original.org} href={`/people/new?duplicate=${row.original.id}`}>
		// 							Duplicate
		// 						</DropdownListItem>
		// 					</DropdownMenuItem>
		// 				</DropdownMenuContent>
		// 			</DropdownMenu>
		// 		);
		// 	},
		// 	size: 50
	}
];

// const DropdownListItem = ({ children, href, org }: { children: ReactNode; href: string; org?: string }) => (
// 	<NavLink org={org} className={cn(buttonVariants({ size: 'sm', variant: 'ghost' }), 'h-7 w-full cursor-pointer justify-start')} href={href}>
// 		{children}
// 	</NavLink>
// );
