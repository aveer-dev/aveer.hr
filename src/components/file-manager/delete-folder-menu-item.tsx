import { DialogClose } from '@/components/ui/dialog';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ContextMenuItem } from '@/components/ui/context-menu';
import { FileWithAccess, FolderWithAccess } from '@/dal/interfaces/file-management.types';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { deleteFileOrFolderServerAction } from './file.actions';
import { toast } from 'sonner';

export const ResourceDeleteMenuItem = ({
	resource,
	resourceType,
	selectedFolder,
	setSelectedFolder,
	selectedFile,
	setSelectedFile
}: {
	resource: FileWithAccess | FolderWithAccess;
	resourceType: 'file' | 'folder';
	selectedFolder?: FolderWithAccess | null;
	setSelectedFolder?: (f: FolderWithAccess | null) => void;
	selectedFile?: FileWithAccess | null;
	setSelectedFile?: (f: FileWithAccess | null) => void;
}) => {
	const [open, setOpen] = useState(false);
	const isFolder = resourceType === 'folder';

	const handleDelete = async () => {
		setOpen(false);

		toast.promise(deleteFileOrFolderServerAction(resource, resourceType), {
			loading: `Deleting ${isFolder ? 'folder' : 'file'}...`,
			success: ({ error }) => {
				if (error) return error.message;

				if (isFolder && selectedFolder?.id === resource.id && setSelectedFolder) setSelectedFolder(null);
				if (!isFolder && selectedFile?.id === resource.id && setSelectedFile) setSelectedFile(null);
				return `${isFolder ? 'Folder' : 'File'} deleted!`;
			},
			error: `Failed to delete ${isFolder ? 'folder' : 'file'}`
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<ContextMenuItem
					className="text-xs font-light text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive"
					onSelect={e => {
						e.preventDefault();
						setOpen(true);
					}}>
					<Trash2 size={14} className="mr-3" />
					Delete
				</ContextMenuItem>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete {isFolder ? 'folder' : 'file'}?</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete <span className="font-semibold">{resource.name}</span>? <br /> This action cannot be undone.
					</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="ghost">Cancel</Button>
					</DialogClose>

					<Button variant="destructive" onClick={handleDelete}>
						Delete
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
