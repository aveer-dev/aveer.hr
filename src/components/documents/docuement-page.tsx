import { FileManagementRepository } from '@/dal/repositories/file-management.repository';
import { Document } from './document';
import { createClient } from '@/utils/supabase/server';

interface Props {
	org: string;
	docId: string;
}

export const DocumentPage = async ({ org, docId }: Props) => {
	const supabase = await createClient();

	// Get the file associated with this document
	// Use listFiles to find the file by document id
	const fileRepo = new FileManagementRepository();

	const [
		{ data: documentData, error: docError },
		{
			data: { user }
		},
		{ data: files, error: fileError }
	] = await Promise.all([supabase.from('documents').select('*, org(subdomain, name)').match({ org, id: docId }).single(), supabase.auth.getUser(), fileRepo.listFiles({ org, document: Number(docId) })]);

	const file = files && files.length > 0 ? files[0] : null;

	if (!file) {
		return (
			<div className="flex h-48 w-full items-center justify-center text-muted-foreground">
				<p>No file found for this document.</p>
				{fileError && <p>{fileError?.message}</p>}
			</div>
		);
	}

	if (docError) {
		return <div className="flex h-48 w-full items-center justify-center text-muted-foreground">{docError.message}</div>;
	}

	return <Document doc={documentData} currentUserId={user?.id || ''} fileId={file.id} />;
};
