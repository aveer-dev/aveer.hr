'use client';

import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { CONTRACT } from '@/type/contract.types';
import { useState } from 'react';
import { ContractOverview } from './contract-overview';
import { Tables } from '@/type/database.types';
import { cn } from '@/lib/utils';

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	action?: () => void;
}

export function ContractorTable<TData, TValue>({ columns, data, action }: DataTableProps<TData, TValue>) {
	const [isOverviewOpen, toggleOverview] = useState(false);
	const [activeContract, setActiveContract] = useState<Tables<'contracts'>>();

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel()
	});

	return (
		<div className="">
			{isOverviewOpen && <ContractOverview isOpen={isOverviewOpen} toggle={toggleOverview} data={activeContract} />}

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
					{table.getRowModel().rows?.length ? (
						// table has data
						table.getRowModel().rows.map(row => (
							<TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} tabIndex={0}>
								{row.getVisibleCells().map(cell => (
									<TableCell key={cell.id} className={cn('cursor-pointer p-0')}>
										<Link className="block p-4" href={`/${(row.original as CONTRACT).org.subdomain}/${(row.original as CONTRACT).id}`} as={`/employee/${(row.original as CONTRACT).org.subdomain}/${(row.original as CONTRACT).id}`}>
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
					)}
				</TableBody>
			</Table>
		</div>
	);
}
