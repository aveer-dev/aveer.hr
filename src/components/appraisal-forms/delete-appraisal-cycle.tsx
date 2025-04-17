'use client';

import { Tables } from '@/type/database.types';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import { deleteAppraisalCycle } from './appraisal.actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LoadingSpinner } from '@/components/ui/loader';

interface Props {
	org: string;
	cycle: Tables<'appraisal_cycles'>;
}

export const DeleteAppraisalCycle = ({ org, cycle }: Props) => {
	const router = useRouter();
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			const result = await deleteAppraisalCycle(org, cycle.id);
			if (result === true) {
				setIsDeleting(false);
				router.refresh();
			} else {
				toast.error('Error deleting appraisal cycle', { description: result });
				setIsDeleting(false);
			}
		} catch (error) {
			toast.error('Error deleting appraisal cycle', { description: error instanceof Error ? error.message : 'An unknown error occurred' });
			setIsDeleting(false);
		}
	};

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="secondary_destructive" size="icon" className="h-8 w-8">
					{isDeleting ? <LoadingSpinner className="text-destructive-foreground" /> : <Trash2 size={12} />}
				</Button>
			</AlertDialogTrigger>

			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you sure?</AlertDialogTitle>
					<AlertDialogDescription>This action cannot be undone. This will permanently delete the appraisal cycle &quot;{cycle.name}&quot; and all associated data.</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
						Delete
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
