'use client';

import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CalendarRange, Check, CircleAlert, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loader';

import { ROLE } from '@/type/contract.types';
import { Tables } from '@/type/database.types';
import { useRouter } from 'next/navigation';
import { calendar_v3 } from '@googleapis/calendar';
import { cn } from '@/lib/utils';
import { addEmployeesToGCalendar, createOrgCalendar, uploadGEventsToDB } from '@/components/calendar/calendar-actions';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
	const [showConfirmation, setConfirmationState] = useState(false);
	const router = useRouter();
	const [selectedCalendar, setSelectedCalendar] = useState<calendar_v3.Schema$CalendarListEntry>();

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
		setSelectedCalendar(calendar);
		setConfirmationState(true);
	};

	const connectSelectedCalendar = async (addEmployee?: boolean) => {
		if (!selectedCalendar) return;
		setConfirmationState(false);
		setFetchingEventsState(true);

		try {
			await uploadGEventsToDB({ org, calendar: selectedCalendar });
			toast.success('Google calendar events are now on aveer');
			setFetchingEventsState(false);
			toggleAdd(false);
			router.refresh();

			if (addEmployee) addEmployeesToGoogleCalendar();
		} catch (error: any) {
			setFetchingEventsState(false);
			toast.error(error?.message || error);
		}
	};

	const addEmployeesToGoogleCalendar = async () => {
		if (!selectedCalendar || !selectedCalendar.id) return;

		try {
			toast.promise(addEmployeesToGCalendar({ org, calendarId: selectedCalendar?.id }), {
				loading: 'Adding employees to calendar...',
				success: () => {
					return `Employees all employees and admins now added to Google calendar`;
				},
				error: 'Error'
			});
		} catch (error: any) {
			toast.error(error.message || error);
		}
	};

	return (
		<>
			<AlertDialog open={isAddOpen} onOpenChange={state => toggleAdd(state)}>
				<AlertDialogContent className="pt-0">
					<CalendarRange size={24} />
					<div>
						<AlertDialogTitle>Select a calendar</AlertDialogTitle>
						<AlertDialogDescription className="mt-3 text-sm font-light leading-6">We found these calendars on your Google calendar account, will you like to continue with an existing calendar or create a new one?</AlertDialogDescription>
					</div>

					<section>
						<ul className="mb-6 space-y-4 border-b py-10">
							{calendars.items?.map(calendar => (
								<li key={calendar.id}>
									<Button
										disabled={isFetchingEvents || isCreatingCalendar}
										onClick={onSelectCalendar.bind(this, calendar)}
										variant={'outline'}
										className={cn(selectedCalendar?.id == calendar.id && 'ring-1 ring-ring ring-offset-2', 'h-16 w-full justify-start gap-4')}>
										<CalendarRange size={16} />
										<div className="text-sm">
											{calendar.summary} {calendar.primary && <Badge variant="secondary">Primary</Badge>}
										</div>

										{isFetchingEvents && selectedCalendar?.id == calendar.id ? <LoadingSpinner className="ml-auto" /> : <Check size={12} className={cn('ml-auto transition-all duration-300', selectedCalendar?.id == calendar.id ? 'opacity-80' : 'opacity-0')} />}
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

			<AlertDialog open={showConfirmation} onOpenChange={setConfirmationState}>
				<AlertDialogContent className="pt-0">
					<AlertDialogTitle className="flex items-center gap-2">
						<CircleAlert size={16} /> Note
					</AlertDialogTitle>

					<AlertDialogDescription className="text-sm leading-6 text-primary" asChild>
						<div>
							All employees will now have a
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<strong className="mx-1.5 cursor-help border-b border-dashed italic">view access</strong>
									</TooltipTrigger>

									<TooltipContent>
										<p className="max-w-xs">Employees will be able to view permitted calendar event, but cannot edit calendar settings or events</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
							to selected calendar, and admins will now have
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<strong className="mx-1.5 cursor-help border-b border-dashed italic">edit access</strong>
									</TooltipTrigger>

									<TooltipContent>
										<p className="max-w-xs">Other admins will also be able to edit calendar settings, and create calendar events</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
							to selected calendar.
						</div>
					</AlertDialogDescription>

					<AlertDialogFooter className="mt-4">
						<AlertDialogCancel>Cancel</AlertDialogCancel>

						<Button className="!ml-auto min-w-32" onClick={connectSelectedCalendar.bind(this, true)}>
							Proceed
						</Button>
						<Button className="" onClick={connectSelectedCalendar.bind(this, false)} variant={'outline'}>
							Skip
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};
