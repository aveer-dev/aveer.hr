'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { TablesInsert, TablesUpdate } from '@/type/database.types';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/loader';
import { inviteUser, updateContract } from './invite-user.action';

const supabase = createClient();

const formSchema = z.object({
	first_name: z.string(),
	last_name: z.string(),
	email: z.string().email(),
	nationality: z.string(),
	job_title: z.string(),
	level: z.string().optional(),
	employment_type: z.string().optional(),
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
	sick_leave: z.number()
});

export const AddPerson = ({ data, duplicate }: { data?: TablesUpdate<'contracts'>; duplicate?: TablesUpdate<'contracts'> }) => {
	const [countries, setCountries] = useState<{ name: string; dial_code: string; country_code: string }[]>([]);
	const [entities, setEntities] = useState<{ id: number }[]>([]);
	const [jobTitles, updateJobTitles] = useState<string[]>([]);
	const [jobLevels, updateJobLevels] = useState<string[]>([]);
	const [responsibility, updateResponsibility] = useState('');
	const [fixedAllowance, updateFixedAllowance] = useState({ name: '', amount: '', frequency: '' });
	const [showSigningBonus, toggleShowSigningBonus] = useState(!!data?.signing_bonus || !!duplicate?.signing_bonus);
	const [showFixedIncome, toggleShowFixedIncome] = useState(!!data?.fixed_allowance || !!duplicate?.fixed_allowance);
	const [indefiniteEndDate, toggleIndefiniteEndDate] = useState(!data?.end_date);
	const [jobQuery, setJobQuery] = useState<string>('');
	const [levelQuery, setLevelQuery] = useState<string>('');
	const [isSubmiting, toggleSubmitState] = useState(false);
	const params = useParams<{ org_id: string }>();

	const getCountries = async () => {
		const { data, error } = await supabase.from('countries').select();
		if (!error) setCountries(data);
	};

	const getEntities = useCallback(async () => {
		const { data, error } = await supabase.from('legal_entities').select('id').eq('org', params.org_id);
		if (!error) setEntities(data);
	}, [params.org_id]);

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
			salary: data?.salary ? String(data?.salary) : duplicate?.salary ? String(duplicate?.salary) : undefined,
			signing_bonus: data?.signing_bonus ? String(data?.signing_bonus) : duplicate?.signing_bonus ? String(duplicate?.signing_bonus) : undefined,
			employment_type: data?.employment_type || duplicate?.employment_type || undefined,
			level: data?.level || duplicate?.level || undefined,
			job_title: data?.job_title || duplicate?.job_title || undefined
		}
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		toggleSubmitState(true);

		const profile: TablesInsert<'profiles'> = {
			first_name: values.first_name,
			last_name: values.last_name,
			nationality: values.nationality,
			email: values.email,
			id: ''
		};
		const contract: TablesInsert<'contracts'> = {
			employment_type: values.employment_type,
			end_date: values.end_date as unknown as string,
			start_date: values.start_date as unknown as string,
			salary: Number(values.salary),
			sick_leave: values.sick_leave,
			paid_leave: values.paid_leave,
			probation_period: values.probation_period,
			work_schedule: values.work_schedule,
			work_shedule_interval: values.work_shedule_interval,
			job_title: values.job_title,
			level: values.level,
			responsibilities: values.responsibilities,
			profile: data ? (data?.profile as any).id : '',
			entity: entities[0].id,
			org: Number(params.org_id)
		};
		if (showSigningBonus) contract.signing_bonus = Number(values.signing_bonus);
		if (showFixedIncome) contract.fixed_allowance = values.fixed_allowance;

		const responseMessage = data ? await updateContract(JSON.stringify(contract)) : await inviteUser(JSON.stringify(contract), JSON.stringify(profile));
		toggleSubmitState(false);

		if (responseMessage == 'update') return toast.success('Contract details updated successfully');
		if (responseMessage) toast.error(responseMessage);
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
		<Form {...form}>
			<form className="grid w-full gap-6" onSubmit={form.handleSubmit(onSubmit)}>
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
										<Popover>
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

					{/* <div className={cn(buttonVariants(), 'p-0')}>
						<DropdownMenu>
							<Button size={'sm'}>Add Person</Button>

							<DropdownMenuTrigger asChild>
								<Button size={'icon'} className="h-full !outline-none !ring-0 !ring-offset-0">
									<ChevronDown size={16} />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuGroup>
									<DropdownMenuItem className="p-0">
										<Button size={'sm'} variant={'ghost'} className="">
											Add person and reset form
										</Button>
									</DropdownMenuItem>
								</DropdownMenuGroup>
							</DropdownMenuContent>
						</DropdownMenu>
					</div> */}
				</div>
			</form>
		</Form>
	);
};
