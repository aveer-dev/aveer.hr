import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ReactNode, useState } from 'react';
import { deleteMessage } from './messages.actions';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loader';
import { Button } from '@/components/ui/button';

export const DeleteMessageDialog = ({ title, id, children, onMessageDeleted }: { title: string; id: number; children?: ReactNode; onMessageDeleted: () => void }) => {
	const [isDeleting, setDeletingState] = useState(false);
	const [isOpen, toggleOpenState] = useState(false);

	const onDeleteMessage = async () => {
		setDeletingState(true);
		const response = await deleteMessage({ id });
		setDeletingState(false);

		toggleOpenState(false);
		if (typeof response === 'string') return toast.error('Unable to delete message', { description: response });

		onMessageDeleted();
		toast.success('Message deleted');
	};

	return (
		<AlertDialog open={isOpen} onOpenChange={toggleOpenState}>
			<AlertDialogTrigger asChild>{children}</AlertDialogTrigger>

			<AlertDialogContent className="space-y-4">
				<AlertDialogHeader>
					<AlertDialogTitle>You&apos;re about to delete {title || 'a'} message?</AlertDialogTitle>
					<AlertDialogDescription>Are you ablsolutely sure you want to delete this message?</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter className="sm:justify-start">
					<Button className="gap-3" variant={'destructive'} onClick={onDeleteMessage} disabled={isDeleting}>
						{isDeleting && <LoadingSpinner className="text-primary-foreground" />}
						Yes, Delete
					</Button>

					<AlertDialogCancel>Cancel</AlertDialogCancel>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
