import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { TablesInsert } from '@/type/database.types';
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

interface props {
	form: UseFormReturn<any>;
	org: string;
	setLevelDetails: Dispatch<SetStateAction<{ level: TablesInsert<'employee_levels'>; isOrgs: boolean } | undefined>>;
}
const supabase = createClient();

export const SelectLevel = ({ form, org, setLevelDetails }: props) => {
	const [isLevelsOpen, toggleLevelsDropdown] = useState(false);
	const [levelQuery, setLevelQuery] = useState('');
	const [jobLevels] = useState(levels);
	const [orgJobLevels, updateOrgJobLevels] = useState<TablesInsert<'employee_levels'>[]>([]);

	const getOrgLevels = useCallback(async () => {
		const { data, error } = await supabase.from('employee_levels').select().match({ org: org });
		if (error) toast.error('🫤 Error', { description: `Unable to fetch existing org levels ${error.message}` });
		if (data?.length) updateOrgJobLevels(data);

		const activeLevel = data?.find(level => level.id == form.getValues('level'));
		if (activeLevel) setLevelDetails({ level: activeLevel, isOrgs: true });
	}, [org]);

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

		setLevelDetails({ level: level, isOrgs: true });
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
						<PopoverContent className="w-[200px] p-0">
							<Command>
								<CommandInput placeholder="Enter seniority level..." value={levelQuery} onValueChange={(value: string) => setLevelQuery(value)} />
								<CommandList>
									<CommandEmpty
										onClick={() => {
											const newId = orgJobLevels.length + 12;
											updateOrgJobLevels([...orgJobLevels, { level: levelQuery, min_salary: 0, max_salary: 0, org: '', id: newId }]);
											form.setValue('level', String(newId));
											setLevelQuery('');
											toggleLevelsDropdown(false);
										}}
										className="p-1">
										<div className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-xs font-light outline-none">
											<Check className={cn('mr-2 h-4 w-4', levelQuery && levelQuery === field.value ? 'opacity-100' : 'opacity-0')} />
											{levelQuery}
										</div>
									</CommandEmpty>
									{orgJobLevels.length > 0 && (
										<CommandGroup heading="Active Org Levels">
											{orgJobLevels.map(level => (
												<CommandItem className="gap-2" value={String(level.id)} key={level.level} onSelect={() => onSelectLevelFromOrgLevels(level)}>
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
										{jobLevels.map(level => (
											<CommandItem
												className="gap-2"
												value={level.id}
												key={level.id}
												onSelect={() => {
													form.setValue('level', level.id);
													toggleLevelsDropdown(false);
												}}>
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
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};

const levels = [
	{ id: 'fks', level: 'IC Level 1', role: 'Entry', min_salary: 50000, max_salary: 50000 },
	{ id: 'ldb', level: 'IC Level 2', role: 'Mid I', min_salary: 72000, max_salary: 50000 },
	{ id: 'jff', level: 'IC Level 3', role: 'Mid II', min_salary: 92000, max_salary: 50000 },
	{ id: 'dfu', level: 'IC Level 4', role: 'Mid II', min_salary: 110000, max_salary: 50000 },
	{ id: 'oia', level: 'IC Level 5', role: 'Senior I', min_salary: 160000, max_salary: 50000 },
	{ id: 'ejd', level: 'IC Level 6', role: 'Senior II', min_salary: 180000, max_salary: 50000 },
	{ id: 'fou', level: 'IC Level 7', role: 'Staff', min_salary: 240000, max_salary: 50000 },
	{ id: 'elj', level: 'IC Level 8', role: 'Principal', min_salary: 280000, max_salary: 50000 },
	{ id: 'euw', level: 'IC Level 9', role: 'VP', min_salary: 350000, max_salary: 50000 },
	{ id: 'ale', level: 'IC Level 10', role: 'Executive', min_salary: 400000, max_salary: 50000 }
];
