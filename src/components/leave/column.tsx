'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components//ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { differenceInBusinessDays, format } from 'date-fns';
import { parseDateOnly } from '@/lib/utils';
import { Tables } from '@/type/database.types';
import { Badge } from '@/components/ui/badge';
import { LeaveReview } from './leave-review';
import { ROLE } from '@/type/contract.types';
import { PanelRightOpen } from 'lucide-react';

type LEAVE_COLUMN = ColumnDef<
	Tables<'time_off'> & {
		profile: Tables<'profiles'>;
		reviewType: ROLE;
		activeUserContract?: number;
	}
>;

export const columns: LEAVE_COLUMN[] = [
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
		cell: ({ row }) => <span className="capitalize">{row.original.leave_type} leave</span>,
		size: 80
	},
	{
		id: 'status',
		header: 'Status',
		cell: ({ row }) => <Badge variant={row.original.status == 'approved' ? 'secondary-success' : row.original.status == 'denied' ? 'secondary-destructive' : row.original.status == 'pending' ? 'secondary-warn' : 'secondary'}>{row.original.status}</Badge>,
		size: 80
	},
	{
		id: 'duration',
		header: 'Duration',
		cell: ({ row }) => (
			<div>
				<span>{format(parseDateOnly(row.original.from), 'PP')}</span> - <span>{format(parseDateOnly(row.original.to), 'PP')}</span>
			</div>
		),
		enableHiding: true
	},
	{
		id: 'days',
		header: 'Days',
		cell: ({ row }) => <span className="whitespace-nowrap">{differenceInBusinessDays(parseDateOnly(row.original.to), parseDateOnly(row.original.from)) + 1}</span>,
		size: 50
	},
	{
		id: 'actions',
		cell: ({ row }) => {
			return (
				<LeaveReview reviewType={row.original.reviewType} data={row.original as any} contract={row.original.contract as any} contractId={row.original.activeUserContract}>
					<Button variant={'outline'} className="h-8 gap-3">
						Review
						<PanelRightOpen size={12} />
					</Button>
				</LeaveReview>
			);
		},
		size: 50
	}
];
