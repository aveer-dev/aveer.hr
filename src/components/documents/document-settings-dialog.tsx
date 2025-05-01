import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { Tables } from '@/type/database.types';
import { DocumentSettings } from './document-settings';

interface props {
	employees?: Tables<'contracts'>[] | null;
	doc: Tables<'documents'>;
	currentUserId: string;
}

export const DocumentSettingsDialog = ({ doc, currentUserId, employees }: props) => {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant={'secondary'}>
					<Share2 size={14} />
				</Button>
			</AlertDialogTrigger>

			<AlertDialogContent>
				<AlertDialogHeader className="mb-4">
					<AlertDialogTitle>Share &quot;{doc.name}&quot;</AlertDialogTitle>
					<AlertDialogDescription>Configure document settings</AlertDialogDescription>
				</AlertDialogHeader>

				<DocumentSettings employees={employees} doc={doc} currentUserId={currentUserId} />
			</AlertDialogContent>
		</AlertDialog>
	);
};
