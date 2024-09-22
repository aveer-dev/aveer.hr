'use server';

import { TablesUpdate, TablesInsert } from '@/type/database.types';
import { doesUserHaveAdequatePermissions } from '@/utils/api';
import { createClient } from '@/utils/supabase/server';

export const updateBoarding = async (boarding: TablesUpdate<'boarding_check_lists'>, id: number, org: string) => {
	const hasPermission = await doesUserHaveAdequatePermissions({ orgId: org });
	if (typeof hasPermission == 'string') return hasPermission;

	const supabase = createClient();
	const { error } = await supabase
		.from('boarding_check_lists')
		.update({ ...boarding, org })
		.match({ id, org });
	if (error) return error.message;

	return 'Update';
};

export const createBoarding = async (boarding: TablesInsert<'boarding_check_lists'>, org: string) => {
	const hasPermission = await doesUserHaveAdequatePermissions({ orgId: org });
	if (typeof hasPermission == 'string') return hasPermission;

	const supabase = createClient();
	const { error } = await supabase.from('boarding_check_lists').insert({ ...boarding, org });
	if (error) return error.message;

	return true;
};

export const deleteBoarding = async (org: string, id?: number) => {
	const hasPermission = await doesUserHaveAdequatePermissions({ orgId: org });
	if (typeof hasPermission == 'string') return hasPermission;

	const supabase = createClient();
	const { error } = await supabase.from('boarding_check_lists').delete().match({ id, org });
	if (error) return error.code == '23503' ? 'Checklist is still connected to one or more employees' : error.message;
	return true;
};
