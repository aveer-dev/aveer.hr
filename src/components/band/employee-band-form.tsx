'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tables, TablesInsert, TablesUpdate } from '@/type/database.types';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Check, ChevronDown, ChevronRight, Info, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MinMaxPay } from '@/components/forms/min-max-pay';
import { AdditionalOffering } from '@/components/forms/additional-offering';
import { FixedAllowance } from '@/components/forms/fixed-allowance';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useFormStatus } from 'react-dom';
import { LoadingSpinner } from '@/components/ui/loader';
import { useRouter } from 'next/navigation';
import { DeleteBandDialog } from './delete-band-dialog';

const formSchema = z.object({
	level: z.string(),
	role: z.string().optional(),
	salary: z
		.object({
			min: z.number().positive(),
			max: z.number().positive()
		})
		.refine(salary => salary.min < salary.max, { message: 'Max salary must be higher than min salary' }),
	signing_bonus: z
		.object({
			min: z.number().positive().optional().nullable(),
			max: z.number().positive().optional().nullable()
		})
		.refine(bonus => (bonus.min && bonus.max ? bonus.min < bonus.max : true), { message: 'Max bonus must be higher than min bonus' })
		.optional(),
	org: z.string(),
	additional_offerings: z.array(z.string()),
	fixed_allowance: z
		.array(z.object({ name: z.string(), amount: z.string(), frequency: z.string() }))
		.optional()
		.nullable()
});

interface props {
	data: Tables<'employee_levels'>[];
	updateBand: (band: TablesUpdate<'employee_levels'>) => Promise<string | true>;
	createBand: (band: TablesInsert<'employee_levels'>) => Promise<string | true>;
	deleteBand: (bandId?: number) => Promise<string | true>;
}

export const EmployeeBandDialog = ({ data, updateBand, createBand, deleteBand }: props) => {
	const [isDialogOpen, openDialog] = useState(false);
	const [showSigningBonus, toggleShowSigningBonus] = useState(false);
	const [showFixedAllowance, toggleShowFixedAllowance] = useState(false);
	const [showAdditionalOffering, toggleShowAdditionalOffering] = useState(false);
	const [isLevelsOpen, toggleLevelsDropdown] = useState(false);
	const [jobLevels] = useState<string[]>(levels);
	const [orgJobLevels, updateOrgJobLevels] = useState<string[]>([]);
	const [levelQuery, setLevelQuery] = useState<string>('');
	const [activeBandId, setActiveBandId] = useState<number>();
	const [isSubmitting, setSubmitState] = useState(false);
	const [showDeleteBandDialog, toggleDeleteBandDialog] = useState(false);
	const router = useRouter();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			additional_offerings: [],
			level: undefined,
			role: '',
			org: '',
			fixed_allowance: [],
			salary: {
				min: 0,
				max: 0
			}
		}
	});

	const setActiveBandForm = (activeBand: TablesUpdate<'employee_levels'>) => {
		form.reset({
			level: activeBand.level,
			org: activeBand.org,
			role: activeBand.role || undefined,
			salary: {
				min: activeBand.min_salary,
				max: activeBand.max_salary
			},
			signing_bonus: {
				min: activeBand.min_signing_bonus || undefined,
				max: activeBand.max_signing_bonus || undefined
			},
			fixed_allowance: activeBand.fixed_allowance as any,
			additional_offerings: (activeBand.additional_offerings as string[]) || []
		});
		setActiveBandId(activeBand.id);
		toggleShowSigningBonus(!!(activeBand?.min_signing_bonus || activeBand?.max_signing_bonus));
		toggleShowFixedAllowance(!!activeBand?.fixed_allowance?.length);
		toggleShowAdditionalOffering(!!activeBand?.additional_offerings?.length);

		openDialog(true);
	};

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		setSubmitState(true);
		const band: TablesInsert<'employee_levels'> | TablesInsert<'employee_levels'> = {
			level: values.level,
			org: values.org,
			role: values.role,
			min_salary: values.salary.min,
			max_salary: values.salary.max,
			min_signing_bonus: values.signing_bonus?.min,
			max_signing_bonus: values.signing_bonus?.max,
			fixed_allowance: values.fixed_allowance,
			additional_offerings: values.additional_offerings
		};

		const response = activeBandId ? await updateBand({ ...band, id: activeBandId }) : await createBand(band);
		setSubmitState(false);

		if (typeof response == 'string' && response !== 'Update') return toast.error('😥 Error', { description: response });

		openDialog(false);
		form.reset();
		router.refresh();

		if (response == 'Update') return toast('😎 Done!', { description: 'Band updated successfully' });
		return toast('😎 Done!', { description: 'Band created successfully' });
	};

	const SubmitButton = () => {
		const { pending } = useFormStatus();

		return (
			<Button type="submit" disabled={pending || isSubmitting} size={'sm'} className="mt-8 w-full gap-2">
				{(pending || isSubmitting) && <LoadingSpinner />}
				{pending || isSubmitting ? (activeBandId ? 'Updating band' : 'Creating band') : activeBandId ? 'Update band' : 'Create band'}
			</Button>
		);
	};

	return (
		<>
			<div className="mb-10 grid gap-8">
				{data.map(band => (
					<Card key={band.id} className="relative w-full text-left">
						<Button
							onClick={() => {
								toggleDeleteBandDialog(true);
								setActiveBandId(band.id);
							}}
							variant={'ghost'}
							className="absolute -left-12 top-1/2 -translate-y-1/2 text-destructive hover:bg-transparent hover:text-destructive">
							<Trash2 size={14} />
						</Button>
						<button className="flex w-full items-center justify-between p-4 text-xs" onClick={() => setActiveBandForm(band)}>
							<div>
								{band.level} • <span className="text-muted-foreground">{band.role}</span>
							</div>
							<div className="flex items-center gap-2 text-muted-foreground">
								<div>
									{new Intl.NumberFormat('en-US', {
										style: 'currency',
										currency: 'USD'
									}).format(band.min_salary)}{' '}
								</div>
								-
								<div>
									{new Intl.NumberFormat('en-US', {
										style: 'currency',
										currency: 'USD'
									}).format(band.max_salary)}
								</div>
								<ChevronRight size={14} />
							</div>
						</button>
					</Card>
				))}

				<Button
					className={cn('w-full text-xs')}
					onClick={() => {
						openDialog(true);
						setActiveBandId(undefined);
					}}>
					Add new band
				</Button>
			</div>

			<DeleteBandDialog onBandDeleted={() => setActiveBandId(undefined)} toggleDialog={toggleDeleteBandDialog} isToggled={showDeleteBandDialog} deleteBand={() => deleteBand(activeBandId)} />

			<Sheet open={isDialogOpen} onOpenChange={openDialog}>
				<SheetContent className="overflow-auto pb-24">
					<SheetHeader className="mb-6">
						<SheetTitle>Employee Band</SheetTitle>
						<SheetDescription className="text-xs">This enables you to categorize employee benefits once, in a band.</SheetDescription>
					</SheetHeader>

					<div className="grid gap-4 py-6">
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
															{field.value || `Select level`}
															<ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
														</Button>
													</FormControl>
												</PopoverTrigger>

												<PopoverContent className="max-h-64 w-72 overflow-hidden p-0" align="start">
													<Command>
														<CommandInput placeholder="Enter seniority level..." value={levelQuery} onValueChange={(value: string) => setLevelQuery(value)} />
														<CommandList>
															<CommandEmpty
																onClick={() => {
																	updateOrgJobLevels([...orgJobLevels, levelQuery]);
																	form.setValue('level', levelQuery);
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
																		<CommandItem
																			className="gap-2"
																			value={level}
																			key={level}
																			onSelect={() => {
																				form.setValue('level', level);
																				toggleLevelsDropdown(false);
																			}}>
																			<div className="flex items-center">
																				<Check className={cn('mr-2 h-3 w-3', level === field.value ? 'opacity-100' : 'opacity-0')} />
																				{level}
																			</div>
																		</CommandItem>
																	))}
																</CommandGroup>
															)}

															<CommandGroup heading="Suggested Org Levels">
																{jobLevels.map(level => (
																	<CommandItem
																		className="gap-2"
																		value={level}
																		key={level}
																		onSelect={() => {
																			form.setValue('level', level);
																			toggleLevelsDropdown(false);
																		}}>
																		<Check className={cn('mr-2 h-3 w-3', level === field.value ? 'opacity-100' : 'opacity-0')} />
																		{level}
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

								<FormField
									control={form.control}
									name="role"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="flex items-center gap-2">
												Role
												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger asChild>
															<button type="button">
																<Info size={10} />
															</button>
														</TooltipTrigger>
														<TooltipContent side="right" className="max-w-44">
															<p>Think of this as a description for this band. Eg: Entry, Mid I, Mid II, Senior, e.t.c</p>
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>
											</FormLabel>
											<FormControl>
												<Input type="text" placeholder="Mid I, Mid II, Senior I, Senior II, ..." {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<MinMaxPay form={form} isToggled name="salary" label="salary" formLabel="Base annual salary range" />

								<MinMaxPay
									form={form}
									name="signing_bonus"
									label="bonus"
									formLabel="Signing bonus range"
									showToggle
									toggle={event => toggleShowSigningBonus(event)}
									isToggled={showSigningBonus}
									tooltip="A one-time payment offered to an employee upon accepting a job, often used as an incentive."
								/>

								<FixedAllowance toggle={toggleShowFixedAllowance} isToggled={showFixedAllowance} form={form} />

								<AdditionalOffering toggle={toggleShowAdditionalOffering} isToggled={showAdditionalOffering} form={form} />

								<SubmitButton />
							</form>
						</Form>
					</div>
				</SheetContent>
			</Sheet>
		</>
	);
};

const levels = ['IC Level 1', 'IC Level 2', 'IC Level 3', 'IC Level 4', 'IC Level 5', 'IC Level 6', 'IC Level 7', 'IC Level 8', 'IC Level 9', 'IC Level 10'];
