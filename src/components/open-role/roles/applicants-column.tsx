'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Tables } from '@/type/database.types';
import { ApplicantDetails } from './applicant-details';
import { Badge } from '@/components/ui/badge';

export const ApplicantsColumn: ColumnDef<Tables<'job_applications'>>[] = [
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
		header: 'Full name',
		cell: ({ row }) => (
			<>
				<div>
					<span>{row.original.first_name}</span> <span>{row.original.last_name}</span>
				</div>
				<div className="text-muted-foreground">{row.original.email}</div>
			</>
		)
	},
	{
		id: 'country',
		header: 'Country',
		cell: ({ row }) => <span>{(row.original.country_location as any)?.name}</span>
	},
	{
		id: 'stage',
		header: 'Stage',
		cell: ({ row }) => (
			<Badge className="font-light" variant={'secondary'}>
				{row.original.stage}
			</Badge>
		)
	},
	{
		accessorKey: 'require_sponsorship',
		header: 'Sponsorship',
		cell: ({ row }) => <span className="capitalize">{row.original.require_sponsorship ? 'Yes' : 'No'}</span>
	},
	{
		accessorKey: 'gender',
		header: 'Gender',
		cell: ({ row }) => <span className="capitalize">{row.original.gender}</span>
	},
	{
		id: 'actions',
		cell: ({ row }) => (
			<Button className="rounded-lg" variant={'ghost'}>
				View Resume
			</Button>
		)
	},
	{
		id: 'open',
		cell: ({ row }) => <ApplicantDetails data={row.original} />
	}
];
