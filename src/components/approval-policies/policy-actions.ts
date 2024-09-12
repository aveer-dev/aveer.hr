'use server';

import { TablesInsert, TablesUpdate } from '@/type/database.types';
import { doesUserHaveAdequatePermissions } from '@/utils/api';
import { createClient } from '@/utils/supabase/server';

export const updatePolicy = async (org: string, policyId: number, payload: TablesUpdate<'approval_policies'>) => {
	const supabase = createClient();

	const canUpdate = await doesUserHaveAdequatePermissions({ orgId: org });
	if (canUpdate !== true) return canUpdate;

	const { error, data } = await supabase.from('approval_policies').update(payload).eq('id', policyId).select().single();
	if (error) return error.message;

	return data;
};

export const createPolicy = async (org: string, payload: TablesInsert<'approval_policies'>) => {
	const supabase = createClient();

	const canUpdate = await doesUserHaveAdequatePermissions({ orgId: org });
	if (canUpdate !== true) return canUpdate;

	const { error } = await supabase.from('approval_policies').insert(payload);
	if (error) return error.message;

	return true;
};

export const deletePolicy = async (org: string, id: number) => {
	const supabase = createClient();

	const canUpdate = await doesUserHaveAdequatePermissions({ orgId: org });
	if (canUpdate !== true) return canUpdate;

	const { error } = await supabase.from('approval_policies').delete().match({ id, org });
	if (error) return error.message;

	return true;
};
