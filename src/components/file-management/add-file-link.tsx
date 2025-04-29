'use client';

import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Info, Link, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormEvent, useState } from 'react';
import { TablesInsert, Tables } from '@/type/database.types';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loader';
import { FileUpload } from './file-upload-zone';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface props {
	addLink: (payload: TablesInsert<'links'>) => Promise<string | true>;
	path: string;
	documents: Tables<'documents'>[];
}

export const AddFile = ({ addLink, path, documents }: props) => {
	const [isAddingLink, toggleAddLinkState] = useState(false);
	const [isOpen, toggle] = useState(false);
	const [file, setFile] = useState({ name: '', link: '' });
	const router = useRouter();
	const [selectedDocument, setSelectedDocument] = useState<string | undefined>(undefined);
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

	const onSubmitDocumentForm = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		toggleAddLinkState(true);

		const document = documents.find(document => document.id.toString() === selectedDocument);

		if (!document) return toast.error('Document not found');

		const payload: TablesInsert<'links'> = { name: document.name, document: document.id, link: document.link_id, updated_at: new Date().toISOString(), org: '', path: `${path}` };
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

					<Tabs defaultValue="aveer-document" className="w-[400px]">
						<TabsList className="grid w-fit grid-cols-2">
							<TabsTrigger value="aveer-document">Aveer Document</TabsTrigger>
							<TabsTrigger value="external">External</TabsTrigger>
						</TabsList>

						<TabsContent value="aveer-document">
							<form onSubmit={onSubmitDocumentForm} className="mt-5 space-y-6">
								<div className="space-y-2">
									<Label htmlFor="name" className="flex items-center gap-2">
										Select document
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<Info size={12} />
												</TooltipTrigger>

												<TooltipContent>
													<p className="max-w-56">Aveer documents selected here will remain visible to only people with access to the document</p>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</Label>

									<Select value={selectedDocument} onValueChange={setSelectedDocument}>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select document" />
										</SelectTrigger>

										<SelectContent>
											<SelectGroup>
												<SelectLabel>Documents on Aveer</SelectLabel>
												{documents.map(document => (
													<SelectItem key={document.id} value={document.id.toString()}>
														{document.name}
													</SelectItem>
												))}
											</SelectGroup>
										</SelectContent>
									</Select>
								</div>

								<AlertDialogFooter>
									<AlertDialogCancel type="button">Cancel</AlertDialogCancel>

									<Button className="gap-3" disabled={isAddingLink}>
										{isAddingLink && <LoadingSpinner />}Add link
									</Button>
								</AlertDialogFooter>
							</form>
						</TabsContent>

						<TabsContent value="external">
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
						</TabsContent>
					</Tabs>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};
