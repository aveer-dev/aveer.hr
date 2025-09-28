'use client';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { useState, useEffect } from 'react';
import { createAppraisalCycle, getQuestionTemplates, updateAppraisalCycle } from '@/components/appraisal-forms/appraisal.actions';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Tables, TablesInsert } from '@/type/database.types';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loader';
import { useRouter } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Check, CheckCircle, ChevronsUpDown, Info, ListChecks, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Textarea } from '../ui/textarea';
import { DeleteAppraisalCycle } from './delete-appraisal-cycle';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { searchPeople } from '@/utils/employee-search';
import { getEmployees } from '@/utils/form-data-init';

interface props {
	org: string;
	cycle?: Tables<'appraisal_cycles'>;
	children?: React.ReactNode;
	readOnly?: boolean;
	noAction?: boolean;
	isOpen?: boolean;
	setIsOpen?: (isOpen: boolean) => void;
}

const appraisalTypes = [
	{
		name: 'Objectives and Goals',
		value: 'objectives_goals_accessment',
		description: 'Employees will be asked to provide their objectives, they and their manager will score them, and provide feedback on their performance.',
		icon: ListChecks
	},
	{
		name: 'Direct Score',
		value: 'direct_score',
		description: 'Employees and managers will be asked to score themselves on a scale of 1 to 5, with feedback on their performance.',
		icon: CheckCircle
	}
];

export const AppraisalCycleDialog = ({ org, cycle, children, readOnly = false, noAction = false, isOpen, setIsOpen }: props) => {
	const [isUpdatingAppraisal, setAppraisalUpdateState] = useState(false);
	const [isSheetOpen, setIsSheetOpen] = useState(isOpen || false);
	const [questionTemplates, setQuestionTemplates] = useState<Tables<'question_templates'>[] | null>(null);
	const router = useRouter();
	const [isEmployeeOpen, setIsEmployeeOpen] = useState(false);
	const [filteredEmployees, setFilteredEmployees] = useState<{ id: number; profile: { first_name: string; last_name: string; id: string } }[]>([]);
	const [employees, setEmployees] = useState<Tables<'contracts'>[]>([]);
	const [selectedEmployee, setSelectedEmployee] = useState<{ id: number; profile: { first_name: string; last_name: string; id: string } } | null>(null);

	const formSchema = z
		.object({
			start_date: z.string().refine(
				date => {
					const startDate = new Date(date);
					const today = new Date();
					today.setHours(0, 0, 0, 0);
					// Allow past dates only when updating an existing cycle
					return cycle ? true : startDate >= today;
				},
				{ message: 'Start date cannot be in the past for new cycles' }
			),
			end_date: z.string(),
			self_review_due_date: z.string(),
			manager_review_due_date: z.string(),
			question_template: z.number(),
			name: z.string().min(1, { message: 'Name is required' }),
			description: z.string().optional(),
			type: z.enum(['objectives_goals_accessment', 'direct_score', 'per_employee']),
			employee: z.number().optional().nullable()
		})
		.refine(data => new Date(data.end_date) > new Date(data.start_date), { message: 'End date must be after start date', path: ['end_date'] })
		.refine(
			data => {
				const start = new Date(data.start_date);
				const end = new Date(data.end_date);
				const selfReview = new Date(data.self_review_due_date);
				return selfReview > start && selfReview < end;
			},
			{ message: 'Self review date must be between start and end date', path: ['self_review_due_date'] }
		)
		.refine(
			data => {
				const start = new Date(data.start_date);
				const end = new Date(data.end_date);
				const managerReview = new Date(data.manager_review_due_date);
				return managerReview > start && managerReview < end;
			},
			{ message: 'Manager review date must be between start and end date', path: ['manager_review_due_date'] }
		);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			start_date: cycle?.start_date || new Date().toISOString(),
			end_date: cycle?.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
			self_review_due_date: cycle?.self_review_due_date || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
			manager_review_due_date: cycle?.manager_review_due_date || new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
			question_template: cycle?.question_template,
			name: cycle?.name || '',
			description: cycle?.description || '',
			type: cycle?.type || 'objectives_goals_accessment',
			employee: cycle?.employee || null
		}
	});

	useEffect(() => {
		setIsSheetOpen(isOpen || false);
	}, [isOpen]);

	useEffect(() => {
		const fetchTemplates = async () => {
			try {
				const templates = await getQuestionTemplates({ org });
				setQuestionTemplates(templates);
			} catch (error) {
				toast.error('Error fetching question templates', { description: error instanceof Error ? error?.message : 'Unknown error' });
			}
		};

		const fetchEmployees = async () => {
			const { data, error } = await getEmployees({ org });

			if (!data || error) {
				toast.error('Error fetching employees', { description: error instanceof Error ? error?.message : 'Unknown error' });
				return;
			}
			setEmployees(data);
			setFilteredEmployees(data as any);
		};

		if (isSheetOpen) {
			fetchTemplates();
			fetchEmployees();
		}
	}, [isSheetOpen, org]);

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		setAppraisalUpdateState(true);

		const payload: TablesInsert<'appraisal_cycles'> = { ...values, org };

		try {
			if (cycle) {
				// Update existing cycle
				const response = await updateAppraisalCycle(payload, cycle.id, org);
				if (typeof response === 'string') {
					toast.error('Error updating appraisal cycle', { description: response });
					return;
				}
				toast.success('Appraisal cycle updated successfully');
			} else {
				// Create new cycle
				const response = await createAppraisalCycle(payload);
				if (typeof response === 'string') {
					toast.error('Error creating appraisal cycle', { description: response });
					return;
				}
				toast.success('Appraisal cycle created successfully');
			}

			router.refresh();
			setIsOpen && setIsOpen(false);
		} catch (error) {
			toast.error('An error occurred', { description: error instanceof Error ? error.message : 'Unknown error' });
		} finally {
			setAppraisalUpdateState(false);
		}
	};

	return (
		<Sheet
			open={isSheetOpen}
			onOpenChange={state => {
				setIsSheetOpen(state);
				setIsOpen && setIsOpen(state);
			}}>
			{!noAction && <SheetTrigger asChild>{children ? children : <Button variant="default">Create Appraisal Cycle</Button>}</SheetTrigger>}

			<SheetContent className="w-full overflow-auto pb-24 sm:max-w-lg">
				<SheetHeader className="mb-6">
					<SheetTitle>Appraisal Cycle Settings</SheetTitle>
					<SheetDescription>Configure your organization&apos;s appraisal cycle settings</SheetDescription>
				</SheetHeader>

				{questionTemplates !== null && questionTemplates?.length === 0 && (
					<Alert className="my-8 p-2" variant="warn">
						<Info size={14} className="!left-2 !top-2" />
						<AlertTitle>Info</AlertTitle>
						<AlertDescription>You need to create at least one question template for your appraisal before creating an appraisal cycle.</AlertDescription>
					</Alert>
				)}

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input placeholder="Q4 2023 Performance Review" {...field} readOnly={readOnly} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea placeholder="End of year performance review cycle" {...field} readOnly={readOnly} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="type"
							render={({ field }) => (
								<FormItem className="space-y-3">
									<FormLabel>Appraisal Type</FormLabel>
									<FormControl>
										<RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-stretch gap-4">
											{appraisalTypes.map(type => (
												<FormItem className="group w-full space-y-0" key={type.value}>
													<FormControl className="pointer-events-none absolute m-0 h-0 w-0 translate-x-[-100%] p-0 opacity-0">
														<RadioGroupItem value={type.value} />
													</FormControl>

													<FormLabel className="relative flex h-full w-full flex-col gap-3 rounded-md border bg-background p-4 text-left font-normal backdrop-blur-3xl transition-colors duration-500 hover:!bg-accent group-has-[input:checked]:border-muted-foreground group-has-[input:checked]:bg-accent/50">
														<type.icon size={16} />
														<div className="flex flex-col gap-1">
															<div className="text-sm font-medium">{type.name}</div>
														</div>
													</FormLabel>
												</FormItem>
											))}
										</RadioGroup>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormItem>
							<FormField
								control={form.control}
								name="employee"
								render={() => (
									<FormItem>
										<FormLabel className="flex items-center">
											Employee
											<Tooltip>
												<TooltipTrigger asChild>
													<Info className="ml-1 inline-block" size={12} />
												</TooltipTrigger>
												<TooltipContent>
													<p>The employee to be appraised, if appraisal is for a single employee</p>
												</TooltipContent>
											</Tooltip>
										</FormLabel>

										<Popover open={isEmployeeOpen} onOpenChange={setIsEmployeeOpen}>
											<PopoverTrigger asChild>
												<FormControl>
													<Button variant="outline" role="combobox" className={cn('w-full justify-between bg-input-bg', !form.getValues(`employee`) && 'text-muted-foreground')}>
														{form.getValues(`employee`) ? `${selectedEmployee?.profile.first_name} ${selectedEmployee?.profile.last_name}` : 'Select employee'}
														<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
													</Button>
												</FormControl>
											</PopoverTrigger>

											<PopoverContent className="w-[300px] p-0" align="start">
												<Command shouldFilter={false}>
													<CommandInput
														placeholder="Search people"
														onValueChange={value => {
															const result = searchPeople(employees as any, value, ['first_name', 'last_name']);
															setFilteredEmployees(result);
														}}
													/>

													<CommandList>
														<CommandEmpty>No person found with that name.</CommandEmpty>

														<CommandGroup>
															{filteredEmployees.map(employee => (
																<CommandItem
																	value={String(employee.id)}
																	key={employee.id}
																	onSelect={value => {
																		const employeeDetails = filteredEmployees.find(employee => employee.id == Number(value));
																		if (!employeeDetails) return;

																		setSelectedEmployee(employeeDetails);
																		form.setValue('employee', employeeDetails?.id);
																		setIsEmployeeOpen(false);
																	}}>
																	<Check className={cn('mr-2 h-4 w-4', employee.id === selectedEmployee?.id ? 'opacity-100' : 'opacity-0')} />
																	{employee.profile.first_name} {employee.profile.last_name}
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

							<FormMessage />
						</FormItem>

						<div className="space-y-4 rounded-md bg-accent p-4">
							<h3 className="!mb-6 text-xs font-medium text-muted-foreground">Appraisal Cycle timeline</h3>

							<div className="flex gap-4">
								<FormField
									control={form.control}
									name="start_date"
									render={({ field }) => (
										<FormItem className="w-full">
											<FormLabel>
												Start Date
												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger asChild>
															<Info className="ml-1 inline-block" size={12} />
														</TooltipTrigger>
														<TooltipContent>
															<p>The start date of the appraisal cycle</p>
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>
											</FormLabel>
											<FormControl>
												<DatePicker selected={field.value ? new Date(field.value) : undefined} onSetDate={date => field.onChange(new Date(date).toISOString())} disabled={readOnly} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="end_date"
									render={({ field }) => (
										<FormItem className="w-full">
											<FormLabel>
												End Date
												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger asChild>
															<Info className="ml-1 inline-block" size={12} />
														</TooltipTrigger>
														<TooltipContent>
															<p>The end date of the appraisal cycle</p>
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>
											</FormLabel>
											<FormControl>
												<DatePicker selected={field.value ? new Date(field.value) : undefined} onSetDate={date => field.onChange(new Date(date).toISOString())} disabled={readOnly} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						<div className="space-y-4 rounded-md bg-accent p-4">
							<h3 className="!mb-6 text-xs font-medium text-muted-foreground">Appraisal Cycle due dates</h3>

							<div className="flex gap-4">
								<FormField
									control={form.control}
									name="self_review_due_date"
									render={({ field }) => (
										<FormItem className="w-full">
											<FormLabel>
												Self Review Due by
												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger asChild>
															<Info className="ml-1 inline-block" size={12} />
														</TooltipTrigger>
														<TooltipContent>
															<p>The date when employees must have completed self-review</p>
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>
											</FormLabel>
											<FormControl>
												<DatePicker selected={field.value ? new Date(field.value) : undefined} onSetDate={date => field.onChange(new Date(date).toISOString())} disabled={readOnly} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="manager_review_due_date"
									render={({ field }) => (
										<FormItem className="w-full">
											<FormLabel>
												Manager Review Due by
												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger asChild>
															<Info className="ml-1 inline-block" size={12} />
														</TooltipTrigger>
														<TooltipContent>
															<p>The date when managers must have completed reviewing employees</p>
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>
											</FormLabel>
											<FormControl>
												<DatePicker selected={field.value ? new Date(field.value) : undefined} onSetDate={date => field.onChange(new Date(date).toISOString())} disabled={readOnly} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						<FormField
							control={form.control}
							name="question_template"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Question Template</FormLabel>
									<Select onValueChange={value => field.onChange(parseInt(value))} defaultValue={field.value?.toString()} disabled={readOnly}>
										<FormControl>
											<SelectTrigger className="disabled:opacity-100">
												<SelectValue placeholder="Select a question template" />
											</SelectTrigger>
										</FormControl>

										<SelectContent>
											{questionTemplates !== null &&
												questionTemplates.map(template => (
													<SelectItem key={template.id} value={template.id.toString()}>
														{template.name}
													</SelectItem>
												))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						{!readOnly && (
							<div className="flex gap-3">
								{cycle && <DeleteAppraisalCycle org={org} cycle={cycle} />}

								<Button type="submit" className="w-full" disabled={isUpdatingAppraisal}>
									{isUpdatingAppraisal && <LoadingSpinner className="mr-2" />} {cycle ? 'Update Appraisal Cycle' : 'Create Appraisal Cycle'}
								</Button>
							</div>
						)}
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	);
};
