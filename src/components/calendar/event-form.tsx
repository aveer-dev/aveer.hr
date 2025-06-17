import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Textarea } from '@/components/ui/textarea';
import { cn, getAllTimezones, getCurrentTimezone, getTime, parseRecurrenceRule } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { add, format } from 'date-fns';
import { ArrowRight, BellDot, Check, ChevronsUpDown, Copy, LetterText, MapPin, Plus, Text, Trash2, UsersRound, X } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Tables } from '@/type/database.types';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loader';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { RecurrenceDialog } from './recurrence-dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { searchPeople } from '@/utils/employee-search';
import { searchTeams } from '@/lib/utils/team-search';
import { createCalendarEvent, deleteCalendarEvent, updateCalendarEvent } from './calendar-actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '../ui/badge';
import Image from 'next/image';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ROLE } from '@/type/contract.types';

const formSchema = z.object({
	summary: z.string().min(2, { message: 'Enter event title' }),
	description: z.string().optional(),
	end: z.object({ dateTime: z.date({ message: 'Select end dateTime' }), timeZone: z.string() }),
	start: z.object({ dateTime: z.date({ message: 'Select end dateTime' }), timeZone: z.string() }),
	recurrence: z.string().optional().nullable(),
	attendees: z.array(z.object({ email: z.string() })).optional(),
	location: z.string().optional()
});

const timezones = getAllTimezones();
const currentTimezone = getCurrentTimezone();

interface EMPLOYEE {
	id: number;
	job_title: string;
	team: number;
	profile: { first_name: string; last_name: string; id: string; email: string };
}

interface PROPS {
	teamsList?: Tables<'teams'>[] | null;
	employeeList?: EMPLOYEE[];
	date?: Date;
	org: string;
	calendar?: Tables<'calendars'> | null;
	onCreateEvent: () => void;
	onClose: () => void;
	event?: Tables<'calendar_events'>;
	role?: ROLE;
}

type period = 'minutes' | 'hours' | 'days' | 'weeks';

interface reminder {
	minutes: number;
	period: period;
	value: number;
}

export const EventForm = ({ date, role = 'admin', org, calendar, onCreateEvent, teamsList, onClose, employeeList, event }: PROPS) => {
	const [employees, setEmployees] = useState<EMPLOYEE[]>([]);
	const [teams, setTeams] = useState<Tables<'teams'>[]>([]);
	const [filteredEmployees, setFilteredEmployees] = useState<EMPLOYEE[]>([]);
	const [filteredTeams, setFilteredETeams] = useState<Tables<'teams'>[]>([]);
	const [isCreating, setCreatingState] = useState(false);
	const [isDeleting, setDeletingState] = useState(false);
	const router = useRouter();
	const [invitees, updateInvitees] = useState<{ single?: EMPLOYEE; team?: { name: string; id: number; people: EMPLOYEE[] }; all?: EMPLOYEE[] }[]>((event?.attendees as any) || []);
	const [locationType, setLocationType] = useState(!event || event?.meeting_link ? 'virtual' : 'physical');
	const [isTimezoneOpen, toggleTimezoneState] = useState(false);
	const allowEdit = !!teams && !!employeeList && role == 'admin';
	console.log('🚀 ~ EventForm ~ allowEdit:', allowEdit);
	const [eventReminders, updateEventReminder] = useState<reminder[]>((event?.reminders as any) || []);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			summary: event?.summary || '',
			description: event?.description || '',
			end: { dateTime: (event?.end as any)?.dateTime ? new Date((event?.end as any)?.dateTime) : date || new Date(), timeZone: event?.time_zone || (event?.end as any)?.timeZone || currentTimezone },
			start: { dateTime: (event?.start as any)?.dateTime ? new Date((event?.start as any)?.dateTime) : date || new Date(), timeZone: event?.time_zone || (event?.start as any)?.timeZone || currentTimezone },
			recurrence: event?.recurrence as any,
			attendees: event?.attendees as any,
			location: event?.location || ''
		}
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		if (event) return updateEvent(values);
		setCreatingState(true);

		try {
			const response = await createCalendarEvent({
				calendar,
				role,
				virtual: locationType == 'virtual',
				attendees: values.attendees || [],
				payload: {
					...values,
					attendees: invitees as any,
					calendar_id: calendar?.calendar_id,
					org,
					event_id: '',
					end: { dateTime: values.end.dateTime.toISOString(), timeZone: values.end.timeZone } as any,
					start: { dateTime: values.start.dateTime.toISOString(), timeZone: values.start.timeZone } as any,
					reminders: eventReminders as any
				}
			});
			if (typeof response !== 'string') event = response;

			toast.success('Calendar event created successfully');
			setCreatingState(false);
			router.refresh();
		} catch (error: any) {
			toast.error(error?.message || error);
			setCreatingState(false);
		}
	};

	const updateEvent = async (values: z.infer<typeof formSchema>) => {
		if (!event) return;
		setCreatingState(true);

		try {
			await updateCalendarEvent({
				calendar: calendar,
				role,
				virtual: locationType == 'virtual',
				attendees: values.attendees || [],
				id: event?.id,
				payload: {
					...values,
					attendees: invitees as any,
					org,
					event_id: event?.event_id,
					end: { dateTime: values.end.dateTime.toISOString(), timeZone: values.end.timeZone } as any,
					start: { dateTime: values.start.dateTime.toISOString(), timeZone: values.start.timeZone } as any,
					reminders: eventReminders as any
				}
			});
			toast.success('Calendar event updated successfully');
			setCreatingState(false);
			router.refresh();
			onCreateEvent();
		} catch (error: any) {
			toast.error(error?.message || error);
			setCreatingState(false);
		}
	};

	const onDeleteEvent = async () => {
		if (!event) return;

		setDeletingState(true);
		try {
			if (!calendar?.calendar_id) return;

			const response = await deleteCalendarEvent({ id: event?.id as number, calendarId: calendar?.calendar_id, eventId: event.event_id });
			setDeletingState(false);
			if (typeof response == 'string') return toast.error(response);
			toast.success('Event deleted successfully');
			router.refresh();
			onClose();
		} catch (error: any) {
			toast.error(error?.message || error);
			setDeletingState(false);
		}
	};

	useEffect(() => {
		setEmployees(employeeList?.filter(employee => !invitees?.find(invitee => employee?.id == invitee.single?.id)) || []);
		setTeams(teamsList?.filter(team => !invitees?.find(invitee => team?.id == invitee.team?.id)) || []);

		setFilteredEmployees(result => result?.filter(employee => !invitees?.find(invitee => employee?.id == invitee.single?.id)) || []);
		setFilteredETeams(result => result?.filter(team => !invitees?.find(invitee => team?.id == invitee.team?.id)) || []);

		const inviteesEmails = invitees
			.map(invitee => {
				if (invitee.team) return invitee.team.people.map(employee => employee?.profile.email);

				if (invitee.single) return invitee.single.profile.email;

				if (invitee.all) return invitee.all.map(employee => employee?.profile.email);
			})
			.flat();

		form.setValue('attendees', [...new Set(inviteesEmails.map(email => ({ email: email as string })))]);
	}, [employeeList, invitees, teamsList, form]);

	const copy = (text: string) => {
		navigator.clipboard.writeText(text);
		toast.message('Meeting link copied to clipboard');
	};

	const onAddReminder = () => {
		if (eventReminders.length >= 5) return;

		const updatedEventReminders: reminder[] = [...eventReminders, { minutes: 0, period: 'minutes', value: 30 }];
		updateEventReminder(updatedEventReminders);
	};

	const onUpdateAReminder = ({ index, value, period }: { index: number; value?: string; period?: period }) => {
		if (Number(value) <= 0) return;

		const reminder = eventReminders[index];

		switch (period || reminder.period) {
			case 'minutes':
				reminder.minutes = Number(value) || reminder.value;
				break;
			case 'hours':
				reminder.minutes = (Number(value) || reminder.value) * 60;
				break;
			case 'days':
				reminder.minutes = (Number(value) || reminder.value) * 1440;
				break;
			case 'weeks':
				reminder.minutes = (Number(value) || reminder.value) * 10080;
				break;
			default:
				break;
		}

		if (reminder.minutes > 40320 && period) return;

		eventReminders[index] = { ...reminder, value: Number(value) || reminder.value, period: period || reminder.period };
		updateEventReminder([...eventReminders]);
	};

	const onRemoveReminder = (index: number) => {
		const updatedReminders = [...eventReminders.slice(0, index), ...eventReminders.slice(index + 1)];
		updateEventReminder(updatedReminders);
	};

	const onUpdateInviteesWithEployee = (employee: EMPLOYEE) => {
		setFilteredEmployees([]);
		setFilteredETeams([]);
		updateInvitees([
			...invitees,
			{
				single: {
					id: employee.id,
					job_title: employee.job_title,
					team: employee.team,
					profile: { first_name: employee.profile.first_name, last_name: employee.profile.last_name, id: employee.profile.id, email: employee.profile.email }
				}
			}
		]);
	};

	const onUpdateInviteesWithTeam = (team: Tables<'teams'>) => {
		setFilteredEmployees([]);
		setFilteredETeams([]);
		updateInvitees([
			...invitees,
			{
				team: {
					id: team.id,
					name: team.name,
					people:
						employeeList
							?.filter(employee => employee?.team == team.id)
							.map(employee => ({
								id: employee.id,
								job_title: employee.job_title,
								team: employee.team,
								profile: { first_name: employee.profile.first_name, last_name: employee.profile.last_name, id: employee.profile.id, email: employee.profile.email }
							})) || []
				}
			}
		]);
	};

	const onUpdateInviteesWithAll = () => {
		setFilteredEmployees([]);
		setFilteredETeams([]);
		updateInvitees([
			{
				all: employeeList?.map(employee => ({
					id: employee.id,
					job_title: employee.job_title,
					team: employee.team,
					profile: { first_name: employee.profile.first_name, last_name: employee.profile.last_name, id: employee.profile.id, email: employee.profile.email }
				}))
			}
		]);
	};

	return (
		<Form {...form}>
			<form className="space-y-8">
				{/* Event name */}
				<FormField
					control={form.control}
					name="summary"
					render={({ field }) => (
						<FormItem className="space-y-3">
							<FormLabel className="flex items-center gap-2">
								<LetterText size={14} /> Event title *
							</FormLabel>

							<div className="w-full gap-1">
								<FormControl>
									<Input readOnly={!allowEdit} aria-label="Title" className="" placeholder="Event title" {...field} />
								</FormControl>
								<FormMessage />
							</div>
						</FormItem>
					)}
				/>

				{/* Event description */}
				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem className="space-y-3">
							<FormLabel className="flex items-center gap-2">
								<Text size={14} /> Event description
							</FormLabel>

							<div className="w-full gap-1">
								<FormControl>
									<Textarea readOnly={!allowEdit} className="w-full" placeholder="Note, description or reason" {...field} />
								</FormControl>
								<FormMessage className="w-full" />
							</div>
						</FormItem>
					)}
				/>

				{!allowEdit && (
					<div className="space-y-6 border-y py-10">
						<div className="flex items-end gap-6">
							<div>
								<div className="mb-1 text-sm">{format(form.getValues().start.dateTime, 'PP')}</div>
								<div className="text-5xl font-bold">{format(form.getValues().start.dateTime, 'p')}</div>
							</div>

							<ArrowRight size={14} className="mb-4" />

							<div>
								{format(form.getValues().start.dateTime, 'PP') !== format(form.getValues().end.dateTime, 'PP') && <div className="mb-1 text-sm">{format(form.getValues().end.dateTime, 'PP')}</div>}
								<div className="text-4xl font-bold">{format(form.getValues().end.dateTime, 'p')}</div>
							</div>

							<div>
								<div className="text-xs text-support">Timezone</div>
								<div className="text-sm text-primary">{form.getValues().start.timeZone}</div>
							</div>
						</div>

						{form.getValues().recurrence && <div className="text-sm">{parseRecurrenceRule(form.getValues().recurrence as string)}</div>}
					</div>
				)}

				<div className="space-y-4">
					{/* Event datetime */}
					{allowEdit && (
						<div className="!mt-10 flex w-full items-center justify-between gap-3">
							<FormField
								control={form.control}
								name="start.dateTime"
								render={({ field }) => (
									<FormItem className="flex flex-row items-center gap-3 space-y-0">
										<div className="flex items-center justify-between gap-3">
											<div className="text-sm text-support">From</div>
											<FormControl>
												<DatePicker
													disabled={{ before: new Date() }}
													selected={field.value}
													onSetDate={date => {
														const time = getTime().split(':');
														date.setHours(Number(time[0]));
														date.setMinutes(Number(time[1]));
														field.onChange(date);
														form.setValue('end.dateTime', add(date, { hours: 1 }));
													}}>
													<Button disabled={!allowEdit} variant={'outline'} className="text-xs">
														{format(field.value, 'PP')}
													</Button>
												</DatePicker>
											</FormControl>

											<input
												readOnly={!allowEdit}
												className={cn(buttonVariants({ variant: 'outline' }), 'text-xs')}
												value={getTime(field.value as any)}
												onChange={event => {
													const time = event.target.value.split(':');
													const date = field.value;
													date.setHours(Number(time[0]));
													date.setMinutes(Number(time[1]));
													field.onChange(date);
													form.setValue('end.dateTime', add(date, { minutes: 30 }));
												}}
												type="time"
											/>
										</div>

										<FormMessage />
									</FormItem>
								)}
							/>

							<ArrowRight size={14} />

							<FormField
								control={form.control}
								name="end.dateTime"
								render={({ field }) => (
									<FormItem className="flex flex-row items-center gap-2.5">
										<FormControl>
											<div className="flex items-center justify-between gap-3">
												<div className="text-sm text-support">To</div>

												<DatePicker disabled={{ before: form.getValues('start.dateTime') || new Date() }} selected={field.value} onSetDate={date => field.onChange(date)}>
													<Button variant={'outline'} disabled={!allowEdit} className="text-xs">
														{format(field.value, 'PP')}
													</Button>
												</DatePicker>

												<input
													className={cn(buttonVariants({ variant: 'outline' }), 'text-xs')}
													value={getTime(field.value as any)}
													readOnly={!allowEdit}
													onChange={event => {
														const time = event.target.value.split(':');
														const startTime = getTime(form.getValues('start.dateTime') as any).split(':');

														const date = field.value;
														date.setHours(Number(time[0]));
														date.setMinutes(Number(time[1]));

														if (Number(time[0]) <= Number(startTime[0]) && Number(time[1]) <= Number(startTime[1])) {
															form.setValue('start.dateTime', date);
														}
														field.onChange(date);
													}}
													type="time"
												/>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					)}

					{allowEdit && (
						<div className="!mb-10 flex items-center gap-4">
							{/* timezone */}
							<FormField
								control={form.control}
								name="start.timeZone"
								render={({ field }) => (
									<FormItem className="flex w-full flex-col">
										<Popover open={isTimezoneOpen} onOpenChange={toggleTimezoneState}>
											<PopoverTrigger asChild>
												<FormControl className="w-full">
													<Button disabled={!allowEdit} variant="outline" role="combobox" className={cn('w-full justify-between rounded-lg disabled:opacity-90', !field.value && 'text-muted-foreground')}>
														{field.value ? timezones.find(timezone => timezone.identifier === field.value)?.identifier : 'Select timezone'}
														{allowEdit && <ChevronsUpDown size={12} className="opacity-50" />}
													</Button>
												</FormControl>
											</PopoverTrigger>

											<PopoverContent className="w-[450px] p-0" align="start">
												<Command>
													<CommandInput placeholder="Search time zones..." className="h-9" />

													<CommandList className="max-h-[280px] overflow-y-auto">
														<CommandEmpty>No time zone found.</CommandEmpty>

														<CommandGroup>
															{timezones.map(timezone => (
																<CommandItem
																	value={`${timezone.offset} ${timezone.identifier}`}
																	key={timezone.identifier}
																	onSelect={() => {
																		field.onChange(timezone.identifier);
																		form.setValue('end.timeZone', timezone.identifier);
																		toggleTimezoneState(!isTimezoneOpen);
																	}}
																	className="flex items-center gap-2">
																	<span>{timezone.offset}</span>
																	<span>•</span>
																	{timezone.name}
																	<span>•</span>
																	{timezone.identifier}
																	<Check size={12} className={cn('ml-auto', timezone.identifier === field.value ? 'opacity-100' : 'opacity-0')} />
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

							{/* recurrence */}
							<FormField
								control={form.control}
								name="recurrence"
								render={({ field }) => (
									<FormItem className="flex w-full flex-row items-center gap-2 space-y-0">
										<FormLabel className="sr-only">Frequency</FormLabel>

										<RecurrenceDialog disabled={!allowEdit} recurrenceString={field?.value!} onClose={field.onChange} />

										<FormMessage className="w-full" />
									</FormItem>
								)}
							/>
						</div>
					)}
				</div>

				{/* attendees */}
				<div className={cn('', (!teams || !employeeList) && '!mt-8')}>
					<Label htmlFor="invitees" className={cn(allowEdit && 'mt-4', 'mb-2 flex items-center gap-2 text-sm')}>
						<UsersRound size={12} /> Attendees
					</Label>

					<div>
						{allowEdit && (
							<Command className="h-fit rounded-lg border md:min-w-[450px]" shouldFilter={false}>
								<CommandInput
									placeholder="Type an employee or team name to sesrch"
									className="h-10"
									id="invitees"
									onValueChange={value => {
										if (invitees.find(invitee => invitee.all)) return;
										const employeeResult: any[] = searchPeople(employees as any, value, ['first_name', 'last_name'], true);
										const teamResult: any[] = searchTeams(teams, value, ['name']);
										if (employeeResult) setFilteredEmployees(employeeResult);
										if (teamResult) setFilteredETeams(teamResult);
									}}
								/>

								<CommandList>
									{!invitees[0]?.all && (
										<CommandItem className="flex gap-2" onSelect={onUpdateInviteesWithAll.bind(this)}>
											<span>All employees</span>
										</CommandItem>
									)}

									{!!filteredEmployees.length && (
										<CommandGroup noPadding heading="Employees">
											{filteredEmployees.map(employee => (
												<CommandItem key={employee.id + 'employee'} className="flex gap-2" onSelect={onUpdateInviteesWithEployee.bind(this, employee)}>
													<span>
														{employee.profile?.first_name} {employee.profile?.last_name}
													</span>
													•<span className="capitalize">{employee.job_title}</span>
												</CommandItem>
											))}
										</CommandGroup>
									)}

									<CommandSeparator />

									{!!filteredTeams.length && (
										<CommandGroup noPadding heading="Teams">
											{filteredTeams.map(team => (
												<CommandItem key={team.id + 'team'} className="flex gap-2" onSelect={onUpdateInviteesWithTeam.bind(this, team)}>
													{team.name}
												</CommandItem>
											))}
										</CommandGroup>
									)}
								</CommandList>
							</Command>
						)}

						<ul className={cn('!mb-8 mt-3 flex flex-wrap gap-2 empty:hidden')}>
							{invitees.map((invitee, index) => (
								<li className={cn('hov flex items-center gap-2 rounded-xl bg-accent pl-3 text-xs', !allowEdit && 'h-9 pr-3')} key={index + 'invitee'}>
									{invitee?.single && (
										<div className="flex items-center gap-2">
											<span>
												{(invitee.single.profile as any)?.first_name} {(invitee.single.profile as any)?.last_name}
											</span>
											<span>•</span>
											<span className="capitalize text-support">{invitee.single.job_title}</span>
										</div>
									)}

									{invitee?.team && (
										<div className="flex items-center gap-2">
											<span>{invitee.team.name}</span>
										</div>
									)}

									{invitee?.all && (
										<div className="">
											<span>All employees</span>
										</div>
									)}

									{allowEdit && (
										<Button
											variant={'ghost_destructive'}
											type="button"
											className="text-destructive"
											onClick={() => {
												invitees.splice(index, 1);
												updateInvitees([...invitees]);
											}}>
											<Trash2 size={12} />
										</Button>
									)}
								</li>
							))}
						</ul>
					</div>
				</div>

				{/* location */}
				<div className="!mt-8 space-y-3">
					<Label htmlFor="invitees" className="flex items-center gap-2">
						<MapPin size={12} /> Location
					</Label>

					<div className={cn('ml-3 w-full', allowEdit && 'ml-0')}>
						<Tabs defaultValue={locationType} onValueChange={setLocationType} className="flex w-full items-center gap-4">
							{allowEdit && (
								<TabsList className="grid h-9 w-fit min-w-36 grid-cols-2">
									<TabsTrigger value="virtual">Virtual</TabsTrigger>
									<TabsTrigger value="physical">Physical</TabsTrigger>
								</TabsList>
							)}

							<TabsContent value="virtual" className="mt-0 flex items-center gap-2">
								<Badge variant={'secondary'} className="h-9 gap-3 py-2">
									<div className="">
										<Image src={'/google-meet-logo.svg'} width={20} height={20} alt="google meet logo" />
									</div>
									Google Meet
								</Badge>

								{event?.meeting_link && (
									<Button variant={'secondary'} type="button" className="rounded-full" onClick={() => copy(event?.meeting_link!)}>
										<Copy size={12} />
									</Button>
								)}
							</TabsContent>

							<TabsContent value="physical" className={cn(allowEdit ? '-ml-4' : '-ml-7', 'mt-0 w-full')}>
								<FormField
									control={form.control}
									name="location"
									render={({ field }) => (
										<FormItem className="flex h-9 w-full items-center gap-2">
											<FormControl>
												<Input readOnly={!allowEdit} className="h-9 w-full" placeholder="Event location or link" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</TabsContent>
						</Tabs>
					</div>
				</div>

				{/* reminders */}
				{allowEdit && (
					<div className="!mt-8 space-y-3">
						<div className="mt-4 flex items-center gap-2 text-xs font-light text-label">
							<BellDot size={12} /> Event reminders
						</div>

						<div className={cn('ml-3 w-full space-y-4', allowEdit && 'ml-0')}>
							{eventReminders.map((reminder, index) => (
								<div className="flex gap-4" key={index}>
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<Input readOnly={!allowEdit} type="number" value={reminder.value} className="w-full" onChange={event => onUpdateAReminder({ index, value: event.target.value })} placeholder={`Number of ${reminder.period}`} />
											</TooltipTrigger>

											<TooltipContent>
												<p>
													Must be between 1 - {reminder.period == 'weeks' && '4 weeks'} {reminder.period == 'days' && '28 days'} {reminder.period == 'hours' && '672 hours'} {reminder.period == 'minutes' && '40,320 minutes'}
												</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>

									<Select disabled={!allowEdit} value={reminder.period} onValueChange={(period: period) => onUpdateAReminder({ index, period })}>
										<SelectTrigger className="w-full disabled:opacity-90">
											<SelectValue placeholder="Selected period" />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												<SelectItem value="minutes">Minutes</SelectItem>
												<SelectItem value="hours">Hours</SelectItem>
												<SelectItem value="days">Days</SelectItem>
												<SelectItem value="weeks">Weeks</SelectItem>
											</SelectGroup>
										</SelectContent>
									</Select>

									{allowEdit && (
										<Button variant={'ghost'} type="button" onClick={onRemoveReminder.bind(this, index)}>
											<X size={12} />
										</Button>
									)}
								</div>
							))}

							<Button className="w-full gap-3 border" type="button" variant={'secondary'} onClick={onAddReminder}>
								<Plus size={12} /> Add reminder
							</Button>
						</div>
					</div>
				)}

				{/* Form actions */}
				{allowEdit && (
					<div className="!mt-6 flex w-full justify-end space-x-4 text-right">
						{!!event && (
							<Button type="button" disabled={isDeleting} variant={'secondary_destructive'} onClick={onDeleteEvent} className="mr-auto">
								{isDeleting ? <LoadingSpinner className="text-destructive" /> : <Trash2 size={14} />}
							</Button>
						)}

						{!date && (
							<Button type="button" className={cn(!allowEdit && 'w-full')} variant={'outline'} onClick={() => onClose && onClose()}>
								Close
							</Button>
						)}

						<Button className="gap-3" disabled={isCreating} onClick={form.handleSubmit(onSubmit)} type="submit">
							{isCreating && <LoadingSpinner />}
							{event ? 'Update' : 'Create'} event
						</Button>
					</div>
				)}
			</form>
		</Form>
	);
};
