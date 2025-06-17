'use client';

import { FullCalendar } from '@/components/calendar/calendar';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tables } from '@/type/database.types';
import { LayoutList } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ContractWithRelations, LeaveWithRelations } from '@/dal';

interface reminder {
	contract: number;
	created_at: string;
	datetime: string;
	description: string | null;
	id: number;
	org: string;
	profile:
		| (string & {
				id: string;
				first_name: string;
				last_name: string;
		  })
		| null;
	title: string;
	type: string | null;
}

interface props {
	contractId: number;
	org: string;
	employeesData: ContractWithRelations[] | null;
	calendar: Tables<'calendars'> | null;
	calendarEvents: Tables<'calendar_events'>[] | null;
	reminders?: reminder[] | null;
	leaveDays: LeaveWithRelations[];
	teams: Tables<'teams'>[];
}

export const EmployeeCalendarComponent = ({ calendarEvents, reminders, employeesData, org, contractId, calendar, leaveDays, teams }: props) => {
	const searchParams = useSearchParams();
	const activeCalendarEventId = searchParams.get('calendar');
	const activeCalendarEvent = activeCalendarEventId ? calendarEvents?.find(event => Number(activeCalendarEventId) == event.id) : undefined;
	const [isOpen, toggleOpen] = useState(!!activeCalendarEvent);

	return (
		<Sheet
			open={isOpen}
			onOpenChange={state => {
				toggleOpen(state);
				if (state) {
					setTimeout(() => {
						document.querySelector('#today')?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
					}, 1000);
				}
			}}>
			<SheetTrigger asChild>
				<Button variant={'secondary'} size={'icon'} className="h-8 w-8">
					<LayoutList size={12} />
				</Button>
			</SheetTrigger>

			<SheetContent className="overflow-y-auto" id="calendar-sheet" hideClose>
				<SheetHeader>
					<SheetTitle className="sr-only">Calendar</SheetTitle>
					<SheetDescription className="sr-only">Organisation calendar of company wide events and meetings Make changes to your profile here. Click save when you&apos;re done.</SheetDescription>
				</SheetHeader>

				<section className="min-h-96 space-y-8 p-0.5">
					<FullCalendar
						calendar={calendar}
						contractId={contractId}
						employees={employeesData || []}
						calendarType="vertical"
						role="employee"
						org={org}
						timeOffs={leaveDays}
						reminders={reminders || []}
						enableClose={true}
						activeCalendarEvent={activeCalendarEvent}
						teams={teams}
						calendarEvents={calendarEvents || []}
					/>
				</section>
			</SheetContent>
		</Sheet>
	);
};
