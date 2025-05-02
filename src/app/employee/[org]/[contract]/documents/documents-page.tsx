import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';
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

	const createDocument = async () => {
		'use server';

		const supabase = await createClient();

		const res = await supabase
			.from('documents')
			.insert({ org, shared_with: [{ profile: user.id, access: 'owner', contract: contract }], name: `New Document - ${format(new Date(), 'PPP')}` })
			.select()
			.single();
		return res;
	};

	const documents = docs.filter(document => document.shared_with?.filter((person: any) => person.contract == contract) || document.owner == user.id);

	return <DocumentsList currentUserId={user.id} documents={documents} createDocument={createDocument} />;
};
