import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { TablesInsert } from '@/type/database.types';
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface props {
	form: UseFormReturn<any>;
	selectedLevelId: string;
	setLevelDetails: (data: { level: TablesInsert<'employee_levels'>; isOrgs: boolean } | undefined) => void;
	orgJobLevels: TablesInsert<'employee_levels'>[];
	updateOrgJobLevels: Dispatch<SetStateAction<TablesInsert<'employee_levels'>[]>>;
}

export const SelectLevel = ({ form, setLevelDetails, selectedLevelId, orgJobLevels, updateOrgJobLevels }: props) => {
	const [isLevelsOpen, toggleLevelsDropdown] = useState(false);
	const [levelQuery, setLevelQuery] = useState('');
	const [jobLevels] = useState(levels);
	const [isInitialActiveLevelSet, setInitialActiveLevel] = useState(false);

	const getOrgLevels = useCallback(async () => {
		const activeLevel = orgJobLevels?.find(level => level.id == Number(selectedLevelId));

		if (!isInitialActiveLevelSet && activeLevel) {
			setLevelDetails({ level: activeLevel, isOrgs: true });
			setInitialActiveLevel(true);
		}
	}, [isInitialActiveLevelSet, selectedLevelId, setLevelDetails]);

	useEffect(() => {
		getOrgLevels();
	}, [getOrgLevels, orgJobLevels, form]);

	const onSelectLevelFromOrgLevels = (level: TablesInsert<'employee_levels'>, isOrgs: boolean = true) => {
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
		setLevelDetails({ level: { ...level, fixed_allowance: fixedAllowance }, isOrgs });
	};

	return (
		<FormField
			control={form.control}
			name="level"
			render={({ field }) => (
				<FormItem>
					<FormLabel>Level</FormLabel>
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
									<CommandEmpty
										onClick={() => {
											const level = { level: levelQuery, min_salary: 0, max_salary: 0, org: '', id: (orgJobLevels.length + 1) * 1000000 };
											updateOrgJobLevels([...orgJobLevels, level]);
											setLevelQuery('');
											onSelectLevelFromOrgLevels(level, false);
										}}
										className="p-1">
										<div className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-xs font-light outline-none">
											<Check className={cn('mr-2 h-4 w-4', levelQuery && levelQuery === field.value ? 'opacity-100' : 'opacity-0')} />
											{levelQuery}
										</div>
									</CommandEmpty>

									{orgJobLevels.length > 0 && (
										<CommandGroup heading="Active Org Levels">
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

									<CommandGroup heading="Suggested Org Levels">
										{jobLevels.map((level, index) => (
											<CommandItem className="gap-2" value={level.id} key={index} onSelect={() => onSelectLevelFromOrgLevels(level as any, false)}>
												<div className="flex items-center">
													<Check className={cn('mr-2 h-3 w-3', level.id === field.value ? 'opacity-100' : 'opacity-0')} />
													{level.level}
												</div>
												• <div className="text-left text-xs text-muted-foreground">{level.role}</div>
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>

					<FormDescription>
						Create and edit levels{' '}
						<Link className="inline-flex items-center rounded-md bg-accent px-1" href={'../settings?type=org#levels'}>
							here <ArrowUpRight size={12} />
						</Link>
					</FormDescription>

					<FormMessage />
				</FormItem>
			)}
		/>
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
