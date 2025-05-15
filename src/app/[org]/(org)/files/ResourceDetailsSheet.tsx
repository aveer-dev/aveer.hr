import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { FolderClosed, File as FileIcon } from 'lucide-react';
import { EmployeeHoverCard } from '@/components/ui/employee-hover-card';
import { ResourceAccessList } from './ResourceAccessList';
import type { FileWithAccess, FolderWithAccess } from '@/dal/interfaces/file-management.types';
import React from 'react';
import { isUUID } from '@/lib/utils';
import { toast } from 'sonner';
import { getFileUrl } from './file.actions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	resource: FileWithAccess | FolderWithAccess | null;
	resourceType: 'file' | 'folder' | undefined;
	org: string;
}

export const ResourceDetailsSheet: React.FC<Props> = ({ open, onOpenChange, resource, resourceType, org }) => {
	if (!resource || !resourceType) return null;

	const openFile = () => {
		const request = getFileUrl(resource as FileWithAccess);
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
	};

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent side="right" className="w-full max-w-md">
				<SheetHeader>
					<SheetTitle className="flex items-center">
						{resourceType === 'folder' ? <FolderClosed size={18} className="mr-3 text-muted-foreground" /> : <FileIcon size={18} className="mr-3 text-muted-foreground" />}
						<span className="truncate">{resource.name}</span>
					</SheetTitle>

					<SheetDescription className="sr-only">{resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} details</SheetDescription>
				</SheetHeader>

				<div className="my-10 space-y-6 text-sm">
					<div className="space-y-4">
						<h3 className="font-medium">Who has access?</h3>
						<ResourceAccessList resourceId={resource.id} resourceType={resourceType} org={org} />
					</div>

					<Separator />

					<ul className="list-none space-y-6">
						<li className="space-y-2">
							<div className="text-xs text-muted-foreground">Owned by:</div>
							<div>{isUUID(resource.owner_id) ? <EmployeeHoverCard employeeId={resource.owner_id} org={org} contentClassName="text-xs" /> : <span>Organisation</span>}</div>
						</li>

						<li className="space-y-2">
							<div className="text-xs text-muted-foreground">Created by:</div>
							<div>
								<EmployeeHoverCard employeeId={resource.created_by} org={org} contentClassName="text-xs" />
							</div>
						</li>

						<li className="space-y-2">
							<div className="text-xs text-muted-foreground">Created at:</div>
							<div>{resource.created_at && format(resource.created_at, 'p - MMM d, yyyy')}</div>
						</li>

						<li className="space-y-2">
							<div className="text-xs text-muted-foreground">Last updated at:</div>
							<div>{resource.updated_at && format(resource.updated_at, 'p - MMM d, yyyy')}</div>
						</li>

						{resourceType === 'file' && (
							<>
								<li className="space-y-2">
									<div className="text-xs text-muted-foreground">File type:</div>
									<div>{(resource as FileWithAccess).file_type}</div>
								</li>

								<li className="space-y-2">
									<div className="text-xs text-muted-foreground">Storage URL:</div>
									<div>{(resource as FileWithAccess).storage_url ? <span className="break-all">{(resource as FileWithAccess).storage_url}</span> : <span className="text-muted-foreground">—</span>}</div>
								</li>

								<li className="space-y-2">
									<div className="text-xs text-muted-foreground">Document Link:</div>
									<div>
										{(resource as FileWithAccess).document ? (
											<Link href={`./documents/${(resource as FileWithAccess).document}`} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: 'link' }), 'px-0 underline')}>
												View Document
											</Link>
										) : (
											<Button variant="link" onClick={openFile} className="px-0 underline">
												View file
											</Button>
										)}
									</div>
								</li>
							</>
						)}

						{resourceType === 'folder' && (
							<li className="space-y-2">
								<div className="text-xs text-muted-foreground">Parent folder:</div>
								<div>{(resource as FolderWithAccess).parent ?? <span className="text-muted-foreground">—</span>}</div>
							</li>
						)}
					</ul>
				</div>
			</SheetContent>
		</Sheet>
	);
};

export default ResourceDetailsSheet;
