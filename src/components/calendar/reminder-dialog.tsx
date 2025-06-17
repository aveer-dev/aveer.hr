import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ReminderForm } from './reminder-form';
import { Tables } from '@/type/database.types';

export const ReminderDialog = ({ reminder, org, contract, children, isOpen, onClose }: { onClose?: (state: boolean) => void; isOpen?: boolean; reminder?: Tables<'reminders'>; org: string; contract: number; children?: ReactNode }) => {
	const [isAddOpen, toggleAdd] = useState(isOpen || false);

	return (
		<AlertDialog
			open={isAddOpen}
			onOpenChange={state => {
				toggleAdd(state);
				onClose && onClose(state)!;
			}}>
			{!children && !reminder && (
				<AlertDialogTrigger asChild>
					<Button variant="ghost">
						<Plus size={16} />
					</Button>
				</AlertDialogTrigger>
			)}

			<AlertDialogTrigger asChild>{children}</AlertDialogTrigger>

			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Create reminder</AlertDialogTitle>
					<AlertDialogDescription className="hidden"></AlertDialogDescription>
				</AlertDialogHeader>

				<ReminderForm
					org={org}
					contract={contract}
					reminder={reminder}
					onCreateReminder={() => toggleAdd(false)}
					onClose={() => {
						onClose && onClose(false);
						toggleAdd(false);
					}}
				/>
			</AlertDialogContent>
		</AlertDialog>
	);
};
