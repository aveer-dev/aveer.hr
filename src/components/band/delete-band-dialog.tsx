import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loader';
import { Dispatch, SetStateAction, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from 'sonner';

interface props {
	toggleDialog: Dispatch<SetStateAction<boolean>>;
	isToggled?: boolean;
	deleteBand: () => Promise<string | true>;
	onBandDeleted: () => void;
}

export const DeleteBandDialog = ({ isToggled, toggleDialog, deleteBand, onBandDeleted }: props) => {
	const [isDeleting, setDeleteState] = useState(false);

	const onDeleteBand = async () => {
		setDeleteState(true);
		const response = await deleteBand();
		setDeleteState(false);
		toggleDialog(false);
		if (response !== true) return toast('❌ Error', { description: response });
		toast('🍻 Success', { description: 'Band deleted successfully' });
		onBandDeleted();
	};

	const SubmitButton = () => {
		const { pending } = useFormStatus();

		return (
			<Button onClick={() => onDeleteBand()} variant={'destructive'} disabled={pending || isDeleting} size={'sm'} className="gap-2">
				{(pending || isDeleting) && <LoadingSpinner />}
				{pending || isDeleting ? 'Deleting band' : 'Delete band'}
			</Button>
		);
	};

	return (
		<AlertDialog open={isToggled} onOpenChange={toggleDialog}>
			<AlertDialogContent className="gap-12">
				<AlertDialogHeader>
					<AlertDialogTitle>🙋🏾 Caution, are you absolutely sure?</AlertDialogTitle>
					<AlertDialogDescription className="text-xs leading-7">This action cannot be undone. This action will permanently delete this employee band from your organisation</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<SubmitButton />
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
