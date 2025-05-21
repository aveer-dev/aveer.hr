'use client';

import React, { useRef, useState } from 'react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronDown, FilePlus, FolderPlus, UploadCloud } from 'lucide-react';
import { createDocument } from '@/components/documents/document.actions';
import { toast } from 'sonner';
import { createFolderServerAction } from './file.actions';
import { uploadFileAndCreateRecord } from './file.actions';

interface FileActionsDropdownProps {
	org: string;
	ownerType: 'employee' | 'organisation';
	ownerId: string;
	parentFolderId?: number;
	entity?: number;
	onActionComplete?: () => void;
}

export const FileActionsDropdown: React.FC<FileActionsDropdownProps> = ({ org, ownerType, ownerId, parentFolderId, entity, onActionComplete }) => {
	const [open, setOpen] = useState(false);
	const [folderDialogOpen, setFolderDialogOpen] = useState(false);
	const [folderName, setFolderName] = useState('');
	const [folderLoading, setFolderLoading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [uploading, setUploading] = useState(false);

	// Create Folder
	const handleCreateFolder = async () => {
		setFolderLoading(true);
		try {
			const promise = createFolderServerAction({
				name: folderName,
				org,
				ownerType,
				ownerId,
				parentFolderId,
				entity
			});
			toast.promise(promise, {
				loading: 'Creating folder...',
				success: 'Folder created',
				error: err => `Error creating folder: ${err?.message || err}`
			});
			setFolderDialogOpen(false);
			setFolderName('');
			onActionComplete?.();
			setOpen(false);
		} catch (e: any) {
			// toast.error handled by toast.promise error
		} finally {
			setFolderLoading(false);
		}
	};

	// Upload File
	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;
		setUploading(true);

		try {
			for (const file of Array.from(files)) {
				const promise = uploadFileAndCreateRecord({ file, org, ownerType, ownerId, parentFolderId, entity });
				toast.promise(promise, {
					loading: `Uploading ${file.name}...`,
					success: async response => {
						if (response.error) return response.error.message;
						onActionComplete?.();
						return `${file.name} uploaded!`;
					},
					error: err => `Error uploading ${file.name}: ${err?.message || err}`
				});
				setOpen(false);
			}
		} catch (e: any) {
			// toast.error handled by toast.promise error
		} finally {
			setUploading(false);
			if (fileInputRef.current) fileInputRef.current.value = '';
		}
	};

	// Create Document
	const handleCreateDocument = async () => {
		try {
			const res = await createDocument({ org, ownedBy: ownerType });
			if (res.error) throw res.error;
			toast.success('Document created');
			onActionComplete?.();
			setOpen(false);
		} catch (e: any) {
			toast.error('Error creating document', { description: e.message });
		}
	};

	return (
		<>
			<DropdownMenu open={open} onOpenChange={setOpen}>
				<DropdownMenuTrigger asChild>
					<Button size="sm" className="px-4">
						<FilePlus className="mr-2 h-4 w-4" /> Create
						<ChevronDown size={12} className="ml-6" />
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent align="end" className="w-40">
					{/* Create Folder */}
					<DropdownMenuItem
						onSelect={e => {
							e.preventDefault();
							setFolderDialogOpen(true);
							setOpen(false);
						}}>
						<FolderPlus size={12} className="mr-2" /> Create Folder
					</DropdownMenuItem>

					{/* Upload File */}
					<DropdownMenuItem
						onSelect={e => {
							e.preventDefault();
							if (fileInputRef.current) fileInputRef.current.click();
						}}
						disabled={uploading}>
						<UploadCloud size={12} className="mr-2" /> Upload File
						<input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} disabled={uploading} />
					</DropdownMenuItem>

					{/* Create Document */}
					<DropdownMenuItem onSelect={handleCreateDocument}>
						<FilePlus size={12} className="mr-2" /> Create Document
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* AlertDialog for creating folder, rendered outside DropdownMenu */}
			<AlertDialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Create New Folder</AlertDialogTitle>
						<AlertDialogDescription>Enter a name for your new folder.</AlertDialogDescription>
					</AlertDialogHeader>
					<Input autoFocus placeholder="Folder name" value={folderName} onChange={e => setFolderName(e.target.value)} disabled={folderLoading} onKeyDown={e => e.key === 'Enter' && handleCreateFolder()} />
					<AlertDialogFooter>
						<AlertDialogCancel
							disabled={folderLoading}
							onClick={() => {
								setOpen(false);
								setFolderDialogOpen(false);
							}}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction disabled={folderLoading || !folderName.trim()} onClick={handleCreateFolder}>
							{folderLoading ? 'Creating...' : 'Create'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};
