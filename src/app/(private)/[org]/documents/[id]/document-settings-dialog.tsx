import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Settings2 } from 'lucide-react';
import { Tables } from '@/type/database.types';
import { DocumentSettings } from './document-settings';

export const DocumentSettingsDialog = ({ adminUsers, editors, docId, org, owner, currentUserId }: { currentUserId: string; owner: string; adminUsers?: Tables<'profiles_roles'>[] | null; editors?: string[]; org: string; docId: number }) => {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant={'ghost'}>
					<Settings2 size={14} />
				</Button>
			</AlertDialogTrigger>

			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Document settings</AlertDialogTitle>
					<AlertDialogDescription>Configure document settings</AlertDialogDescription>
				</AlertDialogHeader>

				<DocumentSettings currentUserId={currentUserId} adminUsers={adminUsers} editorIds={editors} org={org} docId={docId} owner={owner} />
			</AlertDialogContent>
		</AlertDialog>
	);
};
