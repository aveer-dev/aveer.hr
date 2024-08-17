'use server';

import { TablesUpdate } from '@/type/database.types';
import { createClient } from '@/utils/supabase/server';

export const signContract = async (updateData: TablesUpdate<'org_documents'>, agreementId: number) => {
	const supabase = createClient();

	const res = await supabase.from('org_documents').update(updateData).eq('id', agreementId).select().single();
	return res;
};
