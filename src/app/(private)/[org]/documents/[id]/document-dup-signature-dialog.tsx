import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ReactNode, useState } from 'react';
import { duplicateAndSendToSignatories } from '../document.actions';
import { Tables } from '@/type/database.types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loader';
import { useRouter } from 'next/navigation';

export const DocumentDupForSignature = ({ children, document, signatures, emails }: { signatures: any[]; emails: string[]; document: Tables<'documents'>; children: ReactNode }) => {
	const router = useRouter();
	const [documentName, setDocumentName] = useState('');
	const [isLoading, setLoadState] = useState(false);

	const makeCopy = async () => {
		if (!!signatures.find(signatory => !signatory.contract)) return toast.error('Set signatories for each signature');

		try {
			if (!documentName) return;
			setLoadState(true);

			await duplicateAndSendToSignatories({ document, emails, newDocName: documentName, signatures });
			setLoadState(false);
			toast.success('Document duplicated and signature request sent to signatories');
			router.push('./');
		} catch (error: any) {
			return toast.error(error.message || error);
		}
	};

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>{children}</AlertDialogTrigger>

			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Document name</AlertDialogTitle>
					<AlertDialogDescription>Enter document duplicate name avoid conflict with main document</AlertDialogDescription>
				</AlertDialogHeader>

				<section className="mt-4 space-y-8">
					<div className="space-y-2">
						<Label>Name</Label>
						<Input value={documentName} onChange={event => setDocumentName(event.target.value)} placeholder="New document name" />
					</div>
				</section>

				<AlertDialogFooter className="mt-6 sm:justify-start">
					<AlertDialogCancel className="w-full">Close</AlertDialogCancel>
					<Button className="w-full gap-3" onClick={makeCopy} disabled={isLoading || !documentName}>
						{isLoading && <LoadingSpinner />} Continue
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
