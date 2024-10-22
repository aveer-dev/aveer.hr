import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loader';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from 'sonner';
import { deleteTeam } from './team-actions';

interface props {
	org: string;
	id: number;
	onTeamDeleted: () => void;
}

export const DeleteTeamDialog = ({ org, id, onTeamDeleted }: props) => {
	const [isDeleting, setDeleteState] = useState(false);
	const [isToggled, toggleDialog] = useState(false);

	const onDeleteTeam = async () => {
		setDeleteState(true);
		const response = await deleteTeam(org, id);
		setDeleteState(false);

		toggleDialog(false);
		if (response !== true) return toast('❌ Error', { description: response });

		toast('🍻 Success', { description: 'Band deleted successfully' });
		onTeamDeleted();
	};

	const SubmitButton = () => {
		const { pending } = useFormStatus();

		return (
			<Button onClick={() => onDeleteTeam()} variant={'destructive'} disabled={pending || isDeleting} size={'sm'} className="gap-2">
				{(pending || isDeleting) && <LoadingSpinner />}
				{pending || isDeleting ? 'Deleting team' : 'Delete team'}
			</Button>
		);
	};

	return (
		<AlertDialog open={isToggled} onOpenChange={toggleDialog}>
			<AlertDialogTrigger asChild>
				<Button type="button" variant={'secondary_destructive'}>
					<Trash2 size={14} />
				</Button>
			</AlertDialogTrigger>

			<AlertDialogContent className="gap-12">
				<AlertDialogHeader>
					<AlertDialogTitle>🙋🏾 Caution, are you absolutely sure?</AlertDialogTitle>
					<AlertDialogDescription className="text-xs leading-7">Deleting a team will render people in this team without a team, including managers. This action cannot be undone.</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<SubmitButton />
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
