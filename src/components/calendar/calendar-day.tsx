import { cn } from '@/lib/utils';
import { Tables } from '@/type/database.types';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { isSameDay, isPast, format, isToday } from 'date-fns';
import { ChevronRight } from 'lucide-react';
import { HTMLAttributes, useState } from 'react';
import { CalendarDay, Modifiers } from 'react-day-picker';
import { ReminderDialog } from './reminder-dialog';
import { ReminderForm } from './reminder-form';
import { LeaveReview } from '../leave/leave-review';
import { EventDialog } from './event-dialog';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '../ui/badge';

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
	dobs: Tables<'contracts'>[];
	events: { date: Date; data: Tables<'calendar_events'> }[];
	teams?: Tables<'teams'>[] | null;
	employees?: Tables<'contracts'>[] | null;
	org: string;
	calendar: Tables<'calendars'> | null;
	contract: number;
	profile: string;
	calendarType?: 'grid' | 'vertical';
}

export const CalendarDayItem = ({ calendarType, props, leaveDays, reminders, dobs, events, teams, employees, org, calendar, contract, profile }: CalendarDayItemProps) => {
	const router = useRouter();
	const { day, modifiers, className, ...cellProps } = props;
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
					{calendarType == 'grid' ? (
						<td
							{...cellProps}
							onClick={event => event.preventDefault()}
							onDoubleClick={() => !isPast(day.date) && toggleAdd(!isAddOpen)}
							className={cn(
								className,
								'relative h-32 w-full min-w-9 overflow-y-hidden border-r p-1 text-center text-sm transition-colors duration-500 last-of-type:border-r-0 focus-within:relative focus-within:z-20 data-[state=open]:bg-muted [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md'
							)}>
							<Day
								calendar={calendar}
								calendarEvents={calendarEvents}
								props={props}
								teams={teams}
								employees={employees}
								isViewAllOpen={isViewAllOpen}
								org={org}
								setActiveReminder={setActiveReminder}
								setReminderOpenState={setReminderOpenState}
								setViewAllOpenState={setViewAllOpenState}
							/>
						</td>
					) : (
						!modifiers.outside && (
							<div {...(cellProps as any)} id={isToday(day.date) ? 'today' : 'day-of-the-month'} onClick={event => event.preventDefault()} className={cn(className, calendarType == 'vertical' && 'py-1', 'block w-full')}>
								<Day
									calendar={calendar}
									calendarEvents={calendarEvents}
									props={props}
									teams={teams}
									employees={employees}
									isViewAllOpen={isViewAllOpen}
									org={org}
									setActiveReminder={setActiveReminder}
									setReminderOpenState={setReminderOpenState}
									setViewAllOpenState={setViewAllOpenState}
									calendarType={calendarType}
								/>
							</div>
						)
					)}
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
	setActiveReminder: (data: Tables<'reminders'> | null) => void;
	setReminderOpenState: (state: boolean) => void;
	isViewAllOpen: boolean;
	setViewAllOpenState: (state: boolean) => void;
	calendarType?: 'grid' | 'vertical';
}

const Day = ({ calendarEvents, props, teams, employees, isViewAllOpen, calendar, org, setActiveReminder, setReminderOpenState, setViewAllOpenState, calendarType }: dayProps) => {
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
					<EventItem
						teams={teams}
						employees={employees}
						org={org}
						calendar={calendar}
						key={index + 'calendarEvents'}
						className={cn(modifiers.weekend && 'opacity-10', 'align-middle')}
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
			</div>
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
