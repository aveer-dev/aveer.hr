'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tables, TablesInsert, TablesUpdate } from '@/type/database.types';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Check, ChevronDown, ChevronRight, Info, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MinMaxPay } from '@/components/forms/min-max-pay';
import { FixedAllowance } from '@/components/forms/fixed-allowance';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useFormStatus } from 'react-dom';
import { LoadingSpinner } from '@/components/ui/loader';
import { useRouter } from 'next/navigation';
import { DeleteBandDialog } from './delete-band-dialog';
import { createBand, updateBand } from './band.action';

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
	fixed_allowance: z
		.array(z.object({ name: z.string(), amount: z.string(), frequency: z.string() }))
		.optional()
		.nullable()
});

interface props {
	band?: Tables<'employee_levels'>;
	org: string;
}

export const EmployeeBandDialog = ({ band, org }: props) => {
	const [isDialogOpen, openDialog] = useState(false);
	const [showSigningBonus, toggleShowSigningBonus] = useState(false);
	const [showFixedAllowance, toggleShowFixedAllowance] = useState(false);
	const [isLevelsOpen, toggleLevelsDropdown] = useState(false);
	const [jobLevels] = useState<string[]>(levels);
	const [orgJobLevels, updateOrgJobLevels] = useState<string[]>([]);
	const [levelQuery, setLevelQuery] = useState<string>('');
	const [isSubmitting, setSubmitState] = useState(false);
	const router = useRouter();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			level: band?.level || undefined,
			role: band?.role || '',
			org: band?.org || '',
			fixed_allowance: (band?.fixed_allowance as any) || [],
			salary: {
				min: band?.min_salary || 0,
				max: band?.max_salary || 0
			},
			signing_bonus: {
				min: band?.min_signing_bonus || 0,
				max: band?.max_signing_bonus || 0
			}
		}
	});

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
			fixed_allowance: values.fixed_allowance
		};

		const response = band ? await updateBand({ ...band, id: band.id }, org) : await createBand(band, org);
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
			<Button type="submit" disabled={pending || isSubmitting} size={'sm'} className="w-full gap-2">
				{(pending || isSubmitting) && <LoadingSpinner />}
				{pending || isSubmitting ? (band ? 'Updating band' : 'Creating band') : band ? 'Update band' : 'Create band'}
			</Button>
		);
	};

	useEffect(() => {
		if (band) {
			toggleShowSigningBonus(!!(band?.min_signing_bonus || band?.max_signing_bonus));
			toggleShowFixedAllowance(!!band?.fixed_allowance?.length);
		}
	}, [band]);

	return (
		<Sheet open={isDialogOpen} onOpenChange={openDialog}>
			<SheetTrigger asChild>
				<Card className="w-full text-left">
					{band && (
						<button className="flex w-full items-center justify-between p-4 text-xs">
							<div>
								{band.level} • <span className="text-muted-foreground">{band.role}</span>
							</div>
							<div className="flex items-center gap-2 text-muted-foreground">
								<ChevronRight size={14} />
							</div>
						</button>
					)}

					{!band && <Button className={cn('w-full text-xs')}>Add new band</Button>}
				</Card>
			</SheetTrigger>

			<SheetContent className="overflow-auto pb-24">
				<SheetHeader className="mb-6">
					<SheetTitle>Employee Level</SheetTitle>
					<SheetDescription className="text-xs">This enables you to categorize employee benefits once, in a level.</SheetDescription>
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

							<div className="mt-8 flex items-center gap-2">
								{band && <DeleteBandDialog onBandDeleted={() => router.refresh()} org={org} id={band?.id} />}
								<SubmitButton />
							</div>
						</form>
					</Form>
				</div>
			</SheetContent>
		</Sheet>
	);
};

const levels = ['IC Level 1', 'IC Level 2', 'IC Level 3', 'IC Level 4', 'IC Level 5', 'IC Level 6', 'IC Level 7', 'IC Level 8', 'IC Level 9', 'IC Level 10'];
