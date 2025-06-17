import { cn } from '@/lib/utils';
import { Tables } from '@/type/database.types';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { isSameDay, isPast, format, isToday } from 'date-fns';
import { ChevronRight } from 'lucide-react';
import { HTMLAttributes, useState } from 'react';
import { CalendarDay, Modifiers } from 'react-day-picker';
import { ReminderForm } from './reminder-form';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '../ui/badge';
import { CalendarEventItem } from './calendar-event-item';
import { ContractWithProfile } from '@/dal';

interface EVENT_ITEM {
	type: 'leave' | 'reminder' | 'dob' | 'event';
	data: any;
	name: string;
}

interface CalendarDayItemProps {
	props: {
		day: CalendarDay;
		modifiers: Modifiers;
	} & HTMLAttributes<HTMLDivElement>;
	leaveDays: { date: Date; status: string; name: string; data: any }[];
	reminders: Tables<'reminders'>[];
	events: { date: Date; data: Tables<'calendar_events'> }[];
	teams?: Tables<'teams'>[] | null;
	employees?: ContractWithProfile[] | null;
	org: string;
	calendar: Tables<'calendars'> | null;
	contract: number;
	calendarType?: 'grid' | 'vertical';
}

export const CalendarDayItem = ({ calendarType, props, leaveDays, reminders, events, teams, employees, org, calendar, contract }: CalendarDayItemProps) => {
	const router = useRouter();
	const { day, modifiers, className, ...cellProps } = props;
	const dayLeaves = modifiers.leaveDay && !modifiers.weekend ? leaveDays.filter(leaveDay => isSameDay(leaveDay.date, day.date)) : [];
	const dayReminders = modifiers.reminder ? reminders.filter(reminder => isSameDay(reminder.datetime, day.date)) : [];
	const dayDobs = modifiers.dob ? employees?.filter(employee => employee.profile?.date_of_birth) : [];
	const cevents = modifiers.event ? events.filter(event => isSameDay(event.date, day.date)) : [];
	const [isAddOpen, toggleAdd] = useState(false);
	const [isViewAllOpen, setViewAllOpenState] = useState(false);

	const calendarEvents: EVENT_ITEM[] = [];
	if (modifiers.leaveDay && dayLeaves.length) dayLeaves.forEach(leaveDay => calendarEvents.push({ type: 'leave', data: leaveDay.data, name: leaveDay.name }));
	if (modifiers.reminder && dayReminders.length) dayReminders.forEach(reminder => calendarEvents.push({ type: 'reminder', data: reminder, name: reminder.title }));
	if (modifiers.dob && dayDobs?.length) dayDobs.forEach(dob => calendarEvents.push({ type: 'dob', data: dob, name: `${dob.profile?.first_name} ${dob.profile?.last_name}'s birthday` }));
	if (modifiers.event && cevents.length) cevents.forEach(event => calendarEvents.push({ type: 'event', data: event.data, name: event.data.summary }));

	return (
		<>
			<Popover open={isAddOpen} onOpenChange={toggleAdd}>
				<PopoverTrigger asChild>
					{calendarType == 'grid' ? (
						<td
							{...cellProps}
							onClick={event => event.preventDefault()}
							onDoubleClick={() => !isPast(day.date) && toggleAdd(!isAddOpen)}
							className={cn(
								className,
								'relative h-32 w-full min-w-9 overflow-y-hidden border-r p-1 text-center text-sm transition-colors duration-500 last-of-type:border-r-0 focus-within:relative focus-within:z-20 data-[state=open]:bg-muted [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md'
							)}>
							<Day calendar={calendar} calendarEvents={calendarEvents} props={props} teams={teams} employees={employees} isViewAllOpen={isViewAllOpen} org={org} setViewAllOpenState={setViewAllOpenState} contract={contract} />
						</td>
					) : (
						!modifiers.outside && (
							<div {...(cellProps as any)} id={isToday(day.date) ? 'today' : 'day-of-the-month'} onClick={event => event.preventDefault()} className={cn(className, calendarType == 'vertical' && 'py-1', 'block w-full')}>
								<Day calendar={calendar} calendarEvents={calendarEvents} props={props} teams={teams} employees={employees} isViewAllOpen={isViewAllOpen} org={org} setViewAllOpenState={setViewAllOpenState} calendarType={calendarType} contract={contract} />
							</div>
						)
					)}
				</PopoverTrigger>

				<PopoverContent onOpenAutoFocus={event => event.preventDefault()} className="max-w-80 space-y-4 overflow-y-auto" side="right">
					<ReminderForm
						org={org}
						contract={contract}
						onCreateReminder={() => {
							toggleAdd(false);
							router.refresh();
						}}
						date={day.date}
					/>
				</PopoverContent>
			</Popover>
		</>
	);
};

interface dayProps {
	calendarEvents: EVENT_ITEM[];
	props: {
		day: CalendarDay;
		modifiers: Modifiers;
	} & HTMLAttributes<HTMLDivElement>;
	teams?: Tables<'teams'>[] | null;
	employees?: Tables<'contracts'>[] | null;
	calendar: Tables<'calendars'> | null;
	org: string;
	isViewAllOpen: boolean;
	setViewAllOpenState: (state: boolean) => void;
	calendarType?: 'grid' | 'vertical';
	contract: number;
}

const Day = ({ calendarEvents, props, teams, employees, isViewAllOpen, calendar, org, setViewAllOpenState, calendarType, contract }: dayProps) => {
	const { day, modifiers, ...cellProps } = props;

	return (
		<>
			<div
				className={cn(
					modifiers.weekend && calendarType == 'grid' && 'opacity-10',
					modifiers.outside || calendarType == 'vertical' ? 'w-fit rounded-md p-2' : 'h-7 w-7 justify-center rounded-full p-1',
					calendarType !== 'vertical' && 'mb-2 ml-auto',
					modifiers.today && calendarType !== 'vertical' && 'bg-slate-800 text-white',
					'flex items-center gap-3 text-lg'
				)}>
				<div className="text-left">
					{calendarType == 'vertical' && <div className="text-xs">{format(day.date, 'EEE')}</div>}
					<div className="flex items-center gap-2">
						{(modifiers.outside || calendarType == 'vertical') && <div className="text-sm text-muted-foreground">{format(day.date, 'MMM')}</div>}
						<div className={cn(calendarType == 'vertical' && 'text-base')}>{cellProps.children}</div>
						{modifiers.today && calendarType == 'vertical' && <Badge>Today</Badge>}
					</div>
				</div>
			</div>

			<div className={cn(calendarType == 'vertical' && 'min-h-16 border-b py-3', 'w-full')}>
				{calendarEvents.slice(0, calendarEvents.length > 3 ? 2 : calendarEvents.length).map((event, index) => (
					<CalendarEventItem teams={teams} employees={employees} org={org} calendar={calendar} key={index + 'calendarEvents'} className={cn('align-middle')} event={event} contract={contract}>
						<Item event={event} />
					</CalendarEventItem>
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
								<CalendarEventItem teams={teams} employees={employees} org={org} calendar={calendar} key={index + 'pop-calendarEvents'} className={cn(modifiers.weekend && 'opacity-10')} event={event} onClose={setViewAllOpenState} contract={contract}>
									<Item event={event} />
								</CalendarEventItem>
							))}
						</PopoverContent>
					</Popover>
				)}
			</div>
		</>
	);
};

const Item = ({ event }: { event: EVENT_ITEM }) => {
	return (
		<>
			<div className={cn(event.type === 'dob' ? 'bg-blue-400' : event.type === 'event' ? 'bg-primary' : 'bg-orange-400', 'h-3 w-[2px] rounded-sm')}></div>
			<div className="w-10/12 truncate">
				{event.name} {event.type === 'dob' ? '🎉' : ''}
			</div>
		</>
	);
};
