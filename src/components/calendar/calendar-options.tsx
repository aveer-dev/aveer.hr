'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { BellPlus, CalendarRangeIcon, Plus } from 'lucide-react';
import { ReminderDialog } from './reminder-dialog';
import { useState } from 'react';
import { EventDialog } from './event-dialog';

export const CalendarOptions = ({ org, contract, profile, calendarId }: { calendarId: string; org: string; contract: number; profile: string }) => {
	const [isOptionOpen, toggleOptionState] = useState(false);

	return (
		<DropdownMenu open={isOptionOpen} onOpenChange={toggleOptionState}>
			<DropdownMenuTrigger className="[&[data-state=open]]:bg-accent" asChild>
				<Button variant="ghost">
					<Plus size={16} />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent className="w-28">
				<EventDialog org={org} onClose={toggleOptionState} calendarId={calendarId} profile={profile}>
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
