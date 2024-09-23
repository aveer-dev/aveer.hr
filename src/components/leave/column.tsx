'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components//ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { differenceInBusinessDays, format } from 'date-fns';
import { Tables } from '@/type/database.types';
import { Badge } from '@/components/ui/badge';
import { LeaveReview } from './leave-review';
import { ROLE } from '@/type/contract.types';

export const columns: ColumnDef<Tables<'time_off'> & { profile: Tables<'profiles'>; reviewType: ROLE }>[] = [
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
		cell: ({ row }) => <span className="whitespace-nowrap">{differenceInBusinessDays(row.original.to, row.original.from) + 1}</span>
	},
	{
		id: 'actions',
		cell: ({ row }) => {
			return (
				<LeaveReview reviewType={row.original.reviewType} data={row.original as any}>
					<Button variant={'secondary'} className="h-6">
						Review
					</Button>
				</LeaveReview>
			);
		}
	}
];
