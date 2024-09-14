import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loader';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from 'sonner';
import { deleteBand } from './band.action';

interface props {
	org: string;
	id: number;
	onBandDeleted: () => void;
}

export const DeleteBandDialog = ({ org, id, onBandDeleted }: props) => {
	const [isDeleting, setDeleteState] = useState(false);
	const [isToggled, toggleDialog] = useState(false);

	const onDeleteBand = async () => {
		setDeleteState(true);
		const response = await deleteBand(org, id);
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
			<AlertDialogTrigger>
				<Button type="button" variant={'secondary_destructive'}>
					<Trash2 size={14} />
				</Button>
			</AlertDialogTrigger>

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
