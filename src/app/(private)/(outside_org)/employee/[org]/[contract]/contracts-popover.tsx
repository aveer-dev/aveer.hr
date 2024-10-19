'use client';

import { Button } from '@/components/ui/button';
import { Check, EllipsisVertical } from 'lucide-react';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tables } from '@/type/database.types';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

export const ContractsPopover = ({ contracts, contractId }: { contracts: Tables<'contracts'>[]; contractId: string }) => {
	const [open, setOpen] = useState(false);

	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === 'j' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen(open => !open);
			}
		};

		document.addEventListener('keydown', down);
		return () => document.removeEventListener('keydown', down);
	}, []);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" className="h-12 w-12 rounded-full bg-background shadow-md transition-all duration-500">
					<EllipsisVertical size={16} />
				</Button>
			</PopoverTrigger>

			<PopoverContent align="start" sideOffset={10} className="w-56 p-1">
				<Command>
					<CommandList>
						<CommandGroup>
							{contracts.map(contract => (
								<CommandItem key={contract.id} value={String(contract.id)} asChild>
									<Link href={`../../${(contract.org as any)?.subdomain}/${contract.id}/home`}>
										<Check className={cn('mr-2 h-4 w-4', contractId === String(contract.id) ? 'opacity-100' : 'opacity-0')} />
										{(contract.org as any)?.name} - {contract.job_title}
									</Link>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
};
