import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { Tables } from '@/type/database.types';
import { EventForm } from './event-form';

interface PROPS {
	teams?: Tables<'teams'>[] | null;
	employees?: Tables<'contracts'>[] | null;
	onClose?: (state: boolean) => void;
	isOpen?: boolean;
	event?: Tables<'calendar_events'>;
	org: string;
	calendar?: Tables<'calendars'> | null;
	children?: ReactNode;
	noTrigger?: boolean;
}

export const EventDialog = ({ event, org, calendar, children, isOpen, onClose, teams, employees, noTrigger }: PROPS) => {
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

			{!noTrigger && <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>}

			<AlertDialogContent className="block max-h-screen w-full max-w-full overflow-y-auto bg-white/20 backdrop-blur-sm">
				<div className="mx-auto max-w-xl">
					<AlertDialogHeader className="relative mb-6">
						<AlertDialogTitle>{!event ? 'Create event' : 'Calendar event'}</AlertDialogTitle>
						<AlertDialogDescription className="hidden"></AlertDialogDescription>

						<AlertDialogCancel asChild>
							<Button variant={'outline'} className="absolute right-0 top-1/2 !mt-0 w-fit -translate-y-1/2 rounded-full">
								<X size={12} />
							</Button>
						</AlertDialogCancel>
					</AlertDialogHeader>

					<EventForm
						employeeList={employees as any}
						teamsList={teams}
						calendar={calendar}
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
				</div>
			</AlertDialogContent>
		</AlertDialog>
	);
};
