import { createClient } from '@/utils/supabase/server';
import { getEmployees } from '@/utils/form-data-init';
import { Document } from '@/components/documents/document';

export const TemplatePageComponant = async ({ org, docId }: { org: string; docId: string }) => {
	const supabase = await createClient();

	const [
		{ data, error },
		{
			data: { user }
		},
		{ data: employees }
	] = await Promise.all([supabase.from('documents').select('*, org(subdomain, name)').match({ org, id: docId }).single(), supabase.auth.getUser(), getEmployees({ org })]);

	if (error) return <div className="flex h-48 w-full items-center justify-center text-muted-foreground">{error.message}</div>;

	return <Document parentContainerId="documentEmployee" doc={data} currentUserId={user?.id || ''} employees={employees} />;
};
