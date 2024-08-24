'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ReactNode, useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tables } from '@/type/database.types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

const jobLink = (jobId: number, org: string) => `${location.protocol}//${location.host}/${process.env.NEXT_PUBLIC_ENABLE_SUBDOOMAIN == 'true' ? '' : org + '/'}jobs/${jobId}`;

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
		cell: ({ row }) => {
			const [state, setState] = useState(row.original.state);
			const onCheckChange = async (state: boolean) => {
				const { data, error } = await supabase
					.from('open_roles')
					.update({ state: state ? 'open' : 'closed' })
					.eq('id', row.original.id)
					.select('state')
					.single();
				if (data) setState(data.state);
				if (error) toast('😭 Unable to update role', { description: error.message });
			};

			return (
				<Badge className="w-fit gap-2 py-1 font-light" variant="secondary">
					<span className="w-9">{state}</span>
					<Switch checked={state == 'open'} className="scale-50" onCheckedChange={onCheckChange} />
				</Badge>
			);
		}
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
						<Button variant="ghost" className="h-8 w-8 p-0">
							<span className="sr-only">Open menu</span>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem className="h-7 p-0 font-light">
							<Button
								variant={'ghost'}
								onClick={() => {
									navigator.clipboard.writeText(jobLink(row.original.id, row.original?.org));
									toast.message('👋🏾 Hey there', { description: 'Public link to role application has been copied to clipboard' });
								}}
								className="h-7 w-full cursor-pointer justify-start text-xs">
								Copy job link
							</Button>
						</DropdownMenuItem>
						<DropdownMenuItem className="h-7 p-0 text-xs font-light">
							<DropdownListItem href={`./open-roles/${row.original.id}`}>View</DropdownListItem>
						</DropdownMenuItem>
						<DropdownMenuItem className="h-7 p-0 text-xs font-light">
							<DropdownListItem href={`./open-roles/${row.original.id}/edit`}>Edit</DropdownListItem>
						</DropdownMenuItem>
						<DropdownMenuItem className="h-7 p-0 text-xs font-light">
							<DropdownListItem href={`./open-roles/new?duplicate=${row.original.id}`}>Duplicate</DropdownListItem>
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
