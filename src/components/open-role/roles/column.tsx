'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tables } from '@/type/database.types';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export const columns: ColumnDef<Tables<'open_roles'>>[] = [
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
		id: 'entity',
		header: 'Legal entity',
		cell: ({ row }) => {
			return (
				<div className="flex gap-2 font-medium">
					<span>{(row.original.entity as any)?.name}</span> • <span className="font-light text-muted-foreground">{(row.original.entity as any)?.incorporation_country}</span>
				</div>
			);
		}
	},
	{
		id: 'status',
		header: 'Status',
		cell: ({ row }) => (
			<Badge className="gap-2 py-1 font-light" variant="secondary">
				{row.original.status}
				<Switch defaultChecked={row.original.status == 'open'} className="scale-50" />
			</Badge>
		)
	},
	{
		id: 'employment_type',
		header: 'Employment type',
		cell: ({ row }) => <span className="capitalize">{row.original.employment_type}</span>
	},
	{
		accessorKey: 'applicants',
		header: 'Applicants'
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
						<DropdownMenuItem className="h-7 font-light">
							<Button variant={'ghost'} className="h-7 w-full cursor-pointer justify-start text-xs">
								Copy link
							</Button>
						</DropdownMenuItem>
						<DropdownMenuItem className="h-7 text-xs font-light">
							<DropdownListItem href={`/${row.original.org}/open-roles/${row.original.id}`}>View</DropdownListItem>
						</DropdownMenuItem>
						<DropdownMenuItem className="h-7 text-xs font-light">
							<DropdownListItem href={`/${row.original.org}/open-roles/${row.original.id}/edit`}>Edit</DropdownListItem>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		}
	}
];

const DropdownListItem = ({ children, href }: { children: ReactNode; href: string }) => (
	<Link className={cn(buttonVariants({ variant: 'ghost' }), 'h-7 w-full cursor-pointer justify-start')} href={href}>
		{children}
	</Link>
);
