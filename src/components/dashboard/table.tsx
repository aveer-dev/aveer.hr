'use client';

import { ColumnDef, flexRender, getCoreRowModel, Row, useReactTable } from '@tanstack/react-table';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { NavLink } from '../ui/link';
import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';

import { ApplicantsSubTable } from '../open-role/roles/applicants-sub-table';

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	subColumns?: string;
	loading?: boolean;
	org?: string;
	link?: string;
}

export function DataTable<TData, TValue>({ columns, data, org, loading, subColumns, link }: DataTableProps<TData, TValue>) {
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
		<div className="w-7xl overflow-hidden">
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

const TableContent = ({ row, org, subColumns, link }: { row: Row<any>; org?: string; subColumns?: string; link?: string }) => {
	const [showSubColumn, setSubColumnState] = useState(false);
	return (
		<>
			<TableRow className={cn(subColumns && 'cursor-pointer', showSubColumn && 'bg-muted/50')} data-state={row.getIsSelected() && 'selected'} onClick={() => subColumns && setSubColumnState(!showSubColumn)}>
				{row.getVisibleCells().map((cell, index) => (
					<TableCell key={cell.id} className={cn(link && 'p-0', 'whitespace-nowrap')}>
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

			{subColumns && showSubColumn && <ApplicantsSubTable org={org} roleId={row.original.id}></ApplicantsSubTable>}
		</>
	);
};
