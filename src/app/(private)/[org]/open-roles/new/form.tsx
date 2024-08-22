'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/type/database.types';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/loader';
import { createOpenRole, updateRole } from './role.action';
import { Separator } from '@/components/ui/separator';
import { createEORAgreement, doesUserHaveAdequatePermissions, getEORAgreementByCountry } from '@/utils/api';
import { EORAgreementDrawer } from '@/components/eor/eor-agreement';
import { useFormStatus } from 'react-dom';

const supabase = createClient();

const formSchema = z.object({
	job_title: z.string(),
	level: z.string().optional(),
	employment_type: z.enum(['full-time', 'part-time', 'contract']),
	work_schedule: z.number().or(z.string()).optional(),
	work_shedule_interval: z.string().optional(),
	responsibilities: z.array(z.string()),
	salary: z.string(),
	signing_bonus: z.string().optional(),
	fixed_allowance: z.array(z.object({ name: z.string(), amount: z.string(), frequency: z.string() })).optional(),
	probation_period: z.number().or(z.string()).optional(),
	paid_leave: z.number().or(z.string()).optional(),
	sick_leave: z.number().or(z.string()).optional(),
	about_us: z.string().optional(),
	requirements: z.array(z.string()),
	what_we_offer: z.array(z.string()),
	state: z.string().optional(),
	work_location: z.enum(['remote', 'hybrid', 'on-site']),
	years_of_experience: z.number().or(z.string()),
	entity: z.number()
});

export const OpenRoleForm = ({ data, duplicate }: { data?: TablesUpdate<'open_roles'>; duplicate?: TablesUpdate<'open_roles'> }) => {
	const [formValue, setFormValue] = useState<z.infer<typeof formSchema>>();
	const [countries, setCountries] = useState<{ name: string; dial_code: string; country_code: string }[]>([]);
	const [entities, setEntities] = useState<Tables<'legal_entities'>[]>([]);
	const [eorEntities, setEorEntities] = useState<Tables<'legal_entities'>[]>([]);
	const [jobTitles, updateJobTitles] = useState<string[]>([]);
	const [jobLevels, updateJobLevels] = useState<string[]>([]);
	const [responsibility, updateResponsibility] = useState('');
	const [offering, updateOffering] = useState('');
	const [requirement, updateRequirement] = useState('');
	const [fixedAllowance, updateFixedAllowance] = useState({ name: '', amount: '', frequency: '' });
	const [showSigningBonus, toggleShowSigningBonus] = useState(!!data?.signing_bonus || !!duplicate?.signing_bonus);
	const [showFixedIncome, toggleShowFixedIncome] = useState(!!data?.fixed_allowance || !!duplicate?.fixed_allowance);
	const [jobQuery, setJobQuery] = useState<string>('');
	const [levelQuery, setLevelQuery] = useState<string>('');
	const [isSubmiting, toggleSubmitState] = useState(false);
	const params = useParams<{ org: string }>();
	const [agreementId, setAgreementId] = useState<number>();
	const [isAlertOpen, toggleAgreementDialog] = useState(false);

	const getCountries = async () => {
		const { data, error } = await supabase.from('countries').select();
		if (!error) setCountries(data);
	};

	const getEntities = useCallback(async () => {
		const { data, error } = await supabase.from('legal_entities').select().eq('org', params.org);
		const { data: eorData, error: eorError } = await supabase.from('legal_entities').select().eq('is_eor', true);

		if (!error) setEntities(data);
		if (!eorError) setEorEntities(eorData);
	}, [params.org]);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			responsibilities: (data?.responsibilities as string[]) || (duplicate?.responsibilities as string[]) || [],
			fixed_allowance: (data?.fixed_allowance as any) || (duplicate?.fixed_allowance as any) || [],
			probation_period: data?.probation_period || duplicate?.probation_period || '90',
			paid_leave: data?.paid_leave || duplicate?.paid_leave || '20',
			sick_leave: data?.sick_leave || duplicate?.sick_leave || '20',
			work_schedule: data?.work_schedule || duplicate?.work_schedule || 8,
			work_shedule_interval: data?.work_shedule_interval || duplicate?.work_shedule_interval || 'daily',
			salary: data?.salary ? String(data?.salary) : duplicate?.salary ? String(duplicate?.salary) : '',
			signing_bonus: data?.signing_bonus ? String(data?.signing_bonus) : duplicate?.signing_bonus ? String(duplicate?.signing_bonus) : '',
			employment_type: data?.employment_type || duplicate?.employment_type || undefined,
			level: data?.level || duplicate?.level || undefined,
			job_title: data?.job_title || duplicate?.job_title || undefined,
			entity: data?.entity || duplicate?.entity || undefined,
			requirements: (data?.requirements as string[]) || (duplicate?.requirements as string[]) || [],
			what_we_offer: (data?.what_we_offer as string[]) || (duplicate?.what_we_offer as string[]) || [],
			years_of_experience: (data?.years_of_experience as number) || (duplicate?.years_of_experience as number) || '',
			about_us: data?.about_us || duplicate?.about_us || '',
			work_location: data?.work_location || duplicate?.work_location || undefined
		}
	});

	const SubmitButton = () => {
		const { pending } = useFormStatus();

		return (
			<Button type="submit" disabled={pending || isSubmiting} className="gap-3 px-8 text-xs font-light">
				{(pending || isSubmiting) && <LoadingSpinner />}
				{pending || isSubmiting ? (data ? 'Updating role' : 'Creating role') : data ? 'Update role' : 'Create role'}
			</Button>
		);
	};

	const isEntityEOR = async (entityId: number) => {
		const entity = eorEntities.find(entity => entity.id === Number(entityId));
		return entity;
	};

	const createRole = async (values: z.infer<typeof formSchema>) => {
		const role: TablesInsert<'open_roles'> = {
			employment_type: values.employment_type,
			salary: Number(values.salary),
			sick_leave: Number(values.sick_leave),
			paid_leave: Number(values.paid_leave),
			probation_period: Number(values.probation_period),
			work_schedule: Number(values.work_schedule),
			work_shedule_interval: values.work_shedule_interval,
			job_title: values.job_title,
			level: values.level,
			responsibilities: values.responsibilities,
			entity: Number(values.entity),
			org: params.org,
			requirements: values.requirements,
			what_we_offer: values.what_we_offer,
			years_of_experience: Number(values.years_of_experience),
			work_location: values.work_location,
			about_us: values.about_us
		};

		if (showSigningBonus) role.signing_bonus = Number(values.signing_bonus);
		if (showFixedIncome) role.fixed_allowance = values.fixed_allowance;

		const responseMessage = data ? await updateRole(role, params.org) : await createOpenRole(role, params.org);
		toggleSubmitState(false);
		if (responseMessage == 'update') return toast.success('Role details updated successfully');
		if (responseMessage) toast.error(responseMessage);
	};

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		const userHasPermission = await doesUserHaveAdequatePermissions({ orgId: params.org });
		if (userHasPermission !== true) return toast.error(userHasPermission);

		toggleSubmitState(true);

		const entityData = await isEntityEOR(values.entity);
		if (entityData?.is_eor !== true) return createRole(values);

		setFormValue(values);

		const eorAgreement = await getEORAgreementByCountry(entityData?.incorporation_country as string);
		if (eorAgreement.error) {
			toast.error(eorAgreement.error.message);
			toggleSubmitState(false);

			return;
		}

		if (!eorAgreement.data) {
			const res = await createEORAgreement({ org: params.org });
			if (typeof res !== 'number') {
				toast.error(res);
				toggleSubmitState(false);

				return;
			}
			setAgreementId(res);

			return toggleAgreementDialog(true);
		}

		if (!eorAgreement.data[0].signed_by) {
			setAgreementId(eorAgreement.data[0].id);
			return toggleAgreementDialog(true);
		}

		return createRole(values);
	};

	const onSignAgreement = () => (formValue ? createRole(formValue) : false);

	useEffect(() => {
		getCountries();
		getEntities();
	}, [getEntities]);

	useEffect(() => {
		const checkTitle = () => {
			if (!data?.job_title && !duplicate?.job_title) return;

			const newJobTitle = jobTitles.find(title => title == data?.job_title || title == duplicate?.job_title);
			if (newJobTitle) return;

			const title = data?.job_title || duplicate?.job_title;
			if (title) updateJobTitles([...jobTitles, title]);
		};

		const checkLevel = () => {
			if (!data?.level && !duplicate?.level) return;

			const newJobLevel = jobTitles.find(title => title == data?.level || title == duplicate?.level);
			if (newJobLevel) return;

			const level = data?.level || duplicate?.level;
			if (level) updateJobLevels([...jobTitles, level]);
		};

		checkTitle();
		checkLevel();
	}, [data, duplicate, jobTitles]);

	return (
		<>
			{isAlertOpen && (
				<EORAgreementDrawer
					agreementId={agreementId}
					completeContract={onSignAgreement}
					eorEntities={eorEntities}
					entities={entities}
					entity={String(entities[0]?.id)}
					eor_entity={form.getValues('entity')}
					isAlertOpen={isAlertOpen}
					toggleAgreementDialog={toggleAgreementDialog}
					onCancel={() => toggleAgreementDialog(false)}
				/>
			)}

			<Form {...form}>
				<form className="grid w-full gap-6" onSubmit={form.handleSubmit(onSubmit)}>
					{/* entity details */}
					<div className="grid grid-cols-2 border-t border-t-border pt-10">
						<div>
							<h2 className="font-semibold">Legal entity </h2>
							<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">You can hire employee through one of your legal entity or through aveer.hr&apos;s, we&apos;ll sort out the compliance for you in that region automatically</p>
						</div>

						<div className="mb-10 grid gap-8">
							<FormField
								control={form.control}
								name="entity"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Legal entity</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value ? String(field.value) : undefined}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select legal entity you'd like to hire under" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectGroup>
													{entities.length !== 0 && <SelectLabel>Your Legal Entities</SelectLabel>}
													{entities.map(entity => (
														<SelectItem key={entity.id} value={String(entity.id)}>
															{entity?.name} • <span className="text-muted-foreground">{entity.incorporation_country}</span>
														</SelectItem>
													))}
												</SelectGroup>

												{entities.length !== 0 && <Separator className="my-3" />}

												<SelectGroup>
													{eorEntities.length && <SelectLabel>Hire with aveer.hr</SelectLabel>}
													{eorEntities.map(entity => (
														<SelectItem key={entity.id} value={String(entity.id)}>
															{entity?.name} • <span className="text-muted-foreground">{entity.incorporation_country}</span>
														</SelectItem>
													))}
												</SelectGroup>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="about_us"
								render={({ field }) => (
									<FormItem>
										<FormLabel>About us</FormLabel>
										<FormControl>
											<Textarea {...field} placeholder="Exciting reasons why people should be interested in working at your company" className="resize-none text-xs font-light" />
										</FormControl>
										<FormDescription className="text-xs font-thin text-muted-foreground">A short description about your company, sell your company to potential hires</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>

					{/* job details */}
					<div className="grid grid-cols-2 border-t border-t-border pt-10">
						<div>
							<h2 className="font-semibold">Job details</h2>
							<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">Top level details about this job offering and the responsibilities that the hired candidate will be doing in this role.</p>
						</div>

						<div className="mb-10 grid gap-10">
							<div className="grid grid-cols-2 gap-6">
								<FormField
									control={form.control}
									name="job_title"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Job title</FormLabel>
											<Popover>
												<PopoverTrigger asChild>
													<FormControl>
														<Button variant="outline" role="combobox" className={cn('w-full justify-between bg-input-bg', !field.value && 'text-muted-foreground')}>
															{field.value || `Enter job title`}
															<ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
														</Button>
													</FormControl>
												</PopoverTrigger>
												<PopoverContent className="w-[200px] p-0">
													<Command>
														<CommandInput placeholder="Enter job title..." value={jobQuery} onValueChange={(value: string) => setJobQuery(value)} />
														<CommandList>
															<CommandEmpty
																onClick={() => {
																	updateJobTitles([...jobTitles, jobQuery]);
																	form.setValue('job_title', jobQuery);
																	setJobQuery('');
																}}
																className="p-1">
																<div className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-xs font-light outline-none">
																	<Check className={cn('mr-2 h-4 w-4', jobQuery && jobQuery === field.value ? 'opacity-100' : 'opacity-0')} />
																	{jobQuery}
																</div>
															</CommandEmpty>
															<CommandGroup>
																{jobTitles.map(title => (
																	<CommandItem value={title} key={title} onSelect={() => form.setValue('job_title', title)}>
																		<Check className={cn('mr-2 h-4 w-4', title === field.value ? 'opacity-100' : 'opacity-0')} />
																		{title}
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
									name="level"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Level</FormLabel>
											<Popover>
												<PopoverTrigger asChild>
													<FormControl>
														<Button variant="outline" role="combobox" className={cn('w-full justify-between bg-input-bg', !field.value && 'text-muted-foreground')}>
															{field.value || `Select seniority level`}
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
																	updateJobLevels([...jobLevels, levelQuery]);
																	form.setValue('level', levelQuery);
																	setLevelQuery('');
																}}
																className="p-1">
																<div className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-xs font-light outline-none">
																	<Check className={cn('mr-2 h-4 w-4', levelQuery && levelQuery === field.value ? 'opacity-100' : 'opacity-0')} />
																	{levelQuery}
																</div>
															</CommandEmpty>
															<CommandGroup>
																{jobLevels.map(level => (
																	<CommandItem value={level} key={level} onSelect={() => form.setValue('level', level)}>
																		<Check className={cn('mr-2 h-4 w-4', level === field.value ? 'opacity-100' : 'opacity-0')} />
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
							</div>

							<FormField
								control={form.control}
								name="employment_type"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Employment type</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Is employee full-time or part-time?" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="full-time">Full-time</SelectItem>
												<SelectItem value="part-time">Part-time</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="responsibilities"
								render={() => (
									<div className="grid w-full gap-3">
										<FormLabel>Job responsibilities</FormLabel>
										<div className="rounded-lg bg-accent p-4">
											{form.getValues().responsibilities.length ? (
												<ul className="ml-4 grid gap-2">
													{form.getValues().responsibilities.map((resp, index) => (
														<li key={index} className="list-disc text-xs text-foreground">
															{resp}
														</li>
													))}
												</ul>
											) : (
												<p className="text-xs font-light italic text-muted-foreground">No responsibilities added yet</p>
											)}
										</div>

										<div className="w-full items-end gap-2">
											<FormItem>
												<div className="flex items-end gap-2">
													<FormControl>
														<Textarea rows={1} value={responsibility} onChange={event => updateResponsibility(event.target.value)} placeholder="Type job description here" className="min-h-5 py-[10px] text-xs font-light" />
													</FormControl>
													<Button
														type="button"
														disabled={!responsibility}
														onClick={() => {
															form.setValue('responsibilities', [...form.getValues().responsibilities, responsibility]);
															updateResponsibility('');
														}}>
														Add
													</Button>
												</div>

												<FormDescription className="text-xs font-thin text-muted-foreground">Type and add job descriptions one after the other</FormDescription>
												<FormMessage />
											</FormItem>
										</div>
									</div>
								)}
							/>
						</div>
					</div>

					{/* job requirements */}
					<div className="grid grid-cols-2 border-t border-t-border pt-10">
						<div>
							<h2 className="font-semibold">Job requirements</h2>
							<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">What are the things, skills or characteristics you expect from your new hire.</p>
						</div>

						<div className="mb-10 grid gap-10">
							<FormField
								control={form.control}
								name="years_of_experience"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Years of experience</FormLabel>
										<FormControl>
											<div className="relative h-fit w-full">
												<Input type="number" placeholder="Enter years of experience required" {...field} />
												<div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-thin text-foreground">years</div>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="requirements"
								render={() => (
									<div className="grid w-full gap-3">
										<FormLabel>Job requirments</FormLabel>

										<div className="rounded-lg bg-accent p-4">
											{form.getValues().requirements.length ? (
												<ul className="ml-4 grid gap-2">
													{form.getValues().requirements.map((requirement, index) => (
														<li key={index} className="list-disc text-xs text-foreground">
															{requirement}
														</li>
													))}
												</ul>
											) : (
												<p className="text-xs font-light italic text-muted-foreground">No requirements added yet</p>
											)}
										</div>

										<div className="w-full items-end gap-2">
											<FormItem>
												<div className="flex items-end gap-2">
													<FormControl>
														<Textarea rows={1} value={requirement} onChange={event => updateRequirement(event.target.value)} placeholder="Type job requirement here" className="min-h-5 py-[10px] text-xs font-light" />
													</FormControl>
													<Button
														type="button"
														disabled={!requirement}
														onClick={() => {
															form.setValue('requirements', [...form.getValues().requirements, requirement]);
															updateRequirement('');
														}}>
														Add
													</Button>
												</div>
												<FormDescription className="text-xs font-thin text-muted-foreground">Type and add job requirment one after the other</FormDescription>
												<FormMessage />
											</FormItem>
										</div>
									</div>
								)}
							/>
						</div>
					</div>

					{/* job schedule */}
					<div className="grid grid-cols-2 border-t border-t-border pt-10">
						<div>
							<h2 className="font-semibold">Job Schedule</h2>
							<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">
								What schedules will you like for your new hire to stick to? <br /> PTO days, sick leave days, e.t.c
							</p>
						</div>

						<div className="mb-10 grid gap-10">
							<div className="grid w-full gap-3">
								<Label>Work schedule</Label>
								<div className="grid w-full grid-cols-2 gap-6">
									<FormField
										control={form.control}
										name="work_schedule"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<div className="relative h-fit w-full">
														<Input type="number" placeholder="40" {...field} required />
														<div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-thin text-foreground">hours</div>
													</div>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="work_shedule_interval"
										render={({ field }) => (
											<FormItem>
												<Select onValueChange={field.onChange} defaultValue={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Daily, weekly or monthly?" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="weekly">Weekly</SelectItem>
														<SelectItem value="monthly">Monthly</SelectItem>
														<SelectItem value="daily">Daily</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-6">
								<FormField
									control={form.control}
									name="paid_leave"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Leave</FormLabel>
											<FormControl>
												<div className="relative h-fit w-full">
													<Input type="number" placeholder="20" {...field} required />
													<div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-thin text-foreground">days</div>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="sick_leave"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Sick leave</FormLabel>
											<FormControl>
												<div className="relative h-fit w-full">
													<Input type="number" placeholder="20" {...field} required />
													<div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-thin text-foreground">days</div>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="probation_period"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Probation period</FormLabel>
										<FormControl>
											<div className="relative h-fit w-full">
												<Input type="number" placeholder="90" {...field} required />
												<div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-thin text-foreground">days</div>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>

					{/* compensation */}
					<div className="grid grid-cols-2 border-t border-t-border pt-10">
						<div>
							<h2 className="font-semibold">Compensation</h2>
							<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">What will your new hire be receiving in compensation for service rendered and job done?</p>
						</div>

						<div className="mb-10 grid gap-10">
							<FormField
								control={form.control}
								name="salary"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Salary</FormLabel>
										<FormControl>
											<Input type="number" placeholder="Employee gross annual salary" {...field} required />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid w-full gap-3 rounded-lg bg-accent px-2 py-2">
								<FormField
									control={form.control}
									name="signing_bonus"
									render={({ field }) => (
										<FormItem>
											<div className="flex items-center justify-between space-x-2">
												<FormLabel>Add signing bonus</FormLabel>
												<Switch checked={showSigningBonus} onCheckedChange={event => toggleShowSigningBonus(event)} id="signin-bonus" className="scale-75" />
											</div>

											{showSigningBonus && (
												<FormControl>
													<Input type="number" placeholder="Enter employee's signing bonus" {...field} />
												</FormControl>
											)}
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="grid w-full gap-3 rounded-lg bg-accent px-2 py-2">
								<div className="flex items-center justify-between space-x-2">
									<Label htmlFor="signin-bonus">Fixed allowances</Label>
									<Switch id="fixed-allowance" checked={showFixedIncome} onCheckedChange={event => toggleShowFixedIncome(event)} className="scale-75" />
								</div>

								{showFixedIncome && (
									<>
										{form.getValues().fixed_allowance?.length ? (
											<ul className="grid list-disc gap-2 py-2">
												{form.getValues().fixed_allowance?.map((allowance, index) => (
													<li key={index} className="flex list-disc items-center justify-between p-1 text-xs font-light">
														<div>
															{allowance?.name} • <span className="text-xs font-light text-muted-foreground">${allowance.amount}</span>
														</div>
														<div className="text-muted-foreground">{allowance.frequency}</div>
													</li>
												))}
											</ul>
										) : (
											false
										)}

										<div className="grid grid-cols-3 gap-3">
											<Input type="text" placeholder="Enter name" value={fixedAllowance?.name} onChange={event => updateFixedAllowance({ ...fixedAllowance, name: event.target.value })} />
											<Input type="number" placeholder="Enter amount" value={fixedAllowance.amount} onChange={event => updateFixedAllowance({ ...fixedAllowance, amount: event.target.value })} />

											<Select onValueChange={event => updateFixedAllowance({ ...fixedAllowance, frequency: event })}>
												<SelectTrigger className="w-full">
													<SelectValue className="text-left" placeholder="Frequency" />
												</SelectTrigger>
												<SelectContent>
													<SelectGroup>
														<SelectItem value="one-off">One off</SelectItem>
														<SelectItem value="monthly">Monthly</SelectItem>
													</SelectGroup>
												</SelectContent>
											</Select>
										</div>
										<Button
											type="button"
											disabled={!fixedAllowance.amount || !fixedAllowance?.name || !fixedAllowance.frequency}
											onClick={() => {
												form.setValue('fixed_allowance', [...(form.getValues()?.fixed_allowance || []), fixedAllowance]);
												updateFixedAllowance({ name: '', amount: '', frequency: '' });
											}}>
											Add allowance
										</Button>
									</>
								)}
							</div>

							<FormField
								control={form.control}
								name="what_we_offer"
								render={() => (
									<div className="grid w-full gap-3">
										<FormLabel>Additional offerings</FormLabel>

										<div className="rounded-lg bg-accent p-4">
											{form.getValues().what_we_offer.length ? (
												<ul className="ml-4 grid gap-2">
													{form.getValues().what_we_offer.map((resp, index) => (
														<li key={index} className="list-disc text-xs text-foreground">
															{resp}
														</li>
													))}
												</ul>
											) : (
												<p className="text-xs font-light italic text-muted-foreground">No additional offering added yet</p>
											)}
										</div>

										<div className="grid w-full gap-2">
											<FormItem>
												<div className="flex items-end gap-2">
													<FormControl>
														<Textarea rows={1} value={offering} onChange={event => updateOffering(event.target.value)} placeholder="Type additional offer" className="min-h-5 py-[10px] text-xs font-light" />
													</FormControl>
													<Button
														type="button"
														disabled={!offering}
														size={'sm'}
														onClick={() => {
															form.setValue('what_we_offer', [...form.getValues().what_we_offer, offering]);
															updateOffering('');
														}}>
														Add
													</Button>
												</div>
												<FormDescription className="text-xs font-thin text-muted-foreground">Type and add additional offer one after the other</FormDescription>
											</FormItem>
										</div>
									</div>
								)}
							/>
						</div>
					</div>

					{/* location */}
					<div className="grid grid-cols-2 border-t border-t-border pt-10">
						<div>
							<h2 className="font-semibold">Location</h2>
							<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">Where will your new hire be working from: remote, office, or hybrid?</p>
						</div>

						<div className="mb-10 grid gap-10">
							<FormField
								control={form.control}
								name="work_location"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Work location</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Office, hybrid or remote" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="on-site">On-Site</SelectItem>
												<SelectItem value="hybrid">Hybrid</SelectItem>
												<SelectItem value="remote">Remote</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>

					<div className="flex items-center justify-end border-t border-t-border pt-10">
						<SubmitButton />
					</div>
				</form>
			</Form>
		</>
	);
};
