'use client';

import { ColumnDef, flexRender, getCoreRowModel, Row, useReactTable } from '@tanstack/react-table';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '../ui/skeleton';
import { PERSON } from '@/type/person';
import { cn } from '@/lib/utils';
import { NavLink } from '../ui/link';
import { Tables } from '@/type/database.types';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';

interface DataTableProps<TData, TValue, TSubData, TSubValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	subColumns?: ColumnDef<TSubData, TSubValue>[];
	subData?: TData[];
	loading?: boolean;
	org?: string;
	link?: string;
}

const supabase = createClient();

export function DataTable<TData, TValue, TSubData, TSubValue>({ columns, data, org, loading, subColumns, subData, link }: DataTableProps<TData, TValue, TSubData, TSubValue>) {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel()
	});

	return (
		<div className="">
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map(headerGroup => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map(header => {
								return <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>;
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{!loading ? (
						table.getRowModel().rows?.length ? (
							// table has data
							table.getRowModel().rows.map(row => <TableContent subColumns={subColumns} key={row.id} row={row} link={link} org={org} />)
						) : (
							// table data is empty
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center">
									No results.
								</TableCell>
							</TableRow>
						)
					) : (
						// table is loading
						<>
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
						</>
					)}
				</TableBody>
			</Table>
		</div>
	);
}

const TableContent = ({ row, org, subColumns, link }: { row: Row<any>; org?: string; subColumns: any; link?: string }) => {
	const [showSubColumn, setSubColumnState] = useState(false);
	return (
		<>
			<TableRow className={cn(subColumns && 'cursor-pointer', showSubColumn && 'bg-muted')} data-state={row.getIsSelected() && 'selected'} onClick={() => setSubColumnState(!showSubColumn)}>
				{row.getVisibleCells().map((cell, index) => (
					<TableCell key={cell.id} className={cn(link && 'p-0')}>
						{link ? (
							<NavLink org={org} scroll={true} className="block p-4" href={`${link}/${row.original.id}`}>
								{flexRender(cell.column.columnDef.cell, cell.getContext())}
							</NavLink>
						) : (
							<div className="flex items-center gap-3">
								{flexRender(cell.column.columnDef.cell, cell.getContext())}
								{index == 0 && subColumns && (
									<Button variant={'ghost'} size={'icon'}>
										<ChevronRight size={14} className={cn(showSubColumn ? 'rotate-90' : '', 'transition-all')} />
									</Button>
								)}
							</div>
						)}
					</TableCell>
				))}
			</TableRow>

			{subColumns && showSubColumn && <SubTable org={org} roleId={row.original.id} columns={subColumns}></SubTable>}
		</>
	);
};

function SubTable<TData, TValue>({ columns, org, roleId }: { columns: ColumnDef<TData, TValue>[]; org?: string; roleId: number }) {
	const [data, setData] = useState<TData[]>([]);
	const [isLoading, setLoadingState] = useState(true);

	useEffect(() => {
		const getApplicants = async (org: string, roleId: number) => {
			setLoadingState(true);
			const { data, error } = await supabase.from('job_applications').select('*, country_location:countries!job_applications_country_location_fkey(name, country_code), role:open_roles!job_applications_role_fkey(job_title, id)').match({ org, role: roleId });
			setLoadingState(false);
			if (data) setData(data as any);
		};

		if (org && roleId) getApplicants(org, roleId);
	}, [org, roleId, setData, setLoadingState]);

	const table = useReactTable({
		data,
		columns,
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
										<TableHead className="text-xs" key={header.id}>
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
}
