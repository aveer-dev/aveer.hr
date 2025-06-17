'use client';

import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } from '@/components/ui/context-menu';
import { FileWithAccess, FolderWithAccess } from '@/dal/interfaces/file-management.types';
import { useState, useRef, Fragment } from 'react';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { FolderClosed, FolderKey, Info, User, File as FileIcon, PackageOpen, FolderPen, FilePen } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { EmployeeHoverCard } from '@/components/ui/employee-hover-card';
import { Button } from '@/components/ui/button';
import { updateFolderServerAction, getFileDownloadUrl, updateFileServerAction, getFileUrl } from './file.actions';
import { toast } from 'sonner';
import { ResourceDeleteMenuItem } from './delete-folder-menu-item';
import { ResourceAccessDialog } from './resource-access-dialog';
import { ResourceDetailsSheet } from './ResourceDetailsSheet';
import { isUUID } from '@/lib/utils';
import { FileActionsDropdown } from './FileActionsDropdown';
import { useRouter } from 'next/navigation';
import { ROLE } from '@/type/contract.types';

export const FileFolderList = ({ files, folders, org, role, userId }: { files: FileWithAccess[]; folders: FolderWithAccess[]; org: string; role: ROLE; userId: string }) => {
	const router = useRouter();
	const [selectedFile, setSelectedFile] = useState<FileWithAccess | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [accessDialogOpen, setAccessDialogOpen] = useState(false);
	const [breadcrumb, setBreadcrumb] = useState<FolderWithAccess[]>([]);
	const [currentFolder, setCurrentFolder] = useState<FolderWithAccess | null>(null);
	const [selectedFolder, setSelectedFolder] = useState<FolderWithAccess | null>(null);
	const [renamingFolderId, setRenamingFolderId] = useState<number | null>(null);
	const [renameValue, setRenameValue] = useState<string>('');
	const clickTimeout = useRef<NodeJS.Timeout | null>(null);
	const renameInputRef = useRef<HTMLInputElement | null>(null);

	// Filter folders/files based on current folder context
	const visibleFolders = folders.filter(f => (currentFolder ? f.parent === currentFolder.id : !f.parent));
	const visibleFiles = files.filter(f => (currentFolder ? f.folder === currentFolder.id : !f.folder));

	// Combine into a single array with a type discriminator
	const visibleItems = [...visibleFolders.map(folder => ({ ...folder, type: 'folder' as const })), ...visibleFiles.map(file => ({ ...file, type: 'file' as const }))];

	// Handlers
	const handleFolderClick = (folder: FolderWithAccess) => {
		setCurrentFolder(folder);
		setBreadcrumb(prev => [...prev, folder]);
	};

	const handleBreadcrumbClick = (index: number) => {
		const newBreadcrumb = breadcrumb.slice(0, index + 1);
		setBreadcrumb(newBreadcrumb);
		setCurrentFolder(newBreadcrumb[newBreadcrumb.length - 1] || null);
	};

	// Handler to open folder details drawer
	const handleFolderDetails = (folder: FolderWithAccess) => {
		setDrawerOpen(true);
	};

	// Single click: open details drawer (delayed)
	const handleSingleClick = (folder: FolderWithAccess) => {
		handleFolderDetails(folder);
	};

	const selectItem = (item: FileWithAccess | FolderWithAccess) => {
		if ('type' in item && item.type === 'folder') {
			setSelectedFolder(item as FolderWithAccess);
			setSelectedFile(null);
		} else {
			setSelectedFile(item as FileWithAccess);
			setSelectedFolder(null);
		}
	};

	// Wrapper for click
	const handleClick = (item: FileWithAccess | FolderWithAccess) => {
		selectItem(item);

		if (clickTimeout.current) {
			clearTimeout(clickTimeout.current);
			clickTimeout.current = null;
		}
		// Set a timeout for single click
		clickTimeout.current = setTimeout(() => {
			handleSingleClick(item as FolderWithAccess);
			clickTimeout.current = null;
		}, 400);
	};

	// Wrapper for double click
	const handleDoubleClickWrapper = async (item: FileWithAccess | FolderWithAccess) => {
		// Cancel the single click timeout
		if (clickTimeout.current) {
			clearTimeout(clickTimeout.current);
			clickTimeout.current = null;
		}

		if ('type' in item && (item as FileWithAccess)?.file_type === 'document') return router.push(`./documents/${(item as FileWithAccess)?.document}`);
		if ((item as FileWithAccess)?.file_type === 'storage' && (item as FileWithAccess)?.storage_url) {
			const request = getFileUrl(item as FileWithAccess);
			toast.promise(request, {
				loading: 'Getting file URL...',
				success: ({ data, error }) => {
					if (error) toast.error('Failed to get file URL', { description: error.message });
					if (data && data.signedUrl) {
						window.open(data.signedUrl, '_blank');
						return 'File opened in a new tab!';
					}
					return 'Failed to get file URL';
				},
				error: 'Failed to get file URL'
			});
			return;
		}

		handleFolderClick(item as FolderWithAccess);
	};

	// Type guard helpers
	function isFileWithType(item: any): item is FileWithAccess & { type: 'file' } {
		return item && item.type === 'file';
	}

	function isFolderWithType(item: any): item is FolderWithAccess & { type: 'folder' } {
		return item && item.type === 'folder';
	}

	// Handler to start renaming
	const handleStartRename = (item: FolderWithAccess | (FileWithAccess & { type: 'file' | 'folder' })) => {
		setRenamingFolderId(item.id);
		setRenameValue(item.name);
		setTimeout(() => {
			renameInputRef.current?.focus();
		}, 0);
	};

	// Handler to submit rename
	const handleRenameSubmit = async (item: FolderWithAccess | (FileWithAccess & { type: 'file' | 'folder' })) => {
		if (renameValue.trim() && renameValue !== item.name) {
			if (isFolderWithType(item)) {
				toast.promise(updateFolderServerAction(item.id, { name: renameValue }), {
					loading: 'Renaming folder...',
					success: 'Folder renamed!',
					error: 'Failed to rename folder'
				});
			} else if (isFileWithType(item) && item.file_type !== 'document') {
				toast.promise(updateFileServerAction(item.id, { name: renameValue }), {
					loading: 'Renaming file...',
					success: 'File renamed!',
					error: 'Failed to rename file'
				});
			}
		}
		setRenamingFolderId(null);
	};

	// Handler for input keydown
	const handleRenameKeyDown = (e: React.KeyboardEvent, item: FolderWithAccess | (FileWithAccess & { type: 'file' | 'folder' })) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleRenameSubmit(item);
		} else if (e.key === 'Escape') {
			setRenamingFolderId(null);
		}
	};

	// Render Breadcrumb
	const renderBreadcrumb = () => (
		<div className="mb-6 mt-8 flex items-end justify-between">
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink asChild>
							<a
								onClick={() => {
									setCurrentFolder(null);
									setBreadcrumb([]);
								}}
								className="cursor-pointer text-sm">
								Files
							</a>
						</BreadcrumbLink>
					</BreadcrumbItem>

					{breadcrumb.map((folder, idx) => (
						<Fragment key={`sep-${folder.id}`}>
							<BreadcrumbSeparator key={`sep-${folder.id}`} />
							<BreadcrumbItem key={folder.id}>
								<BreadcrumbLink asChild>
									<a onClick={() => handleBreadcrumbClick(idx)} className="cursor-pointer text-sm">
										{folder.name}
									</a>
								</BreadcrumbLink>
							</BreadcrumbItem>
						</Fragment>
					))}
				</BreadcrumbList>
			</Breadcrumb>

			<FileActionsDropdown org={org} parentFolderId={currentFolder?.id} ownerType={role == 'admin' ? 'organisation' : 'employee'} ownerId={role == 'admin' ? org : userId} />
		</div>
	);

	const handleAccessDialog = ({ state, resource }: { state: boolean; resource?: FolderWithAccess | FileWithAccess }) => {
		setAccessDialogOpen(state);

		if (!resource) return;
		selectItem(resource);
	};

	const handleDownload = async (file: FileWithAccess) => {
		const toastId = toast.loading('Preparing download...');
		const { error, data } = await getFileDownloadUrl(file);

		if (error) {
			toast.error('Failed to get download link', { id: toastId, description: error.message });
			return;
		}

		if (!data) {
			toast.error('Download not available for this file type', { id: toastId });
			return;
		}

		// Trigger download
		const a = document.createElement('a');
		a.href = URL.createObjectURL(data);
		a.download = file.name;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		toast.success('Download started', { id: toastId });
	};

	return (
		<div>
			{renderBreadcrumb()}

			<div className="mt-4 space-y-2 overflow-x-auto">
				{visibleItems.length > 0 &&
					visibleItems.map(item => {
						return (
							<ContextMenu onOpenChange={state => state && selectItem(item)} key={`${item.type}-${item.id}`}>
								<ContextMenuTrigger asChild>
									<Button
										type="button"
										variant="ghost"
										onClick={() => {
											if (renamingFolderId === item.id) return;
											handleClick(item);
										}}
										onDoubleClick={() => {
											if (renamingFolderId === item.id) return;
											handleDoubleClickWrapper(item);
										}}
										className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-md py-3 text-left transition-all duration-500 ${
											{
												folder: selectedFolder?.id === item.id,
												file: selectedFile?.id === item.id
											}[item.type]
												? 'bg-muted px-3'
												: ''
										}`}
										aria-current={item.type === 'folder' ? selectedFolder?.id === item.id : selectedFile?.id === item.id}>
										<div className="flex w-full max-w-xl items-center gap-2">
											{item.type === 'folder' ? <FolderClosed size={14} className="mr-3 text-muted-foreground" /> : <FileIcon size={14} className="mr-3 text-muted-foreground" />}
											<div className="w-full max-w-xl flex-1 truncate text-sm">
												{renamingFolderId === item.id && (isFolderWithType(item) || (isFileWithType(item) && item.file_type !== 'document')) ? (
													<input
														ref={renameInputRef}
														value={renameValue}
														onChange={e => setRenameValue(e.target.value)}
														onBlur={() => handleRenameSubmit(item)}
														onKeyDown={e => handleRenameKeyDown(e, item)}
														className="w-full rounded border px-2 py-1 text-sm outline-none"
														onClick={e => e.stopPropagation()}
														onDoubleClick={e => e.stopPropagation()}
													/>
												) : (
													item.name
												)}
											</div>
											{item.type === 'file' && <span className="ml-2 hidden text-xs text-muted-foreground sm:block">{item.file_type}</span>}
										</div>

										<div className="flex items-center gap-4 text-xs text-muted-foreground">
											<div className="hidden items-center gap-2 sm:flex">
												<User size={14} className="text-muted-foreground" />
												Created by: <EmployeeHoverCard employeeId={item.created_by} org={org} contentClassName="text-xs" />
											</div>
											<Separator orientation="vertical" className="hidden h-4 bg-border/75 sm:block" />
											<div className="hidden items-center gap-2 sm:flex">
												<User size={14} className="text-muted-foreground" />
												Owned by: {isUUID(item.owner_id) ? <EmployeeHoverCard employeeId={item.owner_id} org={org} contentClassName="text-xs" /> : <span>Organisation</span>}
											</div>
											<Separator orientation="vertical" className="hidden h-4 bg-border/75 sm:block" />
											<div className="text-xs text-muted-foreground">{format(item.created_at!, 'MMM d, yyyy')}</div>
										</div>
									</Button>
								</ContextMenuTrigger>

								<ContextMenuContent className="w-52" onCloseAutoFocus={e => e.preventDefault()}>
									<ContextMenuItem onClick={() => handleFolderDetails(item as FolderWithAccess)} className="text-xs font-light">
										<Info size={14} className="mr-3" />
										View Details
									</ContextMenuItem>

									{(item as FileWithAccess).file_type !== 'document' && item.access_level !== 'read' && (
										<ContextMenuItem onClick={() => handleStartRename(item)} className="text-xs font-light">
											{item.type === 'folder' ? <FolderPen size={14} className="mr-3" /> : <FilePen size={14} className="mr-3" />}
											Rename
										</ContextMenuItem>
									)}

									<ContextMenuItem className="text-xs font-light" onSelect={() => handleAccessDialog({ state: true, resource: item })}>
										<FolderKey size={14} className="mr-3" />
										Manage Access
									</ContextMenuItem>

									{item.type === 'file' && item.file_type == 'storage' && (
										<ContextMenuItem className="text-xs font-light" onClick={() => handleDownload(item as FileWithAccess)}>
											<FileIcon size={14} className="mr-3" />
											Download
										</ContextMenuItem>
									)}

									{item.type === 'folder' && (item.access_level === 'owner' || item.access_level === 'full') ? (
										<ResourceDeleteMenuItem resource={item as FolderWithAccess} resourceType="folder" selectedFolder={selectedFolder} setSelectedFolder={setSelectedFolder} />
									) : (
										<ResourceDeleteMenuItem resource={item as FileWithAccess} resourceType="file" selectedFile={selectedFile} setSelectedFile={setSelectedFile} />
									)}
								</ContextMenuContent>
								<Separator className="bg-border/75" />
							</ContextMenu>
						);
					})}

				{visibleItems.length === 0 && (
					<div className="flex h-72 w-full flex-col items-center justify-center gap-4 rounded-md bg-muted text-center text-sm text-muted-foreground">
						<PackageOpen size={32} className="text-muted-foreground" />
						<p className="text-sm">No files or folders found</p>
					</div>
				)}
			</div>

			<ResourceAccessDialog
				resourceName={selectedFolder ? selectedFolder.name : selectedFile ? selectedFile.name : ''}
				resourceId={selectedFolder ? selectedFolder.id : selectedFile ? selectedFile.id : undefined}
				resourceType={selectedFolder ? 'folder' : selectedFile ? 'file' : 'folder'}
				org={org}
				open={accessDialogOpen}
				setOpen={setAccessDialogOpen}
			/>

			<ResourceDetailsSheet open={drawerOpen} onOpenChange={setDrawerOpen} resource={selectedFolder || selectedFile} resourceType={selectedFolder ? 'folder' : selectedFile ? 'file' : undefined} org={org} />
		</div>
	);
};
