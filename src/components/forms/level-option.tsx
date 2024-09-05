import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { TablesInsert } from '@/type/database.types';
import { useCallback, useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Input } from '@/components/ui/input';

interface props {
	form: UseFormReturn<any>;
	selectedLevelId: string;
	setLevelDetails: (level: TablesInsert<'employee_levels'> | undefined) => void;
	orgJobLevels: TablesInsert<'employee_levels'>[];
	isManual?: boolean;
	setManualSystem?: (state: boolean) => void;
}

export const SelectLevel = ({ form, setLevelDetails, selectedLevelId, orgJobLevels, isManual, setManualSystem }: props) => {
	const [isLevelsOpen, toggleLevelsDropdown] = useState(false);
	const [levelQuery, setLevelQuery] = useState('');
	const [jobLevels] = useState(levels);
	const [isInitialActiveLevelSet, setInitialActiveLevel] = useState(false);

	const getOrgLevels = useCallback(async () => {
		const activeLevel = orgJobLevels?.find(level => level.id == Number(selectedLevelId));

		if (!isInitialActiveLevelSet && activeLevel) {
			setLevelDetails(activeLevel);
			setInitialActiveLevel(true);
		}
	}, [isInitialActiveLevelSet, selectedLevelId, setLevelDetails, orgJobLevels]);

	useEffect(() => {
		getOrgLevels();
	}, [getOrgLevels]);

	const onSelectLevelFromOrgLevels = (level: TablesInsert<'employee_levels'>) => {
		form.setValue('level', String(level.id));
		toggleLevelsDropdown(false);

		// update fixed income with level's value
		const formFixedAllowance = form.getValues('fixed_allowance');
		let fixedAllowance: any[] = [];
		if (formFixedAllowance) fixedAllowance = [...formFixedAllowance];
		if (level?.fixed_allowance) fixedAllowance = [...level.fixed_allowance];
		form.setValue('fixed_allowance', fixedAllowance as any[]);

		// set salary, if salary is empty
		const salary = form.getValues('salary');
		if (!salary && level?.min_salary) form.setValue('salary', String(level?.min_salary));

		// set signing bonus if empty
		const signingBonus = form.getValues('signing_bonus');
		const signingBonusFromLevel = level.min_signing_bonus;
		if (!signingBonus && signingBonusFromLevel) form.setValue('signing_bonus', String(signingBonusFromLevel));

		// while updating active level details, make sure to use updated fixed allowance
		setLevelDetails({ ...level, fixed_allowance: fixedAllowance });
	};

	return (
		<>
			{!isManual && (
				<FormField
					control={form.control}
					name="level"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center justify-between">
								Employee level
								<Link className="inline-flex items-center gap-1 rounded-md bg-accent px-1 py-px text-[10px] text-muted-foreground" href={'../settings?type=org#levels'}>
									Manage levels
									<ArrowUpRight size={12} />
								</Link>
							</FormLabel>
							<Popover open={isLevelsOpen} onOpenChange={toggleLevelsDropdown}>
								<PopoverTrigger asChild>
									<FormControl>
										<Button variant="outline" role="combobox" className={cn('w-full justify-between bg-input-bg', !field.value && 'text-muted-foreground')}>
											{orgJobLevels.find(level => level.id == Number(field.value))?.level || jobLevels.find(level => level.id == field.value)?.level || `Select seniority level`}
											<ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
										</Button>
									</FormControl>
								</PopoverTrigger>

								<PopoverContent align="start" className="w-[200px] p-0">
									<Command>
										<CommandInput placeholder="Enter seniority level..." value={levelQuery} onValueChange={(value: string) => setLevelQuery(value)} />

										<CommandList>
											<CommandEmpty className="p-1">
												<p className="flex-initial py-4 text-center text-xs text-muted-foreground">
													Level does not exist{' '}
													<Link className="inline-flex items-center gap-1 rounded-md bg-accent px-1 py-px text-[10px] text-muted-foreground" href={'../settings?type=org#levels'}>
														create it
														<ArrowUpRight size={12} />
													</Link>
												</p>
											</CommandEmpty>

											{orgJobLevels.length > 0 && (
												<CommandGroup>
													{orgJobLevels.map((level, index) => (
														<CommandItem className="gap-2" value={String(level.id)} key={index} onSelect={() => onSelectLevelFromOrgLevels(level)}>
															<div className="flex items-center">
																<Check className={cn('mr-2 h-3 w-3', String(level.id) === field.value ? 'opacity-100' : 'opacity-0')} />
																{level.level}
															</div>
															• <div className="text-left text-xs text-muted-foreground">{level.role}</div>
														</CommandItem>
													))}
												</CommandGroup>
											)}
										</CommandList>
									</Command>
								</PopoverContent>
							</Popover>

							<FormDescription>
								<button type="button" className="inline-flex items-center rounded-md bg-accent px-1 text-[10px]" onClick={() => setManualSystem && setManualSystem(true)}>
									Use manual level system
								</button>
							</FormDescription>

							<FormMessage />
						</FormItem>
					)}
				/>
			)}

			{isManual && (
				<FormField
					control={form.control}
					name="level_name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Employee level</FormLabel>
							<FormControl>
								<Input placeholder="IC Level 1, Senior, Junior..." {...field} />
							</FormControl>
							<FormMessage />

							<FormDescription>
								<button type="button" className="inline-flex items-center rounded-md bg-accent px-1 text-[10px]" onClick={() => setManualSystem && setManualSystem(false)}>
									Use employee band system
								</button>
							</FormDescription>
						</FormItem>
					)}
				/>
			)}
		</>
	);
};

const levels = [
	{ id: 'fks', level: 'IC Level 1', role: 'Entry', min_salary: 0, max_salary: 0 },
	{ id: 'ldb', level: 'IC Level 2', role: 'Mid I', min_salary: 0, max_salary: 0 },
	{ id: 'jff', level: 'IC Level 3', role: 'Mid II', min_salary: 0, max_salary: 0 },
	{ id: 'dfu', level: 'IC Level 4', role: 'Mid II', min_salary: 0, max_salary: 0 },
	{ id: 'oia', level: 'IC Level 5', role: 'Senior I', min_salary: 0, max_salary: 0 },
	{ id: 'ejd', level: 'IC Level 6', role: 'Senior II', min_salary: 0, max_salary: 0 },
	{ id: 'fou', level: 'IC Level 7', role: 'Staff', min_salary: 0, max_salary: 0 },
	{ id: 'elj', level: 'IC Level 8', role: 'Principal', min_salary: 0, max_salary: 0 },
	{ id: 'euw', level: 'IC Level 9', role: 'VP', min_salary: 0, max_salary: 0 },
	{ id: 'ale', level: 'IC Level 10', role: 'Executive', min_salary: 0, max_salary: 0 }
];
