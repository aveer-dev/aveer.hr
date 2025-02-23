'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { addMonths, format, isPast, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { DayOfWeek, DayPicker } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useEffect, useState } from 'react';
import { LeaveReview } from '@/components/leave/leave-review';
import { Tables } from '@/type/database.types';
import { ReminderForm } from './reminder-form';
import { Separator } from '@/components/ui/separator';
import { ReminderDialog } from './reminder-dialog';
import { useRouter } from 'next/navigation';
import { CalendarConfigDialog } from './config-dialog';
import { ROLE } from '@/type/contract.types';
import { AlertDialogCancel } from '../ui/alert-dialog';
import { CalendarOptions } from './calendar-options';
import { EventDialog } from './event-dialog';
import { getAuthLink } from './calendar-actions';
import { toast } from 'sonner';

interface EVENT_ITEM {
	type: 'leave' | 'reminder' | 'dob' | 'event';
	data: any;
	name: string;
}

interface props {
	leaveDays: { date: Date; status: string; name: string; data: any }[];
	events: { date: Date; data: Tables<'calendar_events'> }[];
	reminders: Tables<'reminders'>[];
	dobs: Tables<'contracts'>[];
	org: string;
	profile: string;
	contract: number;
	orgCalendarConfig: { enable_thirdparty_calendar: boolean; calendar_employee_events: string[] | null } | null;
	employeeCalendarConfig?: Tables<'contract_calendar_config'>[] | null;
	role?: ROLE;
	contractId?: number;
	calendar: Tables<'calendars'> | null;
	enableClose?: boolean;
	employees?: Tables<'contracts'>[] | null;
	teams?: Tables<'teams'>[] | null;
	activeCalendarEvent?: Tables<'calendar_events'>;
	showCalendarConfigError?: boolean;
}

export const FullCalendar = ({ showCalendarConfigError, events, teams, employees, leaveDays, activeCalendarEvent, calendar, reminders, dobs, org, profile, contract, orgCalendarConfig, employeeCalendarConfig, role = 'admin', contractId, enableClose }: props) => {
	const router = useRouter();
	const dayOfWeekMatcher: DayOfWeek = {
		dayOfWeek: [0, 6]
	};

	useEffect(() => {
		if (showCalendarConfigError) toast.error('Error connecting Google calendar');
	}, [showCalendarConfigError]);

	return (
		<>
			<DayPicker
				showOutsideDays
				classNames={{
					months: 'flex flex-col sm:flex-col space-y-4 sm:space-y-0',
					month: 'space-y-4 w-full',
					month_caption: 'flex pt-1 relative items-center border-b mb-12 pb-3',
					month_grid: 'w-full border-collapse space-y-1',
					weekdays: 'flex',
					weekday: 'text-muted-foreground p-1 w-full min-w-9 font-normal text-[0.8rem] h-16 border-r font-bold last-of-type:border-r-0',
					week: 'flex w-full last-of-type:border-b-0 border-b',
					range_end: 'day-range-end',
					selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
					outside: 'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
					disabled: 'text-muted-foreground opacity-50',
					range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
					hidden: 'invisible'
				}}
				modifiers={{
					leaveDay: leaveDays.map(day => day.date),
					weekend: dayOfWeekMatcher,
					reminder: reminders.map(reminder => new Date(reminder.datetime)),
					dob: dobs.map(dob => new Date((dob.profile as unknown as Tables<'profiles'>).date_of_birth as string)),
					event: events.map(day => day.date)
				}}
				autoFocus
				components={{
					CaptionLabel: () => {
						return <span></span>;
					},
					Nav: ({ onNextClick, onPreviousClick, previousMonth }) => {
						return (
							<nav className={cn('relative flex items-center justify-between space-x-1 bg-transparent p-0')}>
								<div className="flex items-center gap-3">
									<div className="mr-2 text-2xl font-bold">{format(addMonths(previousMonth as Date, 1), 'MMMM yyyy')}</div>

									<Separator orientation="vertical" className="h-3" />

									<div className="flex items-center">
										<Button variant={'ghost'} onClick={onPreviousClick}>
											<ChevronLeft size={16} />
										</Button>

										<Button variant={'ghost'} onClick={onNextClick}>
											<ChevronRight size={16} />
										</Button>
									</div>
								</div>

								<div className="flex items-center space-x-1">
									<CalendarOptions employees={employees} teams={teams} calendar={calendar} org={org} contract={contract} profile={profile} />

									{((calendar?.calendar_id && orgCalendarConfig?.enable_thirdparty_calendar) || role == 'admin') && (
										<>
											<Separator orientation="vertical" className="h-3" />

											<CalendarConfigDialog calendar={calendar} contractId={contractId} employeeCalendarConfig={employeeCalendarConfig} orgCalendarConfig={orgCalendarConfig} org={org} role={role} />
										</>
									)}

									{enableClose && (
										<>
											<Separator orientation="vertical" className="h-3" />
											<AlertDialogCancel asChild>
												<Button variant={'ghost'} className="border-0">
													<X size={16} />
												</Button>
											</AlertDialogCancel>
										</>
									)}
								</div>
							</nav>
						);
					},
					Day: props => {
						const { day, modifiers, ...cellProps } = props;
						const dayLeaves = modifiers.leaveDay && !modifiers.weekend ? leaveDays.filter(leaveDay => isSameDay(leaveDay.date, day.date)) : [];
						const dayReminders = modifiers.reminder ? reminders.filter(reminder => isSameDay(reminder.datetime, day.date)) : [];
						const dayDobs = modifiers.dob ? dobs.filter(dob => isSameDay((dob.profile as any).date_of_birth, day.date)) : [];
						const cevents = modifiers.event ? events.filter(event => isSameDay(event.date, day.date)) : [];
						const [isAddOpen, toggleAdd] = useState(false);
						const [isReminderOpen, setReminderOpenState] = useState(false);
						const [isViewAllOpen, setViewAllOpenState] = useState(false);
						const [activeReminder, setActiveReminder] = useState<Tables<'reminders'> | null>();

						const calendarEvents: EVENT_ITEM[] = [];
						if (modifiers.leaveDay && dayLeaves.length) dayLeaves.forEach(leaveDay => calendarEvents.push({ type: 'leave', data: leaveDay.data, name: leaveDay.name }));
						if (modifiers.reminder && dayReminders.length) dayReminders.forEach(reminder => calendarEvents.push({ type: 'reminder', data: reminder, name: reminder.title }));
						if (modifiers.dob && dayDobs.length) dayDobs.forEach(dob => calendarEvents.push({ type: 'dob', data: dob, name: `${(dob.profile as any).first_name}'s birthday` }));
						if (modifiers.event && cevents.length) cevents.forEach(event => calendarEvents.push({ type: 'event', data: event.data, name: event.data.summary }));

						return (
							<>
								<Popover open={isAddOpen} onOpenChange={toggleAdd}>
									<PopoverTrigger asChild>
										<td
											{...cellProps}
											onClick={event => event.preventDefault()}
											onDoubleClick={() => !isPast(day.date) && toggleAdd(!isAddOpen)}
											className="relative h-28 w-full min-w-9 overflow-y-hidden border-r p-1 text-center text-sm transition-colors duration-500 last-of-type:border-r-0 focus-within:relative focus-within:z-20 data-[state=open]:bg-muted [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md">
											<div className={cn(modifiers.weekend && 'opacity-10', modifiers.today && 'bg-slate-800 text-white', 'mb-2 ml-auto flex h-6 w-20 items-center justify-end gap-3 rounded-full p-1 text-right text-lg')}>
												<span className="text-sm text-muted-foreground">{modifiers.outside && format(props.day.date, 'MMM')}</span>
												{cellProps.children}
											</div>

											{calendarEvents.slice(0, calendarEvents.length > 3 ? 2 : calendarEvents.length).map((event, index) => (
												<EventItem
													teams={teams}
													employees={employees}
													org={org}
													calendar={calendar}
													key={index + 'calendarEvents'}
													className={cn(modifiers.weekend && 'opacity-10')}
													event={event}
													onClick={() => {
														if (event.type == 'reminder') {
															setActiveReminder(event.data);
															setReminderOpenState(true);
														}
													}}
												/>
											))}

											{calendarEvents.length > 3 && (
												<Popover open={isViewAllOpen} onOpenChange={setViewAllOpenState}>
													<PopoverTrigger asChild>
														<Button type="button" className="mt-1 flex h-fit w-full items-center justify-between px-2 py-px text-xs" variant={'secondary'}>
															View all
															<ChevronRight size={12} />
														</Button>
													</PopoverTrigger>
													<PopoverContent onOpenAutoFocus={event => event.preventDefault()} className="max-h-52 max-w-64 space-y-3 overflow-y-auto" side="right">
														<h3 className="text-sm font-medium">{format(day.date, 'PP')}</h3>

														{calendarEvents.map((event, index) => (
															<EventItem
																teams={teams}
																employees={employees}
																org={org}
																calendar={calendar}
																key={index + 'pop-calendarEvents'}
																className={cn(modifiers.weekend && 'opacity-10')}
																event={event}
																onClick={() => {
																	if (event.type == 'reminder') {
																		setActiveReminder(event.data);
																		setReminderOpenState(true);
																	}
																}}
																onClose={setViewAllOpenState}
															/>
														))}
													</PopoverContent>
												</Popover>
											)}
										</td>
									</PopoverTrigger>

									<PopoverContent onOpenAutoFocus={event => event.preventDefault()} className="max-w-80 space-y-4 overflow-y-auto" side="right">
										<ReminderForm
											org={org}
											contract={contract}
											profile={profile}
											onCreateReminder={() => {
												toggleAdd(false);
												router.refresh();
											}}
											date={day.date}
										/>
									</PopoverContent>
								</Popover>

								{!!activeReminder && (
									<ReminderDialog
										reminder={activeReminder}
										onClose={() => {
											setReminderOpenState(false);
											setActiveReminder(null);
										}}
										isOpen={isReminderOpen}
										org={org}
										contract={contract}
										profile={profile}
									/>
								)}
							</>
						);
					}
				}}
			/>

			{activeCalendarEvent && <EventDialog noTrigger teams={teams} employees={employees} isOpen={!!activeCalendarEvent} org={org!} calendar={calendar!} event={activeCalendarEvent} />}
		</>
	);
};

interface eventItemProps {
	onClose?: (state: boolean) => void;
	employees?: Tables<'contracts'>[] | null;
	teams?: Tables<'teams'>[] | null;
	org?: string;
	calendar?: Tables<'calendars'> | null;
	event: EVENT_ITEM;
	onClick?: () => void;
	className?: string;
}

const EventItem = ({ event, onClick, className, org, calendar, onClose, employees, teams }: eventItemProps) => {
	if (event.type == 'leave') {
		return (
			<LeaveReview hideTooltip reviewType="admin" data={event.data} className={cn(className)}>
				{event?.name}
			</LeaveReview>
		);
	}

	if (event.type == 'event') {
		return (
			<EventDialog teams={teams} employees={employees} org={org!} calendar={calendar!} onClose={onClose} event={event.data}>
				<Item event={event} onClick={onClick} />
			</EventDialog>
		);
	}

	return <Item event={event} onClick={onClick} />;
};

const Item = ({ event, onClick }: { event: EVENT_ITEM; onClick?: () => void; className?: string }) => {
	return (
		<button onClick={onClick} className={cn('flex w-full items-center gap-2 overflow-hidden rounded-lg p-1 text-left text-xs capitalize text-muted-foreground transition-all duration-500 hover:bg-accent')}>
			<div className={cn(event.type === 'dob' ? 'bg-blue-400' : event.type === 'event' ? 'bg-primary' : 'bg-orange-400', 'h-3 w-[2px] rounded-sm')}></div>
			<div className="w-10/12 truncate">
				{event.name} {event.type === 'dob' ? '🎉' : ''}
			</div>
		</button>
	);
};
