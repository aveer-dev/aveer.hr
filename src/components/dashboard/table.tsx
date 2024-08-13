'use client';

import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '../ui/skeleton';
import Link from 'next/link';
import { PERSON } from '@/type/person';

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	loading?: boolean;
	orgId: string;
}

export function DataTable<TData, TValue>({ columns, data, orgId, loading }: DataTableProps<TData, TValue>) {
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
							table.getRowModel().rows.map(row => (
								<TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
									{row.getVisibleCells().map(cell => (
										<TableCell key={cell.id} className="p-0">
											<Link scroll={true} className="block p-4" href={`/${orgId}/people/${(row.original as PERSON).id}`}>
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</Link>
										</TableCell>
									))}
								</TableRow>
							))
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
