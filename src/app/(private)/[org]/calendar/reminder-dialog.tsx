import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ReminderForm } from './reminder-form';
import { Tables } from '@/type/database.types';

export const ReminderDialog = ({ reminder, org, contract, profile, children, isOpen, onClose }: { onClose?: () => void; isOpen?: boolean; reminder?: Tables<'reminders'>; org: string; contract: number; profile: string; children?: ReactNode }) => {
	const [isAddOpen, toggleAdd] = useState(isOpen || false);

	return (
		<AlertDialog
			open={isAddOpen}
			onOpenChange={state => {
				toggleAdd(state);
				onClose && onClose();
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
					profile={profile}
					reminder={reminder}
					onCreateReminder={() => toggleAdd(false)}
					onClose={() => {
						onClose && onClose();
						toggleAdd(false);
					}}
				/>
			</AlertDialogContent>
		</AlertDialog>
	);
};
