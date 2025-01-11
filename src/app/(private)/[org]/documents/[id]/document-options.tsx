import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BookCopy, Download, EllipsisVertical, LockKeyhole, LockKeyholeOpen, Trash2 } from 'lucide-react';
import { deleteDocument, updateDocument } from '../document.actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState } from 'react';
import { LoadingSpinner } from '@/components/ui/loader';
import { DocumentDupDialog } from './document-dup-dialog';
import { Tables } from '@/type/database.types';

export const DocumentOptions = ({ currentUserId, document }: { currentUserId: string; document: Tables<'documents'> }) => {
	const router = useRouter();
	const [isOptionOpen, toggleOptionState] = useState(false);
	const [isDeleting, setDeleteState] = useState(false);
	const [isLocking, setLockState] = useState(false);

	const onDeleteDocument = async () => {
		setDeleteState(true);
		const { error } = await deleteDocument({ org: document.org, id: document.id });
		setDeleteState(false);

		if (error) return toast.error(error.message);
		router.replace('./');
	};

	const onLockDocument = async (event: Event) => {
		event.preventDefault();
		setLockState(true);
		const { error } = await updateDocument({ org: document.org, id: document.id, locked: !document.locked });
		setLockState(false);

		if (error) return toast.error(error.message);
		toast.success(`Document ${!document.locked ? 'locked' : 'unlocked'} successfully`);
		router.refresh();
		toggleOptionState(false);
	};

	return (
		<DropdownMenu open={isOptionOpen} onOpenChange={toggleOptionState}>
			<DropdownMenuTrigger asChild className="[&[data-state=open]]:bg-accent">
				<Button variant="ghost">
					<EllipsisVertical size={14} />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent className="w-56 *:gap-3" align="end">
				<DropdownMenuItem onSelect={onLockDocument}>
					{isLocking ? <LoadingSpinner /> : document.locked ? <LockKeyholeOpen size={12} /> : <LockKeyhole size={12} />} {document.locked ? 'Unlock' : 'Lock'}
				</DropdownMenuItem>

				<DocumentDupDialog document={document} currentUserId={currentUserId} onClose={toggleOptionState}>
					<DropdownMenuItem onSelect={event => event.preventDefault()}>
						<BookCopy size={12} /> Make a copy
					</DropdownMenuItem>
				</DocumentDupDialog>

				<DropdownMenuItem onClick={onDeleteDocument}>{isDeleting ? <LoadingSpinner /> : <Trash2 size={12} />} Delete</DropdownMenuItem>

				<DropdownMenuItem>
					<Download size={12} /> Download
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
