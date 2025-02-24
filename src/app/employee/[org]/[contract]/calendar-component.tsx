'use client';

import { FullCalendar } from '@/components/calendar/calendar';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tables } from '@/type/database.types';
import { CalendarRange } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

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

interface dobs {
	id: number;
	job_title: string;
	profile: {
		first_name: string;
		last_name: string;
		date_of_birth: string | null;
		id: string;
	} | null;
}

interface orgCalendarConfig {
	enable_thirdparty_calendar: boolean;
	calendar_employee_events: string[] | null;
}

interface props {
	contractId?: number;
	org: string;
	dobs: dobs[] | null;
	calendar: Tables<'calendars'> | null;
	calendarEvents: Tables<'calendar_events'>[] | null;
	reminders: reminder[] | null;
	events: { date: Date; data: Tables<'calendar_events'> }[];
	result: { date: Date; name: string; status: string; data: any }[];
	userId: string;
	orgCalendarConfig: orgCalendarConfig | null;
}

export const EmployeeCalendarComponent = ({ orgCalendarConfig, calendarEvents, reminders, dobs, org, contractId, calendar, result, events, userId }: props) => {
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
				<Button className="h-8 w-8 rounded-2xl border p-0" variant={'secondary'}>
					<CalendarRange size={12} />
				</Button>
			</SheetTrigger>

			<SheetContent className="overflow-y-auto" id="calendar-sheet" hideClose>
				<SheetHeader>
					<SheetTitle className="sr-only">Calendar</SheetTitle>
					<SheetDescription className="sr-only">Organisation calendar of company wide events and meetings Make changes to your profile here. Click save when you&apos;re done.</SheetDescription>
				</SheetHeader>

				<section className="min-h-96 space-y-8 p-0.5">
					<FullCalendar
						orgCalendarConfig={orgCalendarConfig}
						calendar={calendar}
						contractId={contractId}
						calendarType="vertical"
						role="employee"
						org={org}
						profile={userId}
						contract={dobs?.find(contract => contract.profile?.id == userId)?.id as number}
						leaveDays={result}
						reminders={reminders || []}
						dobs={dobs!.filter(contract => contract.profile?.date_of_birth) as any}
						enableClose={true}
						activeCalendarEvent={activeCalendarEvent}
						events={events}
					/>
				</section>
			</SheetContent>
		</Sheet>
	);
};
