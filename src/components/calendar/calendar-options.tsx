'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { BellPlus, CalendarRangeIcon, Plus } from 'lucide-react';
import { ReminderDialog } from './reminder-dialog';
import { useState } from 'react';
import { EventDialog } from './event-dialog';
import { Tables } from '@/type/database.types';
import { ROLE } from '@/type/contract.types';

interface props {
	employees?: Tables<'contracts'>[] | null;
	teams?: Tables<'teams'>[] | null;
	calendar?: Tables<'calendars'> | null;
	org: string;
	contract: number;
	profile: string;
	role?: ROLE;
}

export const CalendarOptions = ({ org, role = 'admin', contract, profile, calendar, teams, employees }: props) => {
	const [isOptionOpen, toggleOptionState] = useState(false);

	return (
		<DropdownMenu open={isOptionOpen} onOpenChange={toggleOptionState}>
			<DropdownMenuTrigger className="[&[data-state=open]]:bg-accent" asChild>
				<Button variant="ghost">
					<Plus size={16} />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent className="w-28">
				<EventDialog role={role} teams={teams} employees={employees} org={org} onClose={toggleOptionState} calendar={calendar}>
					<DropdownMenuItem onSelect={event => event.preventDefault()} className="gap-3">
						<CalendarRangeIcon size={12} /> Event
					</DropdownMenuItem>
				</EventDialog>

				<ReminderDialog org={org} onClose={toggleOptionState} contract={contract} profile={profile}>
					<DropdownMenuItem onSelect={event => event.preventDefault()} className="gap-3">
						<BellPlus size={12} />
						Reminder
					</DropdownMenuItem>
				</ReminderDialog>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
