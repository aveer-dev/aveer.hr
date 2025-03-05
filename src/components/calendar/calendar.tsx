'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { addMonths, format } from 'date-fns';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { DayOfWeek, DayPicker } from 'react-day-picker';
import { useEffect } from 'react';
import { Tables } from '@/type/database.types';
import { Separator } from '@/components/ui/separator';
import { CalendarConfigDialog } from './config-dialog';
import { ROLE } from '@/type/contract.types';
import { CalendarOptions } from './calendar-options';
import { EventDialog } from './event-dialog';
import { toast } from 'sonner';
import { CalendarDayItem } from './calendar-day';
import { SheetClose } from '../ui/sheet';

interface props {
	leaveDays: { date: Date; status: string; name: string; data: any }[];
	events: { date: Date; data: Tables<'calendar_events'> }[];
	reminders: Tables<'reminders'>[];
	dobs: Tables<'contracts'>[];
	org: string;
	profile: string;
	contract: number;
	role?: ROLE;
	contractId?: number;
	calendar: Tables<'calendars'> | null;
	enableClose?: boolean;
	employees?: Tables<'contracts'>[] | null;
	teams?: Tables<'teams'>[] | null;
	activeCalendarEvent?: Tables<'calendar_events'>;
	showCalendarConfigError?: boolean;
	calendarType?: 'grid' | 'vertical';
}

export const FullCalendar = ({ showCalendarConfigError, calendarType = 'grid', events, teams, employees, leaveDays, activeCalendarEvent, calendar, reminders, dobs, org, profile, contract, role = 'admin', contractId, enableClose }: props) => {
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
									<div className="mr-2 text-2xl font-bold">{format(addMonths(previousMonth as Date, 1), calendarType == 'grid' ? 'MMMM yyyy' : 'MMM')}</div>

									<Separator orientation="vertical" className="h-3" />

									<div className="flex items-center gap-0.5">
										<Button variant={'ghost'} onClick={onPreviousClick}>
											<ChevronLeft size={16} />
										</Button>

										<Button variant={'ghost'} onClick={onNextClick}>
											<ChevronRight size={16} />
										</Button>
									</div>
								</div>

								<div className="flex items-center space-x-1">
									{role == 'admin' && <CalendarOptions role={role} employees={employees} teams={teams} calendar={calendar} org={org} contract={contract} profile={profile} />}

									{role == 'admin' && (
										<>
											<Separator orientation="vertical" className="h-3" />

											<CalendarConfigDialog calendar={calendar} contractId={contractId} org={org} />
										</>
									)}

									{enableClose && (
										<>
											<Separator orientation="vertical" className="h-3" />
											<SheetClose asChild>
												<Button variant={'ghost'} className="border-0">
													<X size={16} />
												</Button>
											</SheetClose>
										</>
									)}
								</div>
							</nav>
						);
					},
					Day: props => <CalendarDayItem calendarType={calendarType} calendar={calendar} props={props} teams={teams} employees={employees} org={org} leaveDays={leaveDays} dobs={dobs} reminders={reminders} events={events} profile={profile} contract={contract} />,
					MonthGrid: ({ children, className, ...props }) => {
						return calendarType == 'grid' ? (
							<table {...props} className={cn('w-full border-collapse space-y-1', className)}>
								{children}
							</table>
						) : (
							<div className={cn(className)} {...props}>
								{children}
							</div>
						);
					},
					Weeks: ({ children, ...props }) => {
						return calendarType == 'grid' ? <tbody {...props}>{children}</tbody> : <div {...props}>{children}</div>;
					},
					Week: ({ children, className, ...props }) => {
						return calendarType == 'grid' ? (
							<tr {...props} className={cn('flex w-full border-b last-of-type:border-b-0', className)}>
								{children}
							</tr>
						) : (
							<>{children}</>
						);
					},
					Weekdays: ({ children, className, ...props }) => {
						return calendarType == 'grid' ? (
							<thead>
								<tr className={cn(className, 'flex')} {...props}>
									{children}
								</tr>
							</thead>
						) : (
							<></>
						);
					},
					Weekday: ({ children, className, ...props }) => {
						return calendarType == 'grid' ? (
							<th className={cn(className, 'h-16 w-full min-w-9 border-r p-1 text-[0.8rem] font-bold text-muted-foreground last-of-type:border-r-0')} {...props}>
								{children}
							</th>
						) : (
							<></>
						);
					}
				}}
			/>

			{activeCalendarEvent && <EventDialog noTrigger teams={teams} employees={employees} isOpen={!!activeCalendarEvent} org={org!} calendar={calendar!} event={activeCalendarEvent} />}
		</>
	);
};
