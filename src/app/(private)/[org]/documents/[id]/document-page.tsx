import { createClient } from '@/utils/supabase/server';
import { Document } from './document';
import { getEmployees } from '@/utils/form-data-init';

export const TemplatePageComponant = async ({ org, docId }: { org: string; docId: string }) => {
	const supabase = await createClient();

	const [
		{ data, error },
		{ data: adminUsers },
		{
			data: { user }
		},
		{ data: employees }
	] = await Promise.all([supabase.from('documents').select().match({ org, id: docId }).single(), supabase.from('profiles_roles').select('*, profile(*)').match({ organisation: org }), supabase.auth.getUser(), getEmployees({ org })]);

	if (docId === 'new') return <Document adminUsers={adminUsers} currentUserId={user?.id || ''} />;

	if (error) return <div className="flex h-48 w-full items-center justify-center text-muted-foreground">{error.message}</div>;

	return <Document doc={data} adminUsers={adminUsers} currentUserId={user?.id || ''} employees={employees} />;
};
