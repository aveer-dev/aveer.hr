'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { Tables } from '@/type/database.types';
import { cn } from '@/lib/utils';

export const jobColumns: ColumnDef<Tables<'open_roles'>>[] = [
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
		accessorKey: 'job_title',
		header: 'Job title'
	},
	{
		accessorKey: 'entity.incorporation_country',
		header: 'Region'
	},
	{
		id: 'employment_type',
		header: 'Employment type',
		cell: ({ row }) => <span className="capitalize">{row.original.employment_type}</span>
	},
	{
		id: 'work_location',
		header: 'Work Location',
		cell: ({ row }) => <span className="capitalize">{row.original.work_location}</span>
	},
	{
		id: 'actions',
		cell: ({ row }) => {
			return (
				<Link href={`./jobs/${row.original.id}`} className={cn(buttonVariants(), 'px-4')}>
					Apply
				</Link>
			);
		}
	}
];