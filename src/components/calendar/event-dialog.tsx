import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Tables } from '@/type/database.types';
import { EventForm } from './event-form';

interface PROPS {
	teams?: Tables<'teams'>[] | null;
	employees?: Tables<'contracts'>[] | null;
	onClose?: (state: boolean) => void;
	isOpen?: boolean;
	event?: Tables<'calendar_events'>;
	org: string;
	calendarId: string;
	children?: ReactNode;
}

export const EventDialog = ({ event, org, calendarId, children, isOpen, onClose, teams, employees }: PROPS) => {
	const [isAddOpen, toggleAdd] = useState(isOpen || false);

	return (
		<AlertDialog
			open={isAddOpen}
			onOpenChange={state => {
				toggleAdd(state);
				onClose && onClose(state)!;
			}}>
			{!children && !event && (
				<AlertDialogTrigger asChild>
					<Button variant="ghost">
						<Plus size={16} />
					</Button>
				</AlertDialogTrigger>
			)}

			<AlertDialogTrigger asChild>{children}</AlertDialogTrigger>

			<AlertDialogContent className="block max-h-screen w-full overflow-y-auto bg-white/20 backdrop-blur-sm">
				<AlertDialogHeader>
					<AlertDialogTitle>{!event ? 'Create event' : 'Calendar event'}</AlertDialogTitle>
					<AlertDialogDescription className="hidden"></AlertDialogDescription>
				</AlertDialogHeader>

				<EventForm
					employeeList={employees as any}
					teamsList={teams}
					calendarId={calendarId}
					onClose={() => {
						toggleAdd(!isAddOpen);
						onClose && onClose(false);
					}}
					event={event}
					org={org}
					onCreateEvent={() => {
						toggleAdd(!isAddOpen);
						onClose && onClose(false);
					}}
				/>
			</AlertDialogContent>
		</AlertDialog>
	);
};
