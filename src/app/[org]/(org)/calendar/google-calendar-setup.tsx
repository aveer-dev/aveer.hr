'use client';

import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CalendarRange, Check, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loader';

import { ROLE } from '@/type/contract.types';
import { Tables } from '@/type/database.types';
import { useRouter } from 'next/navigation';
import { calendar_v3 } from '@googleapis/calendar';
import { cn } from '@/lib/utils';
import { createOrgCalendar, uploadGEventsToDB } from '@/components/calendar/calendar-actions';
import { Badge } from '@/components/ui/badge';

interface props {
	org: string;
	employeeCalendarConfig?: Tables<'contract_calendar_config'>[] | null;
	role?: ROLE;
	contractId?: number;
	calendarId?: string;
	calendars: calendar_v3.Schema$CalendarList;
}

export const GCalendarSetupDialog = ({ org, calendars }: props) => {
	const [isAddOpen, toggleAdd] = useState(true);
	const [isFetchingEvents, setFetchingEventsState] = useState(false);
	const [isCreatingCalendar, setCreatingCalendarState] = useState(false);
	const router = useRouter();
	const [selectedCalendar, setSelectedCalendar] = useState('');

	const handleCreateNewCalendarClick = async () => {
		try {
			setCreatingCalendarState(true);
			await createOrgCalendar(org);
			toast.success('Google calendar created and connected to aveer.');
			setCreatingCalendarState(false);
			toggleAdd(false);
			router.refresh();
		} catch (error: any) {
			setCreatingCalendarState(false);
			toast.error(error?.message || error || 'Error creating Google calendar');
		}
	};

	const onSelectCalendar = async (calendar: calendar_v3.Schema$CalendarListEntry) => {
		setSelectedCalendar(calendar.id as string);
		setFetchingEventsState(true);

		try {
			await uploadGEventsToDB({ org, calendar });
			toast.success('Google calendar events are now on aveer');
			setFetchingEventsState(false);
			toggleAdd(false);
			router.refresh();
		} catch (error: any) {
			setFetchingEventsState(false);
			toast.error(error?.message || error);
		}
	};

	return (
		<AlertDialog open={isAddOpen} onOpenChange={state => toggleAdd(state)}>
			<AlertDialogContent className="pt-0">
				<CalendarRange size={24} />
				<div>
					<AlertDialogTitle>Select calendar</AlertDialogTitle>
					<AlertDialogDescription className="mt-3 text-sm leading-6">We found these calendars on your Google calendar account, will you like to continue with an existing calendar or create a new one?</AlertDialogDescription>
				</div>

				<section className="">
					<ul className="my-6 space-y-4 border-y py-10">
						{calendars.items?.map(calendar => (
							<li key={calendar.id}>
								<Button disabled={isFetchingEvents || isCreatingCalendar} onClick={() => onSelectCalendar(calendar)} variant={'outline'} className={cn(selectedCalendar == calendar.id && 'ring-1 ring-ring ring-offset-2', 'h-16 w-full justify-start gap-4')}>
									<CalendarRange size={16} />
									<div className="text-sm">
										{calendar.summary} {calendar.primary && <Badge variant="secondary">Primary</Badge>}
									</div>

									{isFetchingEvents && selectedCalendar == calendar.id ? <LoadingSpinner className="ml-auto" /> : <Check size={12} className={cn('ml-auto transition-all duration-300', selectedCalendar == calendar.id ? 'opacity-80' : 'opacity-0')} />}
								</Button>
							</li>
						))}
					</ul>

					<Button disabled={isCreatingCalendar || isFetchingEvents} onClick={handleCreateNewCalendarClick} className="h-14 w-full gap-4" variant={'default'}>
						<CalendarRange size={16} />
						Create new calendar
						{isCreatingCalendar ? <LoadingSpinner className="ml-auto" /> : <Plus size={14} className="ml-auto" />}
					</Button>
				</section>
			</AlertDialogContent>
		</AlertDialog>
	);
};
