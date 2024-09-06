'use server';

import { TablesUpdate } from '@/type/database.types';
import { doesUserHaveAdequatePermissions } from '@/utils/api';
import { createClient } from '@/utils/supabase/server';

export const updatePolicy = async (org: string, policyId: number, payload: TablesUpdate<'approval_policies'>) => {
	const supabase = createClient();

	const canUpdate = await doesUserHaveAdequatePermissions({ orgId: org });
	if (canUpdate !== true) return canUpdate;

	const { error } = await supabase.from('approval_policies').update(payload).eq('id', policyId);
	if (error) return error.message;

	return true;
};
