import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { DocumentsList } from '@/components/documents/documents-list';
import { DocumentRepository } from '@/dal/repositories/document.repository';

export const DocumentsPage = async ({ org, contract }: { org: string; contract: number }) => {
	const supabase = await createClient();

	const documentsRepo = new DocumentRepository();
	const [
		docs,
		{
			data: { user }
		}
	] = await Promise.all([documentsRepo.getAllByOrg(org), supabase.auth.getUser()]);

	if (!user) return redirect('/app/login');

	const documents = docs.filter(document => document.shared_with?.filter((person: any) => person.contract == contract) || document.owner == user.id);

	return <DocumentsList currentUserId={user.id} documents={documents} org={org} />;
};
