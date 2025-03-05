import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CalendarRange, Check, Settings2 } from 'lucide-react';
import { getAuthLink } from './calendar-actions';
import { LoadingSpinner } from '@/components/ui/loader';

import { ROLE } from '@/type/contract.types';
import { Tables } from '@/type/database.types';

interface props {
	isOpen?: boolean;
	org: string;
	employeeCalendarConfig?: Tables<'contract_calendar_config'>[] | null;
	role?: ROLE;
	contractId?: number;
	calendar?: Tables<'calendars'> | null;
}

export const CalendarConfigDialog = ({ org, isOpen, calendar }: props) => {
	const [isAddOpen, toggleAdd] = useState(isOpen || false);
	const [isConnecting, setConnectingState] = useState(false);

	const connectGoogleCalendar = async () => {
		setConnectingState(true);
		const response = await getAuthLink(org);
		window.open(response, '_self');
	};

	return (
		<AlertDialog open={isAddOpen} onOpenChange={state => toggleAdd(state)}>
			<AlertDialogTrigger asChild>
				<Button variant="ghost">
					<Settings2 size={16} />
				</Button>
			</AlertDialogTrigger>

			<AlertDialogContent className="pt-0">
				<CalendarRange size={24} />
				<div className="space-y-1">
					<AlertDialogTitle>Connected calendars</AlertDialogTitle>
					<AlertDialogDescription className="">Calendar thrid-party connections and settings</AlertDialogDescription>
				</div>

				<ul className="mt-2 space-y-6 rounded-md bg-muted px-3 py-5">
					<li className="flex items-center justify-between">
						<div className="text-sm text-support">Google Calendar</div>
						<Button disabled={!!(calendar && calendar.platform == 'google' && calendar?.calendar_id)} className="gap-3" onClick={connectGoogleCalendar}>
							{!!(calendar && calendar.platform == 'google' && calendar?.calendar_id) ? <>{isConnecting ? <LoadingSpinner /> : <Check size={12} />} Connected</> : 'Connect'}
						</Button>
					</li>

					<li className="flex items-center justify-between">
						<div className="text-sm text-support">Notion calendar</div>
						<Button disabled={true} className="gap-3">
							Disabled
						</Button>
					</li>

					<li className="flex items-center justify-between">
						<div className="text-sm text-support">Outlook calendar</div>
						<Button disabled={true} className="gap-3">
							Disabled
						</Button>
					</li>
				</ul>

				<AlertDialogFooter>
					<AlertDialogCancel className="w-full">Close</AlertDialogCancel>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
