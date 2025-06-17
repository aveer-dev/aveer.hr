'use client';

import { cn } from '@/lib/utils';
import { EventDialog } from './event-dialog';
import { ReminderDialog } from './reminder-dialog';
import { LeaveReview } from '../leave/leave-review';
import { Tables } from '@/type/database.types';
import { ReactNode } from 'react';

interface EVENT_ITEM {
	type: 'leave' | 'reminder' | 'dob' | 'event';
	data: any;
	name: string;
}

interface eventItemProps {
	onClose?: (state: boolean) => void;
	employees?: Tables<'contracts'>[] | null;
	teams?: Tables<'teams'>[] | null;
	org?: string;
	calendar?: Tables<'calendars'> | null;
	event: EVENT_ITEM;
	className?: string;
	contract: number;
	children?: ReactNode;
}

export const CalendarEventItem = ({ event, className, org, calendar, onClose, employees, teams, contract, children }: eventItemProps) => {
	const _className = cn('flex w-full outline-none items-center gap-2 overflow-hidden rounded-lg p-1 text-left text-xs capitalize text-muted-foreground transition-all duration-500 hover:bg-accent', className);

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
				<button className={_className}>{children}</button>
			</EventDialog>
		);
	}

	if (event.type == 'reminder') {
		return (
			<ReminderDialog reminder={event.data} onClose={onClose} org={org!} contract={contract}>
				<button className={_className}>{children}</button>
			</ReminderDialog>
		);
	}

	return <button className={_className}>{children}</button>;
};
