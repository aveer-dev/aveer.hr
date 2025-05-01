'use client';

import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { useDocumentActions } from '@/hooks/use-document-actions';
import { LoadingSpinner } from '@/components/ui/loader';
import { useState } from 'react';
import Link from 'next/link';
import { BookDashed, Copy, LockKeyhole, LockKeyholeOpen, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Tables } from '@/type/database.types';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { format } from 'date-fns';
import { DocumentDupDialog } from './document-dup-dialog';

interface DocumentItemProps {
	document: Tables<'documents'>;
	createDocument: () => Promise<PostgrestSingleResponse<Tables<'documents'>>>;
	currentUserId: string;
}

export const DocumentItem = ({ document, createDocument, currentUserId }: DocumentItemProps) => {
	const [documentState, setDocumentState] = useState<Partial<Tables<'documents'>>>({});
	const { isDeleting, isLocking, handleDeleteDocument, handleLockDocument } = useDocumentActions({
		document,
		onStateChange: updates => setDocumentState(prev => ({ ...prev, ...updates }))
	});

	const isDocumentLocked = documentState?.locked ?? document.locked;

	return (
		<ContextMenu>
			<ContextMenuTrigger asChild>
				<Link
					href={`./documents/${document.id}`}
					className="flex h-72 cursor-pointer flex-col items-center justify-center rounded-md border border-secondary bg-accent/50 text-left text-sm font-light drop-shadow-sm transition-all duration-500 hover:scale-105 hover:drop-shadow">
					{document.template && (
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button variant={'ghost'} className="absolute right-0 top-0 text-yellow-600">
										<BookDashed size={14} />
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p className="max-w-40 font-extralight">Template document</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					)}

					<div className="space-y-2 p-2 text-center">
						<div>{document.name}</div>
						<div className="text-xs text-muted-foreground">Updated: {format(new Date(document.updated_at), 'PPP')}</div>
					</div>
				</Link>
			</ContextMenuTrigger>

			<ContextMenuContent className="w-44 *:gap-3">
				<DocumentDupDialog document={document} currentUserId={currentUserId} redirectPath={`./documents`}>
					<ContextMenuItem onSelect={event => event.preventDefault()}>
						<Copy size={14} />
						Duplicate
					</ContextMenuItem>
				</DocumentDupDialog>

				<ContextMenuItem disabled={document.signed_lock} onSelect={handleLockDocument}>
					{isLocking ? <LoadingSpinner /> : isDocumentLocked ? <LockKeyholeOpen size={14} /> : <LockKeyhole size={14} />}
					{isDocumentLocked ? 'Unlock' : 'Lock'}
				</ContextMenuItem>

				<ContextMenuItem disabled={document.signed_lock} onSelect={handleDeleteDocument}>
					{isDeleting ? <LoadingSpinner /> : <Trash2 size={14} />}
					Delete
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
};
