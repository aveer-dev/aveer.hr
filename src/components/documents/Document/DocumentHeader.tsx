'use client';

import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';
import { ChevronLeft, Cloud, CloudOff, CloudUpload, LockKeyhole, UnlockKeyhole, Globe, GlobeLock, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DocumentOptions } from '../document-options';
import { Tables } from '@/type/database.types';
import { DocumentMetadata } from '../types';
import { ResourceAccessDialog } from '@/components/file-manager/resource-access-dialog';
import { useState } from 'react';

interface DocumentHeaderProps {
	name: string;
	updateName: (name: string) => void;
	doc: any;
	documentState: any;
	userPermittedAction: () => string;
	currentUserId?: string;
	onBack?: () => void;
	setDoc: (updater: (prev: DocumentMetadata) => DocumentMetadata) => void;
	updateDocMetadata: (prev: DocumentMetadata, updates: Partial<DocumentMetadata>) => DocumentMetadata;
	fileId?: number;
}

export const DocumentHeader = ({ name, updateName, doc, documentState, userPermittedAction, currentUserId, onBack, setDoc, updateDocMetadata, fileId }: DocumentHeaderProps) => {
	const [accessDialogOpen, setAccessDialogOpen] = useState(false);
	return (
		<div className="mx-8 mb-8 flex items-center justify-between border-b pb-6">
			<div className="flex w-full items-center gap-3 text-sm font-light text-muted-foreground">
				{currentUserId && (
					<button onClick={onBack} disabled={documentState.isSaving} className={cn(buttonVariants({ variant: 'secondary' }), 'rounded-full')}>
						<ChevronLeft size={14} />
					</button>
				)}
				{currentUserId ? (
					<Input
						value={name}
						readOnly={doc.locked || doc.signed_lock || userPermittedAction() === 'viewer'}
						onChange={event => updateName(event.target.value)}
						className={cn('w-full max-w-[600px] px-0.5 py-2 pl-2 text-sm font-medium text-primary outline-none')}
						placeholder="Enter document's name"
					/>
				) : (
					<h1 className={cn('w-full px-0.5 py-2 pl-2 text-2xl font-bold text-primary')}>{name}</h1>
				)}
			</div>

			<div className="flex items-center gap-3">
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button variant={'ghost'} disabled className="disabled:pointer-events-auto disabled:opacity-100">
								{documentState.isSaving && <CloudUpload className="animate-bounce" size={14} />}
								{documentState.isSaved && <Cloud size={14} />}
								{!documentState.isSaved && !documentState.isSaving && <CloudOff size={14} />}
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p className="max-w-40">
								{documentState.isSaving && 'Saving changes...'}
								{documentState.isSaved && 'All changes saved'}
								{!documentState.isSaved && !documentState.isSaving && 'Changes not saved'}
							</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button variant={'ghost'} disabled className="disabled:pointer-events-auto disabled:opacity-100">
								{doc?.locked && <LockKeyhole size={14} />}
								{!doc?.locked && <UnlockKeyhole size={14} />}
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p className="max-w-40">Document is {doc?.locked ? 'locked and cannot be edited by anyone' : 'unlocked and can be edited by anyone with edit access'}.</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button variant={'ghost'} disabled className="disabled:pointer-events-auto disabled:opacity-100">
								{!doc.private && <Globe size={14} />}
								{doc.private && <GlobeLock size={14} />}
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p className="max-w-40">Document is {doc.private ? 'private, only visible to you and people with access' : 'visible to anyone on the internet or with document link.'}</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				{currentUserId && (
					<>
						<Button variant={'secondary'} onClick={() => setAccessDialogOpen(true)}>
							<Share2 size={14} />
						</Button>
						<ResourceAccessDialog resourceId={fileId} resourceType="file" org={doc.org.subdomain} resourceName={name} open={accessDialogOpen} setOpen={setAccessDialogOpen} />
						<DocumentOptions
							currentUserId={currentUserId}
							document={doc as unknown as Tables<'documents'>}
							onStateChange={updates => {
								setDoc(prev => updateDocMetadata(prev, updates as any));
							}}
						/>
					</>
				)}
			</div>
		</div>
	);
};
