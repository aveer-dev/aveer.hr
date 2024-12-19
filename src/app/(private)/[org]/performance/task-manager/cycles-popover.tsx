'use client';

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PLANE_CYCLE } from './plane.types';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { searchCycle } from './cycle-search';
import { usePathname, useRouter } from 'next/navigation';

export const CyclesPopover = ({ cycles, activeCycle }: { activeCycle?: PLANE_CYCLE; cycles: PLANE_CYCLE[] }) => {
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState(activeCycle);
	const [filteredCycles, setFilteredCycles] = useState<PLANE_CYCLE[]>(cycles);
	const router = useRouter();
	const pathname = usePathname();

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="secondary" role="combobox" aria-expanded={open} className="gap-4">
					{value?.name}
					<ChevronDown size={12} className="scale-150" />
				</Button>
			</PopoverTrigger>

			<PopoverContent side="right" align="start" className="w-[200px] p-0">
				<Command shouldFilter={false}>
					<CommandInput
						placeholder="Search cycles..."
						onValueChange={value => {
							const result = searchCycle(cycles, value, ['name']);
							setFilteredCycles(result);
						}}
					/>
					<CommandList>
						<CommandEmpty>No cycle found.</CommandEmpty>
						<CommandGroup>
							{filteredCycles.map(cycle => (
								<CommandItem
									key={cycle.id}
									value={cycle.id}
									onSelect={currentValue => {
										router.push(`${pathname}/?cycle=${cycle.id}`);
										setValue(filteredCycles.find(item => item.id === currentValue) as any);
										setOpen(false);
									}}>
									{cycle.name}
									<Check size={12} className={cn('ml-auto', value?.id === cycle.id ? 'opacity-100' : 'opacity-0')} />
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
};
