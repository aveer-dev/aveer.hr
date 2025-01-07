'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { addMonths, format, isPast, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { DayOfWeek, DayPicker } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState } from 'react';
import { LeaveReview } from '@/components/leave/leave-review';
import { Tables } from '@/type/database.types';
import { ReminderForm } from './reminder-form';
import { Separator } from '@/components/ui/separator';
import { ReminderDialog } from './reminder-dialog';
import { useRouter } from 'next/navigation';
import { CalendarConfigDialog } from './config-dialog';
import { ROLE } from '@/type/contract.types';
import { AlertDialogCancel } from '../ui/alert-dialog';

interface props {
	leaveDays: { date: Date; status: string; name: string; data: any }[];
	reminders: Tables<'reminders'>[];
	dobs: Tables<'contracts'>[];
	org: string;
	profile: string;
	contract: number;
	orgCalendarConfig: { enable_calendar: boolean; calendar_employee_events: string[] | null } | null;
	calendarConfig?: Tables<'contract_calendar_config'>[] | null;
	role?: ROLE;
	contractId?: number;
	calendarId?: string;
	enableClose?: boolean;
}

export const FullCalendar = ({ leaveDays, reminders, dobs, org, profile, contract, orgCalendarConfig, calendarConfig, role = 'admin', contractId, calendarId, enableClose }: props) => {
	const router = useRouter();
	const dayOfWeekMatcher: DayOfWeek = {
		dayOfWeek: [0, 6]
	};

	return (
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
				dob: dobs.map(dob => new Date((dob.profile as unknown as Tables<'profiles'>).date_of_birth as string))
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
								<ReminderDialog org={org} contract={contract} profile={profile} />

								{((calendarId && orgCalendarConfig?.enable_calendar) || role == 'admin') && (
									<>
										<Separator orientation="vertical" className="h-3" />

										<CalendarConfigDialog calendarId={calendarId} contractId={contractId} calendarConfig={calendarConfig} orgCalendarConfig={orgCalendarConfig} org={org} role={role} />
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
					const [isAddOpen, toggleAdd] = useState(false);
					const [isReminderOpen, setReminderOpenState] = useState(false);
					const [activeReminder, setActiveReminder] = useState<Tables<'reminders'> | null>();

					const events: { type: 'leave' | 'reminder' | 'dob'; data: any; name: string }[] = [];
					if (modifiers.leaveDay && dayLeaves.length) dayLeaves.forEach(leaveDay => events.push({ type: 'leave', data: leaveDay.data, name: leaveDay.name }));
					if (modifiers.reminder && dayReminders.length) dayReminders.forEach(reminder => events.push({ type: 'reminder', data: reminder, name: reminder.title }));
					if (modifiers.dob && dayDobs.length) dayDobs.forEach(dob => events.push({ type: 'dob', data: dob, name: `${(dob.profile as any).first_name}'s birthday` }));

					return (
						<>
							<Popover open={isAddOpen} onOpenChange={toggleAdd}>
								<PopoverTrigger asChild>
									<td
										{...cellProps}
										onClick={event => event.preventDefault()}
										onDoubleClick={() => !isPast(day.date) && toggleAdd(!isAddOpen)}
										className="relative h-28 w-full min-w-9 overflow-y-hidden border-r p-1 text-center text-sm transition-colors duration-500 last-of-type:border-r-0 focus-within:relative focus-within:z-20 data-[state=open]:bg-muted [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md">
										<div className={cn((modifiers.outside || modifiers.weekend) && 'opacity-10', modifiers.today && 'bg-slate-800 text-white', 'mb-2 ml-auto flex h-6 w-6 items-center justify-center rounded-full p-1 text-right text-lg')}>
											{cellProps.children}
										</div>
										{events.slice(0, events.length > 3 ? 2 : events.length).map((event, index) => {
											if (event.type === 'leave') {
												return (
													<LeaveReview reviewType="admin" data={event.data} key={index + 'leave'} className={cn(modifiers.outside && 'opacity-10')}>
														{event?.name}
													</LeaveReview>
												);
											}

											return (
												<button
													key={index}
													onClick={() => {
														setActiveReminder(event.data);
														setReminderOpenState(true);
													}}
													className={cn(
														'flex w-full items-center gap-2 overflow-hidden rounded-lg p-1 text-left text-xs capitalize text-muted-foreground transition-all duration-500 hover:bg-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1'
													)}>
													<div className={cn(event.type === 'dob' ? 'bg-blue-400' : 'bg-orange-400', 'h-3 w-[2px] rounded-sm')}></div>
													<div className="w-10/12 truncate">
														{event.name} {event.type === 'dob' ? '🎉' : ''}
													</div>
												</button>
											);
										})}

										{events.length > 3 && (
											<Popover>
												<PopoverTrigger asChild>
													<Button type="button" className="mt-1 flex h-fit w-full items-center justify-between px-2 py-px text-xs" variant={'secondary'}>
														View all
														<ChevronRight size={12} />
													</Button>
												</PopoverTrigger>
												<PopoverContent onOpenAutoFocus={event => event.preventDefault()} className="max-h-52 max-w-64 space-y-4 overflow-y-auto" side="right">
													<h3 className="text-sm font-medium">{format(day.date, 'PP')}</h3>

													{events.map((event, index) => {
														if (event.type === 'leave') {
															return (
																<LeaveReview hideTooltip reviewType="admin" data={event.data} key={index + 'leave'} className={cn(modifiers.outside && 'opacity-10')}>
																	{event?.name}
																</LeaveReview>
															);
														}

														return (
															<button
																onClick={() => {
																	setActiveReminder(event.data);
																	setReminderOpenState(true);
																}}
																key={`pop-${index}`}
																className={cn('flex w-full items-center gap-2 overflow-hidden rounded-lg p-1 text-left text-xs capitalize text-muted-foreground transition-all duration-500 hover:bg-accent', props.className)}>
																<div className={cn(event.type === 'dob' ? 'bg-blue-400' : 'bg-orange-400', 'h-3 w-[2px] rounded-sm')}></div>
																<div className="w-10/12 truncate">
																	{event.name} {event.type === 'dob' ? '🎉' : ''}
																</div>
															</button>
														);
													})}
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
	);
};
