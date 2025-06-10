'use client';

import { Tables } from '@/type/database.types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, X, Users, User } from 'lucide-react';
import { useState, useRef } from 'react';
import { ContractWithProfile } from '@/dal/interfaces/contract.repository.interface';

interface MultiTargetSelectProps {
	teams: Tables<'teams'>[];
	employees: ContractWithProfile[];
	value: string[];
	onChange: (value: string[]) => void;
	className?: string;
}

export function MultiTargetSelect({ teams, employees, value, onChange, className }: MultiTargetSelectProps) {
	const [open, setOpen] = useState(false);
	const [inputValue, setInputValue] = useState('');
	const inputRef = useRef<HTMLInputElement>(null);

	// Parse selected teams and employees
	const selectedTeams = value.filter(v => v.startsWith('team-')).map(id => id.replace('team-', ''));
	const selectedEmployees = value.filter(v => v.startsWith('emp-')).map(id => id.replace('emp-', ''));

	const filteredTeams = teams.filter(team => !selectedTeams.includes(team.id.toString()) && team.name.toLowerCase().includes(inputValue.toLowerCase()));
	const filteredEmployees = employees.filter(
		emp => !selectedEmployees.includes(String(emp.id)) && (`${emp.profile?.first_name} ${emp.profile?.last_name}`.toLowerCase().includes(inputValue.toLowerCase()) || (emp.profile?.email && emp.profile?.email.toLowerCase().includes(inputValue.toLowerCase())))
	);

	const handleSelect = (id: string) => {
		if (!value.includes(id)) {
			onChange([...value, id]);
		}
		setInputValue('');
		inputRef.current?.focus();
	};

	const handleRemove = (id: string) => {
		onChange(value.filter(v => v !== id));
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
						{value.map(id => {
							if (id.startsWith('team-')) {
								const team = teams.find(t => t.id.toString() === id.replace('team-', ''));
								if (!team) return null;
								return (
									<Badge key={id} variant="secondary" className="flex items-center gap-1">
										<Users size={12} className="mr-1" />
										{team.name}
										<X
											className="h-3 w-3 cursor-pointer"
											onClick={e => {
												e.stopPropagation();
												handleRemove(id);
											}}
										/>
									</Badge>
								);
							} else if (id.startsWith('emp-')) {
								const emp = employees.find(e => e.id === Number(id.replace('emp-', '')));
								if (!emp) return null;
								return (
									<Badge key={id} variant="outline" className="flex items-center gap-1">
										<User size={12} className="mr-1" />
										{emp.profile?.first_name} {emp.profile?.last_name}
										<X
											className="h-3 w-3 cursor-pointer"
											onClick={e => {
												e.stopPropagation();
												handleRemove(id);
											}}
										/>
									</Badge>
								);
							}
							return null;
						})}
						<input ref={inputRef} value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={handleKeyDown} className="flex-1 bg-transparent outline-none" placeholder={value.length === 0 ? 'Select teams or employees...' : ''} />
					</div>
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent align="start" className="w-full p-0">
				<Command>
					<CommandInput value={inputValue} onValueChange={setInputValue} placeholder="Search teams or employees..." />
					<CommandEmpty>No team or employee found.</CommandEmpty>
					<CommandGroup heading="Teams">
						{filteredTeams.length === 0 && <div className="px-2 py-1 text-xs text-muted-foreground">No teams</div>}
						{filteredTeams.map(team => (
							<CommandItem key={team.id} onSelect={() => handleSelect('team-' + team.id)}>
								<Check className={cn('mr-2 h-4 w-4', value.includes('team-' + team.id) ? 'opacity-100' : 'opacity-0')} />
								<Users size={12} className="mr-1" />
								{team.name}
							</CommandItem>
						))}
					</CommandGroup>
					<CommandGroup heading="Employees">
						{filteredEmployees.length === 0 && <div className="px-2 py-1 text-xs text-muted-foreground">No employees</div>}
						{filteredEmployees.map(emp => (
							<CommandItem key={emp.id} onSelect={() => handleSelect('emp-' + emp.id)}>
								<Check className={cn('mr-2 h-4 w-4', value.includes('emp-' + emp.id) ? 'opacity-100' : 'opacity-0')} />
								<User size={12} className="mr-1" />
								{emp.profile?.first_name} {emp.profile?.last_name} {emp.profile?.email && <span className="ml-1 text-xs text-muted-foreground">({emp.profile?.email})</span>}
							</CommandItem>
						))}
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
