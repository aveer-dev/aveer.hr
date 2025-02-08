import { createClient } from '@/utils/supabase/server';
import { Document } from '../../documents/[id]/document';

export const SharedDocumentPageComponent = async ({ org, docId }: { org: string; docId: string }) => {
	const supabase = await createClient();

	const { data, error } = await supabase.from('documents').select('*, org(subdomain, name)').match({ org, link_id: docId, private: false }).single();

	if (error) return <div className="flex h-48 w-full items-center justify-center text-muted-foreground">{error.message}</div>;

	return <Document doc={data} />;
};
