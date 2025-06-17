'use client';

import React from 'react';
import { format } from 'date-fns';
import { parseISO, addDays, isToday } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { cn } from '@/lib/utils';
import { CalendarEventItem } from '@/components/calendar/calendar-event-item';
import { Tables } from '@/type/database.types';
import { EmployeeCalendarComponent } from '@/components/dashboard-calendar/calendar-component';
import { ContractWithProfileAndTeam, LeaveWithRelations } from '@/dal';
import { Plus } from 'lucide-react';

interface EventOnCalendar {
	id: number;
	title: string;
	start?: { dateTime: string; timeZone: string };
	end?: { dateTime: string; timeZone: string };
	date?: string;
	from?: string;
	to?: string;
	timeZone?: string;
	allDay?: boolean;
	location?: string;
	link?: string;
	description?: string;
	calendarName?: string;
	participants?: string[];
	summary?: string;
}

interface EventsListUIProps {
	loading?: boolean;
	onNewEvent?: () => void;
	contract: number;
	org: string;
	teams: Tables<'teams'>[] | null;
	employees: ContractWithProfileAndTeam[] | null;
	calendar: Tables<'calendars'> | null;
	calendarEvents: Tables<'calendar_events'>[];
	timeOffs: LeaveWithRelations[];
}

function getEventDate(event: EventOnCalendar): string {
	// Priority: start.dateTime > from > date
	if (event.start && event.start.dateTime) {
		if (event.start.timeZone) {
			return format(toZonedTime(event.start.dateTime, event.start.timeZone), 'yyyy-MM-dd');
		}
		return format(parseISO(event.start.dateTime), 'yyyy-MM-dd');
	}
	if (event.from) {
		if (event.timeZone) {
			return format(toZonedTime(event.from, event.timeZone), 'yyyy-MM-dd');
		}
		return format(parseISO(event.from), 'yyyy-MM-dd');
	}
	if (event.date) {
		return format(parseISO(event.date), 'yyyy-MM-dd');
	}
	return '';
}

const groupEventsByDate = (events: any[]): Record<string, any[]> => {
	return events.reduce(
		(acc, event) => {
			const date = (event?.dateTime || event?.start?.dateTime || event?.from).split('T')[0];
			if (!acc[date]) acc[date] = [];
			acc[date].push(event);
			return acc;
		},
		{} as Record<string, any[]>
	);
};

export const EventsList: React.FC<EventsListUIProps> = ({ loading, onNewEvent, contract, org, teams, employees, calendar, calendarEvents, timeOffs }) => {
	// Combine all events (calendarEvents, timeOffs, etc.) into a single array if needed
	const joinedEvents = [...(calendarEvents || []), ...(timeOffs || [])];

	// Group events by date
	const groupedEvents = groupEventsByDate(joinedEvents);

	// Get today's date in YYYY-MM-DD format
	const todayDate = parseISO(format(new Date(), 'yyyy-MM-dd'));

	const allDates: string[] = [];
	for (let i = 0; i < 14; i++) {
		allDates.push(format(addDays(todayDate, i), 'yyyy-MM-dd'));
	}

	// Re-group events using getEventDate to ensure correct date grouping
	const allEvents: EventOnCalendar[] = Object.values(groupedEvents).flat();
	const regrouped: { [date: string]: EventOnCalendar[] } = {};
	allEvents.forEach(event => {
		const date = getEventDate(event);
		if (!date) return;
		if (!regrouped[date]) regrouped[date] = [];
		regrouped[date].push(event);
	});

	// Only show events in the next two weeks
	const filteredGroupedEvents: { [date: string]: EventOnCalendar[] } = {};
	allDates.forEach(dateStr => {
		if (regrouped[dateStr]) {
			filteredGroupedEvents[dateStr] = regrouped[dateStr];
		}
	});

	if (loading) {
		return (
			<div className="flex h-full flex-col items-center justify-center text-gray-400">
				<span>Loading events...</span>
			</div>
		);
	}

	return (
		<div className="">
			<div className="mb-2 flex items-center justify-between">
				<h2 className="mb-2 text-xs text-muted-foreground">Upcoming events</h2>

				<EmployeeCalendarComponent employeesData={employees as any} calendarEvents={calendarEvents} org={org} calendar={calendar} contractId={contract} leaveDays={timeOffs || []} teams={teams || []} />
			</div>

			<div className="space-y-6 rounded-md bg-muted px-6 py-4">
				{allDates.map(date => {
					const events = filteredGroupedEvents[date] || [];
					if (events.length === 0) return null;
					return (
						<div key={date} className="flex flex-col items-start gap-4 md:flex-row">
							<div className={cn(`flex w-full max-w-36 flex-wrap items-center gap-1 pt-1 text-xs`, isToday(parseISO(date)) ? 'text-destructive' : 'text-muted-foreground')}>
								<div>{isToday(parseISO(date)) ? 'Today' : format(parseISO(date), 'EEEE')}</div>
								<div>{format(parseISO(date), 'MMMM d')}</div>
							</div>

							<div className="w-full space-y-1">
								{events.map(event => (
									<EventRow key={event.id} event={event} contract={contract} org={org} teams={teams} employees={employees as any} calendar={calendar} />
								))}
							</div>
						</div>
					);
				})}

				<div className="flex min-h-20 items-center justify-center">
					<p className="text-xs text-muted-foreground">No upcoming events in the next two weeks</p>
				</div>
			</div>
		</div>
	);
};

const EventRow: React.FC<{ event: EventOnCalendar; contract: number; org: string; teams: Tables<'teams'>[] | null; employees: ContractWithProfileAndTeam | null; calendar: Tables<'calendars'> | null }> = ({ event, contract, org, teams, employees, calendar }) => {
	// If event has a 'date' and no time component, treat as all-day
	const isAllDay = (!!event.date && !event.start?.dateTime && !event.from) || event.allDay === true;

	const start = event.start?.dateTime || event.from || event.date;
	const end = event.end?.dateTime || event.to || event.date;
	const timeZone = event.start?.timeZone || event.timeZone;

	return (
		<CalendarEventItem className="rounded-sm p-0 hover:bg-neutral-200" event={{ type: 'event', data: event, name: event.title }} contract={contract} org={org} teams={teams} employees={employees as any} calendar={calendar}>
			<div className="flex w-full justify-stretch gap-2 p-1 transition-all">
				<div className="min-w-1 rounded-full bg-blue-500"></div>

				<div className="flex w-full flex-col gap-0.5 py-1">
					<div className="flex items-center gap-2">
						<span className="text-sm font-semibold">{event?.title || event?.summary}</span>
					</div>
					<div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
						{isAllDay ? 'All day' : formatTimeRange(start, end, timeZone)}
						{event.location && ` · ${event.location}`}
						{event.link && `· ${event.link.replace(/^https?:\/\//, '').split('/')[0]}`}
					</div>
				</div>
			</div>
		</CalendarEventItem>
	);
};

function formatTimeRange(start?: string, end?: string, timeZone?: string) {
	if (!start || !end) return '';
	let startDate, endDate;
	try {
		if (timeZone) {
			startDate = toZonedTime(start, timeZone);
			endDate = toZonedTime(end, timeZone);
		} else {
			startDate = parseISO(start);
			endDate = parseISO(end);
		}
		const startTime = format(startDate, 'h:mm a');
		const endTime = format(endDate, 'h:mm a');
		return `${startTime}–${endTime}`;
	} catch {
		return '';
	}
}
