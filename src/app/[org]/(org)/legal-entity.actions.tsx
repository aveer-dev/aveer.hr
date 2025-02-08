'use server';

import { TablesInsert, TablesUpdate } from '@/type/database.types';
import { doesUserHaveAdequatePermissions } from '@/utils/api';
import { createClient } from '@/utils/supabase/server';

export const createLegalEntity = async (payload: TablesInsert<'legal_entities'>) => {
	const canUser = await doesUserHaveAdequatePermissions({ orgId: payload.org });
	if (canUser !== true) return canUser;

	const supabase = await createClient();

	const response = await supabase.from('legal_entities').insert(payload).select('id').single();

	return response;
};

export const updateLegalEntity = async (payload: TablesUpdate<'legal_entities'>) => {
	const canUser = await doesUserHaveAdequatePermissions({ orgId: payload.org as string });
	if (canUser !== true) return canUser;

	const supabase = await createClient();

	const response = await supabase.from('legal_entities').update(payload).match({ org: payload.org, id: payload?.id });

	return response;
};
