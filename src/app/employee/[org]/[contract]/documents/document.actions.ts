'use server';

import { TablesInsert, TablesUpdate } from '@/type/database.types';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export const updateDocument = async (payload: TablesUpdate<'documents'>) => {
	const supabase = await createClient();
	const response = await supabase
		.from('documents')
		.update({ ...payload, updated_at: new Date().toISOString() })
		.match({ org: payload.org, id: payload.id });
	return response;
};

export const deleteDocument = async ({ org, id }: { org: string; id: number }) => {
	const supabase = await createClient();
	const response = await supabase.from('documents').delete().match({ org, id });
	return response;
};

export const createDocument = async (document: TablesInsert<'documents'>) => {
	const supabase = await createClient();
	const {
		data: { user }
	} = await supabase.auth.getUser();
	if (!user) return redirect('/app/login');

	const response = await supabase.from('documents').insert(document).select().single();

	return response;
};
