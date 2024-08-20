'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, ChevronDown, Info } from 'lucide-react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { DatePicker } from '@/components/ui/date-picker';
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
import { useParams, useSearchParams } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/loader';
import { createLevel, inviteUser, updateContract } from './invite-user.action';
import { Separator } from '@/components/ui/separator';
import { EORAgreementDrawer } from '@/components/eor/eor-agreement';
import { createEORAgreement, doesUserHaveAdequatePermissions, getEORAgreementByCountry } from '@/utils/api';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { NewContractDialog } from './new-contract-dialog';

const supabase = createClient();

const formSchema = z.object({
	first_name: z.string(),
	last_name: z.string(),
	email: z.string().email(),
	nationality: z.string(),
	job_title: z.string(),
	level: z.object({ level: z.string(), role: z.string().optional(), salary: z.number() }).optional(),
	employment_type: z.enum(['full-time', 'part-time']),
	work_schedule: z.string().optional(),
	work_shedule_interval: z.string().optional(),
	responsibilities: z.array(z.string()),
	salary: z.string(),
	signing_bonus: z.string().optional(),
	fixed_allowance: z.array(z.object({ name: z.string(), amount: z.string(), frequency: z.string() })).optional(),
	start_date: z.date(),
	end_date: z.date().optional(),
	probation_period: z.number(),
	paid_leave: z.number(),
	sick_leave: z.number(),
	entity: z.string()
});

export const AddPerson = ({ data, duplicate }: { data?: TablesUpdate<'contracts'>; duplicate?: TablesUpdate<'contracts'> }) => {
	const [countries, setCountries] = useState<{ name: string; dial_code: string; country_code: string }[]>([]);
	const [entities, setEntities] = useState<Tables<'legal_entities'>[]>([]);
	const [eorEntities, setEorEntities] = useState<Tables<'legal_entities'>[]>([]);
	const [jobTitles, updateJobTitles] = useState<string[]>([]);
	const [jobLevels, updateJobLevels] = useState<{ level: string; role: string; salary: number }[]>(levels);
	const [orgJobLevels, updateOrgJobLevels] = useState<{ level: string; role: string; salary: number }[]>([]);
	const [responsibility, updateResponsibility] = useState('');
	const [fixedAllowance, updateFixedAllowance] = useState({ name: '', amount: '', frequency: '' });
	const [showSigningBonus, toggleShowSigningBonus] = useState(!!data?.signing_bonus || !!duplicate?.signing_bonus);
	const [showFixedIncome, toggleShowFixedIncome] = useState(!!data?.fixed_allowance || !!duplicate?.fixed_allowance);
	const [indefiniteEndDate, toggleIndefiniteEndDate] = useState(!data?.end_date);
	const [jobQuery, setJobQuery] = useState<string>('');
	const [levelQuery, setLevelQuery] = useState<string>('');
	const [isSubmiting, toggleSubmitState] = useState(false);
	const params = useParams<{ org: string }>();
	const searchParams = useSearchParams();
	const [isAlertOpen, toggleAgreementDialog] = useState(false);
	const [agreementId, setAgreementId] = useState<number>();
	const [isLevelsOpen, toggleLevelsDropdown] = useState(false);
	const [isTitlesOpen, toggleTitlesDropdown] = useState(false);
	const [isNationalityOpen, toggleNationalityDropdown] = useState(false);
	const [isNewContractDialogOpen, toggleNewContractDialog] = useState(false);
	const [newContractId, setNewContractId] = useState(0);
	const [isLevelCreated, setLevelCreationState] = useState(false);

	const getCountries = async () => {
		const { data, error } = await supabase.from('countries').select();
		if (!error) setCountries(data);
	};

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			first_name: (data?.profile as any)?.first_name || '',
			last_name: (data?.profile as any)?.last_name || '',
			email: (data?.profile as any)?.email || '',
			nationality: (data?.profile as any)?.nationality || '',
			responsibilities: (data?.responsibilities as string[]) || (duplicate?.responsibilities as string[]) || [],
			fixed_allowance: (data?.fixed_allowance as any) || (duplicate?.fixed_allowance as any) || [],
			start_date: data?.start_date ? new Date(data?.start_date) : new Date(),
			end_date: data?.end_date ? new Date(data?.end_date) : duplicate?.end_date ? new Date(duplicate?.end_date) : new Date(),
			probation_period: data?.probation_period || duplicate?.probation_period || 90,
			paid_leave: data?.paid_leave || duplicate?.paid_leave || 20,
			sick_leave: data?.sick_leave || duplicate?.sick_leave || 20,
			work_schedule: data?.work_schedule || duplicate?.work_schedule || '8',
			work_shedule_interval: data?.work_shedule_interval || duplicate?.work_shedule_interval || 'daily',
			salary: data?.salary ? String(data?.salary) : duplicate?.salary ? String(duplicate?.salary) : '',
			signing_bonus: data?.signing_bonus ? String(data?.signing_bonus) : duplicate?.signing_bonus ? String(duplicate?.signing_bonus) : undefined,
			employment_type: data?.employment_type || duplicate?.employment_type || undefined,
			job_title: data?.job_title || duplicate?.job_title || undefined,
			entity: data?.entity ? String(data?.entity) : duplicate?.entity ? String(duplicate?.entity) : undefined
		}
	});

	const checkLevels = useCallback(
		(levels: any[] | null) => {
			if (!data?.level && !duplicate?.level) return;

			const newOrgJobLevel = levels?.find(title => title.level == data?.level || title.level == duplicate?.level);
			if (!newOrgJobLevel) return;
			form.setValue('level', newOrgJobLevel);
		},
		[data, duplicate, form]
	);

	const getOrgLevels = useCallback(async () => {
		const { data, error } = await supabase.from('employee_levels').select().match({ org: params.org });
		if (error) toast.error('🫤 Error', { description: `Unable to fetch existing org levels ${error.message}` });
		if (data?.length) updateOrgJobLevels(data?.map(level => ({ level: level.level as string, role: level.role as string, salary: level.salary as number })) || []);
		checkLevels(data);
	}, [checkLevels, params]);

	const getEntities = useCallback(async () => {
		const { data, error } = await supabase.from('legal_entities').select().eq('org', params.org);
		const { data: eorData, error: eorError } = await supabase.from('legal_entities').select().eq('is_eor', true);

		if (!error) setEntities(data);
		if (!eorError) setEorEntities(eorData);
	}, [params.org]);

	const isEntityEOR = async (entityId: number) => {
		const entity = eorEntities.find(entity => entity.id === Number(entityId));
		return entity;
	};

	const createEmployeeLevel = async (level: TablesInsert<'employee_levels'>) => {
		const response = await createLevel(level);
		if (response) {
			toggleSubmitState(false);
			return toast.error('😔 Error', { description: response });
		}
		setLevelCreationState(true);
		return true;
	};

	const createContract = async (values: z.infer<typeof formSchema>) => {
		const orgHasExistingLevel = orgJobLevels.length > 0 ? !!orgJobLevels.find(level => level.level == values.level?.level && level.salary == level.salary) : false;

		if (!orgHasExistingLevel && values.level) {
			const level: TablesInsert<'employee_levels'> = { ...values.level, org: params.org };
			await createEmployeeLevel(level);
		}

		const profile: TablesInsert<'profiles'> = {
			first_name: values.first_name,
			last_name: values.last_name,
			nationality: values.nationality,
			email: values.email,
			id: ''
		};
		const contract: TablesInsert<'contracts'> = {
			employment_type: values.employment_type,
			start_date: values.start_date as unknown as string,
			salary: Number(values.salary),
			sick_leave: values.sick_leave,
			paid_leave: values.paid_leave,
			probation_period: values.probation_period,
			work_schedule: values.work_schedule,
			work_shedule_interval: values.work_shedule_interval,
			job_title: values.job_title,
			level: values.level?.level,
			responsibilities: values.responsibilities,
			profile: data ? (data?.profile as any).id : '',
			entity: Number(values.entity),
			org: params.org,
			contract_type: (searchParams.get('type') as any) || data?.contract_type
		};
		if (showSigningBonus) contract.signing_bonus = Number(values.signing_bonus);
		if (showFixedIncome) contract.fixed_allowance = values.fixed_allowance;
		if (!indefiniteEndDate) contract.end_date = values.end_date as any;

		const responseMessage = data ? await updateContract(JSON.stringify(contract)) : await inviteUser(JSON.stringify(contract), JSON.stringify(profile));

		toggleSubmitState(false);
		if (responseMessage == 'update') return toast.success('Contract details updated successfully');
		if (typeof responseMessage == 'number') {
			setNewContractId(responseMessage);
			return toggleNewContractDialog(true);
		}
		if (responseMessage) return toast.error(responseMessage);
	};

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		// does user have adequate permission for this?
		const userHasPermission = await doesUserHaveAdequatePermissions({ orgId: params.org });
		if (userHasPermission !== true) return toast.error(userHasPermission);

		toggleSubmitState(true);

		// does contract require EOR?
		const entityData = await isEntityEOR(Number(values.entity));
		if (entityData?.is_eor !== true) return createContract(values);

		// if the contract requires EOR contract, does the or have an existing contract
		const eorAgreement = await getEORAgreementByCountry(entityData?.incorporation_country as string);
		if (eorAgreement.error) {
			toggleSubmitState(false);
			return toast.error(eorAgreement.error.message);
		}

		// if org does not have an existing contract, create one and prompt to sign
		if (!eorAgreement.data.length) {
			const res = await createEORAgreement({ org: params.org });
			if (typeof res !== 'number') return toast.error(res);
			setAgreementId(res);

			return toggleAgreementDialog(true);
		}

		// if org has a contract and hasn't signed, prompt to sign contract
		if (!eorAgreement.data[0].signed_by) {
			setAgreementId(eorAgreement.data[0].id);
			return toggleAgreementDialog(true);
		}

		// if contract exists and signed, create contract
		return createContract(values);
	};

	const onSignAgreement = () => {
		const values = form.getValues();
		if (values) createContract(values);
	};

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

		const entity = data?.entity || duplicate?.entity;
		if (entity) form.setValue('entity', String(entity));

		getOrgLevels();
		checkTitle();
	}, [data, duplicate, jobTitles, jobLevels, form, getOrgLevels]);

	return (
		<>
			{isAlertOpen && (
				<EORAgreementDrawer
					agreementId={agreementId}
					completeContract={onSignAgreement}
					eorEntities={eorEntities}
					entities={entities}
					entity={String(entities[0]?.id)}
					eor_entity={Number(form.getValues('entity'))}
					isAlertOpen={isAlertOpen}
					toggleAgreementDialog={toggleAgreementDialog}
					onCancel={() => toggleAgreementDialog(false)}
				/>
			)}

			<NewContractDialog isAlertOpen={isNewContractDialogOpen} toggleDialog={toggleNewContractDialog} contractId={newContractId} isLevelCreated={isLevelCreated} />

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
										<Select onValueChange={field.onChange} defaultValue={field.value ? field.value : undefined}>
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
															{entity.name} • <span className="text-muted-foreground">{entity.incorporation_country}</span>
														</SelectItem>
													))}
												</SelectGroup>

												{entities.length !== 0 && <Separator className="my-3" />}

												<SelectGroup>
													{eorEntities.length && <SelectLabel>Hire with aveer.hr</SelectLabel>}
													{eorEntities.map(entity => (
														<SelectItem key={entity.id} value={String(entity.id)}>
															{entity.name} • <span className="text-muted-foreground">{entity.incorporation_country}</span>
														</SelectItem>
													))}
												</SelectGroup>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>

					{/* employee details */}
					<div className="grid grid-cols-2 border-t border-t-border pt-10">
						<div>
							<h2 className="font-semibold">{data ? 'Employee details' : 'Personal details'}</h2>
							<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">This should be the public name of your entire organisation. This is mostly an organisation identifier.</p>
						</div>

						<div className="mb-10 grid gap-8">
							<div className="grid grid-cols-2 gap-6">
								<FormField
									control={form.control}
									name="first_name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>First name</FormLabel>
											<FormControl>
												<Input disabled={!!data} type="text" placeholder="Enter first name" {...field} required />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="last_name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Last name</FormLabel>
											<FormControl>
												<Input disabled={!!data} type="text" placeholder="Enter last name" {...field} required />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="grid grid-cols-2 gap-6">
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email</FormLabel>
											<FormControl>
												<Input disabled={!!data} type="email" placeholder="Enter email" {...field} required />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="nationality"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Nationalty</FormLabel>
											<Popover open={isNationalityOpen} onOpenChange={toggleNationalityDropdown}>
												<PopoverTrigger asChild>
													<FormControl>
														<Button disabled={!!data} variant="outline" role="combobox" className={cn('w-full justify-between bg-input-bg', !field.value && 'text-muted-foreground')}>
															{field.value ? countries.find(country => country.country_code === field.value)?.name : `Select employee's nationality`}
															<ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
														</Button>
													</FormControl>
												</PopoverTrigger>
												<PopoverContent className="w-[200px] p-0">
													<Command>
														<CommandInput placeholder="Search countries..." />
														<CommandList>
															<CommandEmpty>Country not found</CommandEmpty>
															<CommandGroup>
																{countries.map(country => (
																	<CommandItem
																		value={country.name}
																		key={country.country_code}
																		onSelect={() => {
																			form.setValue('nationality', country.country_code);
																			toggleNationalityDropdown(false);
																		}}>
																		<Check className={cn('mr-2 h-4 w-4', country.country_code === field.value ? 'opacity-100' : 'opacity-0')} />
																		{country.name}
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
						</div>
					</div>

					{/* employment details */}
					<div className="grid grid-cols-2 border-t border-t-border pt-10">
						<div>
							<h2 className="font-semibold">Employment details</h2>
							<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">This should be the public name of your entire organisation. This is mostly an organisation identifier.</p>
						</div>

						<div className="mb-10 grid gap-8">
							<div className="grid grid-cols-2 gap-6">
								<FormField
									control={form.control}
									name="job_title"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Job title</FormLabel>
											<Popover open={isTitlesOpen} onOpenChange={toggleTitlesDropdown}>
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
																	toggleTitlesDropdown(false);
																}}
																className="p-1">
																<div className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-xs font-light outline-none">
																	<Check className={cn('mr-2 h-4 w-4', jobQuery && jobQuery === field.value ? 'opacity-100' : 'opacity-0')} />
																	{jobQuery}
																</div>
															</CommandEmpty>
															<CommandGroup>
																{jobTitles.map(title => (
																	<CommandItem
																		value={title}
																		key={title}
																		onSelect={() => {
																			form.setValue('job_title', title);
																			toggleTitlesDropdown(false);
																		}}>
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
											<Popover open={isLevelsOpen} onOpenChange={toggleLevelsDropdown}>
												<PopoverTrigger asChild>
													<FormControl>
														<Button variant="outline" role="combobox" className={cn('w-full justify-between bg-input-bg', !field.value && 'text-muted-foreground')}>
															{field.value?.level || `Select seniority level`}
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
																	updateOrgJobLevels([...orgJobLevels, { level: levelQuery, role: '', salary: 0 }]);
																	form.setValue('level', { level: levelQuery, role: '', salary: 0 });
																	setLevelQuery('');
																	toggleLevelsDropdown(false);
																}}
																className="p-1">
																<div className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-xs font-light outline-none">
																	<Check className={cn('mr-2 h-4 w-4', levelQuery && levelQuery === field.value?.level ? 'opacity-100' : 'opacity-0')} />
																	{levelQuery}
																</div>
															</CommandEmpty>
															{orgJobLevels.length > 0 && (
																<CommandGroup heading="Active Org Levels">
																	{orgJobLevels.map(level => (
																		<CommandItem
																			className="gap-2"
																			value={level.level}
																			key={level.level}
																			onSelect={() => {
																				form.setValue('level', level);
																				toggleLevelsDropdown(false);
																				form.setValue('salary', String(level.salary));
																			}}>
																			<div className="flex items-center">
																				<Check className={cn('mr-2 h-3 w-3', level.level === field.value?.level ? 'opacity-100' : 'opacity-0')} />
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
																		value={level.level}
																		key={level.level}
																		onSelect={() => {
																			form.setValue('level', level);
																			toggleLevelsDropdown(false);
																			form.setValue('salary', String(level.salary));
																		}}>
																		<div className="flex items-center">
																			<Check className={cn('mr-2 h-3 w-3', level.level === field.value?.level ? 'opacity-100' : 'opacity-0')} />
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
														<Input type="text" placeholder="40" {...field} required />
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

							<div className="grid w-full gap-6">
								<Label htmlFor="email">Job responsibilities</Label>
								{form.getValues().responsibilities.length ? (
									<ul className="ml-4 grid gap-2">
										{form.getValues().responsibilities.map((resp, index) => (
											<li key={index} className="list-disc text-xs text-foreground">
												{resp}
											</li>
										))}
									</ul>
								) : (
									false
								)}

								<div className="grid w-full gap-2">
									<FormItem>
										<FormControl>
											<Textarea value={responsibility} onChange={event => updateResponsibility(event.target.value)} placeholder="Type job description here" className="resize-none text-xs font-light" />
										</FormControl>
										<FormDescription className="text-xs font-thin text-muted-foreground">Type and add job descriptions one after the other</FormDescription>
									</FormItem>

									<Button
										type="button"
										disabled={!responsibility}
										size={'sm'}
										onClick={() => {
											form.setValue('responsibilities', [...form.getValues().responsibilities, responsibility]);
											updateResponsibility('');
										}}>
										Add job description
									</Button>
								</div>
							</div>
						</div>
					</div>

					{/* compensation */}
					<div className="grid grid-cols-2 border-t border-t-border pt-10">
						<div>
							<h2 className="font-semibold">Compensation</h2>
							<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">This should be the public name of your entire organisation. This is mostly an organisation identifier.</p>
						</div>

						<div className="mb-10 grid gap-8">
							<FormField
								control={form.control}
								name="salary"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="flex items-center justify-between">
											Salary
											<div className="">
												{field.value ? (
													<div className="flex gap-1">
														{new Intl.NumberFormat('en-US', {
															style: 'currency',
															currency: 'USD'
														}).format(Number(field.value))}
														<TooltipProvider>
															<Tooltip>
																<TooltipTrigger asChild>
																	<button>
																		<Info size={12} />
																	</button>
																</TooltipTrigger>
																<TooltipContent side="left">
																	<p className="max-w-40 text-wrap text-xs text-muted-foreground">Formated to fit default currency</p>
																</TooltipContent>
															</Tooltip>
														</TooltipProvider>
													</div>
												) : (
													''
												)}
											</div>
										</FormLabel>
										<FormControl>
											<Input type="number" placeholder="Employee gross annual salary" {...field} required />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid w-full gap-3 rounded-lg bg-accent p-2">
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
															{allowance.name} • <span className="text-xs font-light text-muted-foreground">${allowance.amount}</span>
														</div>
														<div className="text-muted-foreground">{allowance.frequency}</div>
													</li>
												))}
											</ul>
										) : (
											false
										)}

										<div className="grid grid-cols-3 gap-3">
											<Input type="text" placeholder="Enter name" value={fixedAllowance.name} onChange={event => updateFixedAllowance({ ...fixedAllowance, name: event.target.value })} />
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
											disabled={!fixedAllowance.amount || !fixedAllowance.name || !fixedAllowance.frequency}
											onClick={() => {
												form.setValue('fixed_allowance', [...(form.getValues()?.fixed_allowance || []), fixedAllowance]);
												updateFixedAllowance({ name: '', amount: '', frequency: '' });
											}}>
											Add allowance
										</Button>
									</>
								)}
							</div>
						</div>
					</div>

					{/* job schedule */}
					<div className="grid grid-cols-2 border-t border-t-border pt-10">
						<div>
							<h2 className="font-semibold">Job Schedule</h2>
							<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">This should be the public name of your entire organisation. This is mostly an organisation identifier.</p>
						</div>

						<div className="mb-10 grid gap-8">
							<FormField
								control={form.control}
								name="start_date"
								render={({ field }) => (
									<FormItem className="flex flex-col">
										<FormLabel>Employment start date</FormLabel>
										<DatePicker onSetDate={field.onChange} selected={field.value} />
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="end_date"
								render={({ field }) => (
									<FormItem className="grid gap-1">
										<FormLabel>Employment end date</FormLabel>
										<div className="grid w-full gap-3 rounded-lg bg-accent px-2 py-2">
											<div className="flex items-center justify-between space-x-2">
												<Label htmlFor="indefinite">Indefinite</Label>
												<Switch checked={indefiniteEndDate} onCheckedChange={event => toggleIndefiniteEndDate(event)} id="indefinite" className="scale-75" />
											</div>

											{!indefiniteEndDate && <DatePicker onSetDate={field.onChange} selected={field.value} />}
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-2 gap-6">
								<FormField
									control={form.control}
									name="paid_leave"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Paid time off</FormLabel>
											<FormControl>
												<div className="relative h-fit w-full">
													<Input type="number" placeholder="20" {...field} required />
													<div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-thin text-foreground">days/month</div>
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
													<div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-thin text-foreground">days/month</div>
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
											<Input type="number" placeholder="90" {...field} required />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>

					<div className="flex items-center justify-end border-t border-t-border pt-10">
						<Button disabled={isSubmiting} type="submit" size={'sm'} className="gap-3 px-6 text-sm font-light">
							{isSubmiting && <LoadingSpinner />}
							{isSubmiting ? (data ? 'Updating contract...' : 'Adding person...') : data ? 'Update Contract' : 'Add person'}
						</Button>
					</div>
				</form>
			</Form>
		</>
	);
};

const levels = [
	{ level: 'IC Level 1', role: 'Entry', salary: 50000 },
	{ level: 'IC Level 2', role: 'Mid I', salary: 72000 },
	{ level: 'IC Level 3', role: 'Mid II', salary: 92000 },
	{ level: 'IC Level 4', role: 'Mid II', salary: 110000 },
	{ level: 'IC Level 5', role: 'Senior I', salary: 160000 },
	{ level: 'IC Level 6', role: 'Senior II', salary: 180000 },
	{ level: 'IC Level 7', role: 'Staff', salary: 240000 },
	{ level: 'IC Level 8', role: 'Principal', salary: 280000 },
	{ level: 'IC Level 9', role: 'VP', salary: 350000 },
	{ level: 'IC Level 10', role: 'Executive', salary: 400000 }
];
