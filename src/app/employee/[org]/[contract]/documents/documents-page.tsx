import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';
import { DocumentsList } from '@/app/(private)/[org]/documents/documents-list';

export const DocumentsPage = async ({ org, contract }: { org: string; contract: number }) => {
	const supabase = await createClient();

	const [
		{ data, error },
		{
			data: { user }
		}
	] = await Promise.all([supabase.from('documents').select('*').match({ org }).order('updated_at', { ascending: false }), supabase.auth.getUser()]);

	if (!user) return redirect('/login');

	if (error) return <div className="flex min-h-48 items-center justify-center rounded-md bg-accent italic">{error.message}</div>;

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

	const documents = data.filter(document => document.shared_with?.filter((person: any) => person.contract == contract) || document.owner == user.id);

	return <DocumentsList documents={documents} createDocument={createDocument} />;
};
