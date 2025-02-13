'use client';

import { ColumnDef, flexRender, getCoreRowModel, Row, useReactTable } from '@tanstack/react-table';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { NavLink } from '@/components/ui/link';

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	loading?: boolean;
	org?: string;
	link?: string;
}

export function DataTable<TData, TValue>({ columns, data, org, loading, link }: DataTableProps<TData, TValue>) {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		initialState: {
			columnPinning: {
				left: ['select', 'name'],
				right: []
			}
		}
	});

	return (
		<div className="w-full overflow-hidden">
			<Table className="max-w-7xl" style={{ width: `min(100%, 80rem)` }}>
				<TableHeader>
					{table.getHeaderGroups().map(headerGroup => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map(header => {
								return (
									<TableHead className="whitespace-nowrap" style={{ width: header.getSize() }} key={header.id}>
										{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
									</TableHead>
								);
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{!loading ? (
						table.getRowModel().rows?.length ? (
							// table has data
							table.getRowModel().rows.map(row => <TableContent key={row.id} row={row} link={link} org={org} />)
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

const TableContent = ({ row, org, link }: { row: Row<any>; org?: string; link?: string }) => {
	return (
		<>
			<TableRow data-state={row.getIsSelected() && 'selected'}>
				{row.getVisibleCells().map(cell => (
					<TableCell key={cell.id} className={cn(link && 'p-0', 'whitespace-nowrap')}>
						{link ? (
							<NavLink org={org} scroll={true} className="block p-4" href={`${link}/${row.original.id}`}>
								{flexRender(cell.column.columnDef.cell, cell.getContext())}
							</NavLink>
						) : (
							flexRender(cell.column.columnDef.cell, cell.getContext())
						)}
					</TableCell>
				))}
			</TableRow>
		</>
	);
};
