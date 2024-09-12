import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ApplicantDetails } from '@/components/open-role/roles/applicant-details';
import { Tables } from '@/type/database.types';
import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

const supabase = createClient();

export const ApplicantsSubTable = ({ org, roleId }: { org?: string; roleId: number }) => {
	const [data, setData] = useState<Tables<'job_applications'>[]>([]);
	const [isLoading, setLoadingState] = useState(true);

	const getApplicants = useCallback(
		async (org: string, roleId: number) => {
			setLoadingState(true);
			const { data, error } = await supabase
				.from('job_applications')
				.select(
					'*, country_location:countries!job_applications_country_location_fkey(name, country_code), org:organisations!job_applications_org_fkey(subdomain, name), role:open_roles!job_applications_role_fkey(job_title, id, policy:approval_policies!open_roles_policy_fkey(levels))'
				)
				.match({ org, role: roleId })
				.order('created_at');

			setLoadingState(false);
			if (data) setData(data as any);
			if (error) toast.error(error.message);
		},
		[setLoadingState, setData]
	);

	const columns: ColumnDef<Tables<'job_applications'> & { role: Tables<'roles'> & { policy: Tables<'approval_policies'> } }>[] = [
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
			size: 80
		},
		{
			id: 'name',
			header: 'Full name',
			cell: ({ row }) => (
				<div className="grid gap-2">
					<div>
						<span>{row.original.first_name}</span> <span>{row.original.last_name}</span>
					</div>
					<div className="text-muted-foreground">{row.original.email}</div>
				</div>
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
				<Badge className="font-light" variant={row.original.stage.includes('reject') ? 'secondary-destructive' : row.original.stage == 'applicant' ? 'secondary' : 'secondary-success'}>
					{row.original.stage}
				</Badge>
			),
			size: 120
		},
		{
			accessorKey: 'require_sponsorship',
			header: 'Sponsorship',
			cell: ({ row }) => <span className="capitalize">{row.original.require_sponsorship ? 'Yes' : 'No'}</span>,
			size: 80
		},
		{
			accessorKey: 'gender',
			header: 'Gender',
			cell: ({ row }) => <span className="capitalize">{row.original.gender}</span>,
			size: 80
		},
		{
			id: 'open',
			cell: ({ row }) => (
				<ApplicantDetails
					onUpdate={() => {
						if (org && roleId) return getApplicants(org, roleId);
					}}
					data={row.original as any}
				/>
			),
			size: 80
		}
	];

	useEffect(() => {
		if (org && roleId) getApplicants(org, roleId);
	}, [getApplicants, org, roleId]);

	const table = useReactTable({
		data,
		columns: columns as any,
		getCoreRowModel: getCoreRowModel()
	});

	return (
		<tr>
			<td colSpan={7} className="border-b pl-8">
				<Table>
					<TableHeader className="">
						{table.getHeaderGroups().map(headerGroup => (
							<TableRow key={headerGroup.id} className="!border-b">
								{headerGroup.headers.map(header => {
									return (
										<TableHead style={{ width: header.column.getSize() }} className="text-xs" key={header.id}>
											{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{!isLoading ? (
							table.getRowModel().rows?.length ? (
								// table has data
								table.getRowModel().rows.map(row => (
									<TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className="cursor-pointer">
										{row.getVisibleCells().map(cell => (
											<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
										))}
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={columns.length} className="h-24 text-center">
										No results.
									</TableCell>
								</TableRow>
							)
						) : (
							<TableRow>
								<TableCell className="">
									<Skeleton className="h-5 w-5" />
								</TableCell>
								<TableCell className="">
									<Skeleton className="h-9 w-56" />
								</TableCell>
								<TableCell className="">
									<Skeleton className="h-6 w-32" />
								</TableCell>
								<TableCell className="">
									<Skeleton className="h-5 w-20" />
								</TableCell>
								<TableCell className="">
									<Skeleton className="h-4 w-16" />
								</TableCell>
								<TableCell className="">
									<Skeleton className="h-4 w-12" />
								</TableCell>
								<TableCell className="">
									<Skeleton className="h-4 w-12" />
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</td>
		</tr>
	);
};
