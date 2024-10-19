'use client';

import { badgeVariants } from '@/components/ui/badge';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Tables } from '@/type/database.types';
import { CircleX } from 'lucide-react';
import { useState } from 'react';

interface props {
	contracts: Tables<'contracts'>[];
}

export const ContractsFilter = ({ contracts }: props) => {
	const [activeContract, setActiveContract] = useState<Tables<'contracts'> | null>(contracts.length > 0 ? contracts[0] : null);

	return (
		<Select
			defaultOpen
			value={String(activeContract?.id)}
			onValueChange={value => {
				setActiveContract(contracts.find(contract => String(contract.id) === value) || null);
			}}>
			<div className="relative">
				<SelectTrigger className="h-[unset] w-fit rounded-full border-none bg-transparent p-0 [&_>_svg]:hidden">
					<div className={cn(badgeVariants({ variant: 'secondary' }), 'flex h-fit gap-1 bg-transparent p-0 font-light hover:bg-transparent')}>
						<div className="rounded-full rounded-e-none bg-secondary px-3 py-2">Contracts</div>
						<div className={cn('flex items-center gap-3 rounded-full rounded-s-none bg-secondary px-3 py-2', !activeContract && 'text-muted-foreground')}>
							<SelectValue placeholder="Select a contract" />
							<div className="h-3 w-3"></div>
						</div>
					</div>
				</SelectTrigger>

				{activeContract && (
					<button
						className="absolute right-3 top-1/2 -translate-y-1/2"
						onClick={() => {
							setActiveContract(null);
						}}>
						<CircleX size={14} className="stroke-1" />
					</button>
				)}
			</div>

			<SelectContent>
				<SelectGroup>
					{contracts.map(contract => (
						<SelectItem key={contract.id} value={String(contract.id)}>
							{contract.job_title} - {(contract.org as unknown as Tables<'organisations'>).name}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
};
