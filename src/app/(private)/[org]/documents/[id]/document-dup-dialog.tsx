import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ReactNode, useState } from 'react';
import { createDocument } from '../document.actions';
import { Tables, TablesInsert } from '@/type/database.types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loader';

export const DocumentDupDialog = ({ children, onClose, document, currentUserId }: { document: Tables<'documents'>; children: ReactNode; onClose: (state: boolean) => void; currentUserId: string }) => {
	const [documentName, setDocumentName] = useState('');
	const [copyConfigs, setCopyConfigsState] = useState(true);
	const [isLoading, setLoadState] = useState(false);

	const makeCopy = async () => {
		if (!documentName) return;
		setLoadState(true);

		const payload: TablesInsert<'documents'> = copyConfigs ? { ...document, name: documentName, owner: currentUserId } : { name: documentName, html: document.html, org: document.org, editors: [currentUserId] };
		if (payload.id) delete payload.id;
		const { error, data } = await createDocument(payload);
		setLoadState(false);

		if (error) return toast.error(error.message);
		window.open(`./${data.id}`, '_blank');
	};

	return (
		<AlertDialog onOpenChange={onClose}>
			<AlertDialogTrigger asChild>{children}</AlertDialogTrigger>

			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Make document copy</AlertDialogTitle>
					<AlertDialogDescription>Set document copy details to create a document duplicate</AlertDialogDescription>
				</AlertDialogHeader>

				<section className="mt-4 space-y-8">
					<div className="space-y-2">
						<Label>Name</Label>
						<Input value={documentName} onChange={event => setDocumentName(event.target.value)} placeholder="New document name" />
					</div>

					<div className="flex items-center justify-between">
						<Label className="space-y-2">
							<p className="text-sm font-medium">Copy document configurations</p>
							<p>Configurations like editor, private, locked, e.t.c</p>
						</Label>
						<Switch className="scale-75" checked={copyConfigs} onCheckedChange={setCopyConfigsState} />
					</div>
				</section>

				<AlertDialogFooter className="mt-6 sm:justify-start">
					<AlertDialogCancel className="w-full">Close</AlertDialogCancel>
					<Button className="w-full gap-3" onClick={makeCopy} disabled={isLoading}>
						{isLoading && <LoadingSpinner />} Make copy
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
