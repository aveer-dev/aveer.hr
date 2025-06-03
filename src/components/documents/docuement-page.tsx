import { FileManagementRepository } from '@/dal/repositories/file-management.repository';
import { Document } from './document';
import { createClient } from '@/utils/supabase/server';
import DocumentEditor from './document-editor';
import { ProfileRepository } from '@/dal/repositories/profile.repository';
import { redirect } from 'next/navigation';
import Editor from './document-editor';
import { HocuspocusProvider } from '@hocuspocus/provider';

interface Props {
	org: string;
	docId: string;
}

export const DocumentPage = async ({ org, docId }: Props) => {
	const supabase = await createClient();

	const {
		data: { user }
	} = await supabase.auth.getUser();

	if (!user) return redirect('/login');

	// Get the file associated with this document
	// Use listFiles to find the file by document id
	const fileRepo = new FileManagementRepository();
	const profileRepo = new ProfileRepository();

	const [{ data: documentData, error: docError }, { data: profile, error: profileError }, { data: files, error: fileError }] = await Promise.all([
		supabase.from('documents').select('*, org(subdomain, name)').match({ org, id: docId }).single(),
		profileRepo.getById(user?.id || ''),
		fileRepo.listFiles({ org, document: Number(docId) })
	]);

	if (profileError) return redirect('/login');

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

	const provider = new HocuspocusProvider({ url: 'ws://localhost:1234', name: documentData.hocuspocus_doc_id ?? '', token: user?.id });

	// return <Document doc={documentData} currentUserId={user?.id || ''} fileId={file.id} />;
	return <DocumentEditor currentUserId={user?.id || ''} dbDoc={documentData} token={user?.id || ''} profile={profile} fileId={file.id} />;
};
