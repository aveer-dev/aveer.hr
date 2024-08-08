'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

const formSchema = z.object({
	first_name: z.string(),
	last_name: z.string(),
	email: z.string().email(),
	nationality: z.string(),
	job_title: z.string(),
	level: z.string(),
	employment_type: z.string(),
	work_schedule: z.string(),
	work_shedule_interval: z.string(),
	responsibilities: z.array(z.string()),
	salary: z.string(),
	signing_bonus: z.string(),
	fixed_allowance: z.array(z.object({ name: z.string(), amount: z.string(), frequency: z.string() })),
	start_date: z.date(),
	end_date: z.date(),
	probation_period: z.number(),
	paid_leave: z.number(),
	sick_leave: z.number()
});

export const AddPerson = () => {
	const [countries, setCountries] = useState<{ name: string; dial_code: string; country_code: string }[]>([]);
	const [jobTitles, updateJobTitles] = useState<string[]>([]);
	const [jobLevels, updateJobLevels] = useState<string[]>([]);
	const [responsibility, updateResponsibility] = useState('');
	const [fixedAllowance, updateFixedAllowance] = useState({ name: '', amount: '', frequency: '' });
	const [showSigningBonus, toggleShowSigningBonus] = useState(false);
	const [showFixedIncome, toggleShowFixedIncome] = useState(false);
	const [indefiniteEndDate, toggleIndefiniteEndDate] = useState(false);
	const [jobQuery, setJobQuery] = useState<string>('');
	const [levelQuery, setLevelQuery] = useState<string>('');

	const getCountries = async () => {
		const { data, error } = await supabase.from('countries').select();
		if (!error) setCountries(data);
	};

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			first_name: '',
			last_name: '',
			email: '',
			nationality: '',
			responsibilities: [],
			fixed_allowance: [],
			start_date: new Date(),
			probation_period: 90,
			paid_leave: 20,
			sick_leave: 20
		}
	});

	function onSubmit(values: z.infer<typeof formSchema>) {
		console.log(values);
	}

	useEffect(() => {
		getCountries();
	}, []);

	return (
		<Form {...form}>
			<form className="mx-auto grid w-full max-w-4xl gap-6" onSubmit={form.handleSubmit(onSubmit)}>
				<h1 className="text-xl font-semibold">Add Person</h1>

				<div className="grid grid-cols-2 border-t border-t-border pt-10">
					<div>
						<h2 className="font-semibold">Personal details</h2>
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
											<Input type="text" placeholder="Enter first name" {...field} required />
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
											<Input type="text" placeholder="Enter last name" {...field} required />
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
											<Input type="email" placeholder="Enter email" {...field} required />
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
													<Button variant="outline" role="combobox" className={cn('w-full justify-between bg-input-bg', !field.value && 'text-muted-foreground')}>
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
																	value={country.country_code}
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
									{form.getValues().responsibilities.map(resp => (
										<li className="list-disc text-xs text-foreground">{resp}</li>
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
											<Switch onCheckedChange={event => toggleShowSigningBonus(event)} id="signin-bonus" className="scale-75" />
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
								<Switch id="signin-bonus" onCheckedChange={event => toggleShowFixedIncome(event)} className="scale-75" />
							</div>

							{showFixedIncome && (
								<>
									{form.getValues().fixed_allowance.length ? (
										<ul className="grid list-disc gap-2 py-2">
											{form.getValues().fixed_allowance.map(allowance => (
												<li className="flex list-disc items-center justify-between p-1 text-xs font-light">
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
											form.setValue('fixed_allowance', [...form.getValues().fixed_allowance, fixedAllowance]);
											updateFixedAllowance({ name: '', amount: '', frequency: '' });
										}}>
										Add allowance
									</Button>
								</>
							)}
						</div>
					</div>
				</div>

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
											<Switch onCheckedChange={event => toggleIndefiniteEndDate(event)} id="indefinite" className="scale-75" />
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
					<div className={cn(buttonVariants(), 'p-0')}>
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
					</div>
				</div>
			</form>
		</Form>
	);
};
