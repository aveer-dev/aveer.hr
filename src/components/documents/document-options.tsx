import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BookCopy, EllipsisVertical, LockKeyhole, LockKeyholeOpen, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { LoadingSpinner } from '@/components/ui/loader';
import { DocumentDupDialog } from './document-dup-dialog';
import { Tables } from '@/type/database.types';
import { useDocumentActions } from '@/hooks/use-document-actions';

interface DocumentOptionsProps {
	currentUserId: string;
	document: Tables<'documents'>;
	onStateChange?: (updates: Partial<Tables<'documents'>>) => void;
}

export const DocumentOptions = ({ currentUserId, document, onStateChange }: DocumentOptionsProps) => {
	const [isOptionOpen, toggleOptionState] = useState(false);

	const { isDeleting, isLocking, handleDeleteDocument, handleLockDocument } = useDocumentActions({
		document,
		onActionComplete: () => toggleOptionState(false),
		onStateChange
	});

	return (
		<DropdownMenu open={isOptionOpen} onOpenChange={toggleOptionState}>
			<DropdownMenuTrigger asChild className="[&[data-state=open]]:bg-accent">
				<Button variant="secondary">
					<EllipsisVertical size={14} />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent className="w-44 *:gap-3" align="end">
				<DropdownMenuItem disabled={document.signed_lock} onSelect={handleLockDocument}>
					{isLocking ? <LoadingSpinner /> : document.locked ? <LockKeyholeOpen size={12} /> : <LockKeyhole size={12} />} {document.locked ? 'Unlock' : 'Lock'}
				</DropdownMenuItem>

				<DocumentDupDialog document={document} currentUserId={currentUserId} onClose={toggleOptionState}>
					<DropdownMenuItem onSelect={event => event.preventDefault()}>
						<BookCopy size={12} /> Make a copy
					</DropdownMenuItem>
				</DocumentDupDialog>

				<DropdownMenuItem disabled={document.signed_lock} onSelect={handleDeleteDocument}>
					{isDeleting ? <LoadingSpinner /> : <Trash2 size={12} />} Delete
				</DropdownMenuItem>

				{/* <DropdownMenuItem onClick={event => event.preventDefault()} disabled={isTemplating || document.signed_lock}>
					{isTemplating ? <LoadingSpinner /> : <BookDashed className="w-3" />} Template
					<Switch checked={document.template} disabled={isTemplating} id="template" className="ml-auto scale-50" onCheckedChange={onTemplateSwitch} />
				</DropdownMenuItem> */}

				{/* <DropdownMenuItem>
					<Download size={12} /> Download
				</DropdownMenuItem> */}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
