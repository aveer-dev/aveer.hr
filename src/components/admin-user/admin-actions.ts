'use server';

import { TablesInsert } from '@/type/database.types';
import { doesUserHaveAdequatePermissions } from '@/utils/api';
import { createClient } from '@/utils/supabase/server';

export const addAdminPerson = async (payload: TablesInsert<'profiles_roles'>) => {
	const supabase = await createClient();

	const canUpdate = await doesUserHaveAdequatePermissions({ orgId: String(payload.organisation) });
	if (canUpdate !== true) return canUpdate;

	const { error, data } = await supabase.from('profiles_roles').insert(payload).select().single();
	if (error) return error.message;

	return data;
};

export const removeAdminPerson = async (id: number, org: string) => {
	const supabase = await createClient();

	const canUpdate = await doesUserHaveAdequatePermissions({ orgId: org });
	if (canUpdate !== true) return canUpdate;

	const { error, data } = await supabase.from('profiles_roles').delete().eq('id', id);
	if (error) return error.message;

	return data;
};
