'use client';

import { Tables } from '@/type/database.types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface MultiTeamSelectProps {
	teams: Tables<'teams'>[];
	value: string[];
	onChange: (value: string[]) => void;
	className?: string;
}

export function MultiTeamSelect({ teams, value, onChange, className }: MultiTeamSelectProps) {
	const [open, setOpen] = useState(false);
	const [inputValue, setInputValue] = useState('');
	const inputRef = useRef<HTMLInputElement>(null);

	const selectedTeams = teams.filter(team => value.includes(team.id.toString()));
	const filteredTeams = teams.filter(team => !value.includes(team.id.toString()) && team.name.toLowerCase().includes(inputValue.toLowerCase()));

	const handleSelect = (teamId: string) => {
		onChange([...value, teamId]);
		setInputValue('');
		inputRef.current?.focus();
	};

	const handleRemove = (teamId: string) => {
		onChange(value.filter(id => id !== teamId));
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
			handleRemove(value[value.length - 1]);
		}
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" role="combobox" aria-expanded={open} className={cn('w-full justify-between', className)}>
					<div className="flex flex-wrap gap-1">
						{selectedTeams.map(team => (
							<Badge key={team.id} variant="secondary" className="flex items-center gap-1">
								{team.name}
								<X
									className="h-3 w-3 cursor-pointer"
									onClick={e => {
										e.stopPropagation();
										handleRemove(team.id.toString());
									}}
								/>
							</Badge>
						))}
						<input ref={inputRef} value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={handleKeyDown} className="flex-1 bg-transparent outline-none" placeholder={value.length === 0 ? 'Select teams...' : ''} />
					</div>
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>

			<PopoverContent align="start" className="w-full p-0">
				<Command>
					<CommandInput value={inputValue} onValueChange={setInputValue} placeholder="Search teams..." />
					<CommandEmpty>No team found.</CommandEmpty>
					<CommandGroup>
						{filteredTeams.map(team => (
							<CommandItem key={team.id} onSelect={() => handleSelect(team.id.toString())}>
								<Check className={cn('mr-2 h-4 w-4', value.includes(team.id.toString()) ? 'opacity-100' : 'opacity-0')} />
								{team.name}
							</CommandItem>
						))}
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
