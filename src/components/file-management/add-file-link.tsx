'use client';

import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '../ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { FormEvent, useState } from 'react';
import { TablesInsert } from '@/type/database.types';
import { toast } from 'sonner';
import { LoadingSpinner } from '../ui/loader';
import { FileUpload } from './file-upload-zone';
import { useRouter } from 'next/navigation';

interface props {
	addLink: (payload: TablesInsert<'links'>) => Promise<string | true>;
	path: string;
}

export const AddFile = ({ addLink, path }: props) => {
	const [isAddingLink, toggleAddLinkState] = useState(false);
	const [isOpen, toggle] = useState(false);
	const [file, setFile] = useState({ name: '', link: '' });
	const router = useRouter();

	const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		toggleAddLinkState(true);

		const payload: TablesInsert<'links'> = { ...file, updated_at: new Date().toISOString(), org: '', path: `${path}` };
		const response = await addLink(payload);
		toggleAddLinkState(false);
		if (response !== true) return toast.error('Unable to add link', { description: response });

		toast.success('Link added successfully');
		toggle(false);
		router.refresh();
	};

	const onPaste = async () => setFile({ ...file, link: await navigator.clipboard.readText() });

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button className="absolute bottom-2 right-2 rounded-full">
						<Plus size={12} />
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent className="w-fit" align="end" side="top">
					<DropdownMenuItem onClick={() => toggle(!isOpen)}>
						<Link size={12} className="mr-2 text-muted-foreground" />
						<span>Add link</span>
					</DropdownMenuItem>

					<FileUpload path={path} />
				</DropdownMenuContent>
			</DropdownMenu>

			<AlertDialog open={isOpen} onOpenChange={toggle}>
				<AlertDialogContent className="max-w-md">
					<AlertDialogHeader>
						<AlertDialogTitle>Add file link</AlertDialogTitle>
						<AlertDialogDescription>Add file name and link below</AlertDialogDescription>
					</AlertDialogHeader>

					<form onSubmit={onSubmit} className="mt-5 space-y-6">
						<div className="space-y-2">
							<Label htmlFor="name">File name</Label>
							<Input id="name" value={file.name} onChange={event => setFile({ ...file, name: event.target.value })} required type="text" placeholder="File name" />
						</div>

						<div className="space-y-2">
							<Label htmlFor="link">Link</Label>
							<div className="relative">
								<Input id="link" className="pr-20" value={file.link} onChange={event => setFile({ ...file, link: event.target.value })} required type="url" placeholder="File link" />
								<Link size={10} className="absolute right-3 top-1/2 -translate-y-1/2" />
								<Button type="button" onClick={onPaste} className="absolute right-2 top-1/2 h-7 -translate-y-1/2 text-xs font-medium" variant={'outline'}>
									Paste
								</Button>
							</div>
						</div>

						<AlertDialogFooter>
							<AlertDialogCancel type="button">Cancel</AlertDialogCancel>

							<Button className="gap-3" disabled={isAddingLink}>
								{isAddingLink && <LoadingSpinner />}Add link
							</Button>
						</AlertDialogFooter>
					</form>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};
