'use client';

import { Check } from 'lucide-react';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Tables } from '@/type/database.types';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export const ContractsPopover = ({ contracts, contractId, open, setOpen }: { contracts: Tables<'contracts'>[]; contractId: string; open: boolean; setOpen: (open: boolean) => void }) => {
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent>
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
			</DialogContent>
		</Dialog>
	);
};
