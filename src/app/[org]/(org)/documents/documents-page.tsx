import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';
import { DocumentsList } from '@/components/documents/documents-list';
import { DocumentRepository } from '@/dal/repositories/document.repository';

export const DocumentsPage = async ({ params }: { params: Promise<{ [key: string]: string }> }) => {
	const supabase = await createClient();

	const org = (await params).org;

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
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) return redirect('/app/login');

		const res = await supabase
			.from('documents')
			.insert({ org, shared_with: [{ profile: user.id, access: 'owner' }], name: `New Document - ${format(new Date(), 'PPP')}` })
			.select()
			.single();
		return res;
	};

	const documents = docs.filter(document => document.shared_with?.filter((person: any) => person.profile == user.id) || document.owner == user.id);

	return <DocumentsList documents={documents} createDocument={createDocument} currentUserId={user.id} />;
};
