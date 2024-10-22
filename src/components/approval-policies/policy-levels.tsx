import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { formSchema, LEVEL } from './types';
import { z } from 'zod';
import { Check, ChevronsUpDown, CircleMinus, Grip } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface employee {
	id: number;
	job_title: string;
	profile: {
		first_name: string;
		last_name: string;
	};
}

export const PolicyLevels = ({ index, form, levels, updateLevels, employees, level, id }: { id: number; updateLevels: (levels: LEVEL[]) => void; employees: employee[]; levels: LEVEL[]; level: LEVEL; index: number; form: UseFormReturn<z.infer<typeof formSchema>> }) => {
	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition
	};

	const employeeTypes = [
		{ label: 'Admins', type: 'admin' },
		{ label: 'Manager', type: 'manager' },
		{ label: 'Employee', type: 'employee' }
	];

	return (
		<div id={level.level + 'dd'} ref={setNodeRef} style={style} className="space-y-8">
			<FormField
				control={form.control}
				key={index}
				name={`levels.${index}`}
				render={() => (
					<FormItem key={index} className="mt-4 space-y-4 rounded-md bg-accent p-2">
						<FormLabel className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<button type="button" {...attributes} {...listeners}>
									<Grip size={12} />
								</button>
								<h3 className="text-sm font-semibold text-muted-foreground">Level {index + 1}</h3>
							</div>

							<Button
								type="button"
								variant={'ghost_destructive'}
								onClick={() => {
									levels.splice(index, 1);
									updateLevels([...levels]);

									const formLevels = form.getValues('levels');
									formLevels.splice(index, 1);
									form.setValue('levels', formLevels);
								}}
								className="h-6 w-6 p-0">
								<CircleMinus size={12} />
							</Button>
						</FormLabel>

						<div className="space-y-6">
							<FormField
								control={form.control}
								name={`levels.${index}.type`}
								render={() => (
									<FormItem className="flex w-full flex-col">
										<FormLabel>Employee type</FormLabel>

										<Popover
											open={level.isopen}
											onOpenChange={state => {
												level.isopen = state;
												levels[index] = level;
												updateLevels([...levels]);
											}}>
											<PopoverTrigger asChild>
												<FormControl>
													<Button variant="outline" role="combobox" className={cn('w-full justify-between bg-input-bg', !form.getValues(`levels.${index}.type`) && 'text-muted-foreground')}>
														{form.getValues(`levels.${index}.type`) ? employeeTypes.find(type => type.type === form.getValues(`levels.${index}.type`))?.label : 'Select employee type'}
														<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
													</Button>
												</FormControl>
											</PopoverTrigger>

											<PopoverContent className="w-[300px] p-0">
												<Command>
													<CommandList>
														<CommandGroup>
															{employeeTypes.map((type, idx) => (
																<CommandItem
																	key={idx}
																	value={type.type}
																	onSelect={value => {
																		form.setValue(`levels.${index}.type`, value);
																		if (value !== 'employee') form.setValue(`levels.${index}.id`, '');

																		levels[index] = { ...levels[index], type: value, isopen: false };
																		updateLevels([...levels]);
																	}}>
																	<Check className={cn('mr-2 h-4 w-4', type.type === form.getValues(`levels.${index}.type`) ? 'opacity-100' : 'opacity-0')} />
																	{type.label}
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

							{levels[index].type == 'employee' && (
								<FormField
									control={form.control}
									name={`levels.${index}.id`}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Employee</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select an employee" />
													</SelectTrigger>
												</FormControl>

												<SelectContent>
													{employees.map(employee => (
														<SelectItem key={employee.id} value={String(employee.id)}>
															{(employee.profile as any)?.first_name} {(employee.profile as any)?.last_name} • {employee.job_title}
														</SelectItem>
													))}
												</SelectContent>
											</Select>

											<FormMessage />
										</FormItem>
									)}
								/>
							)}
						</div>

						<FormMessage />
					</FormItem>
				)}
			/>
		</div>
	);
};
