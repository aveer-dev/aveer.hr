'use client';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { deleteQuestionTemplate } from './appraisal.actions';
import { LoadingSpinner } from '../ui/loader';

interface DeleteTemplateDialogProps {
	templateId: number;
	org: string;
	onSuccess?: () => void;
}

export function DeleteTemplateDialog({ templateId, org, onSuccess }: DeleteTemplateDialogProps) {
	const [isDeleting, setIsDeleting] = useState(false);
	const router = useRouter();

	const handleDelete = async () => {
		try {
			setIsDeleting(true);
			await deleteQuestionTemplate(templateId, org);
			router.refresh();
			toast.success('Question template deleted successfully');
			onSuccess?.();
		} catch (error) {
			console.error('Error deleting template:', error);
			toast.error('Failed to delete question template');
		} finally {
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
					<AlertDialogTitle>Delete Question Template</AlertDialogTitle>
					<AlertDialogDescription>Are you sure you want to delete this question template? This action cannot be undone and will permanently delete the template and all its associated questions.</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
						{isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Delete Template
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
