'use server';

import { TablesUpdate, TablesInsert } from '@/type/database.types';
import { doesUserHaveAdequatePermissions } from '@/utils/api';
import { createClient } from '@/utils/supabase/server';

export const updateBand = async (band: TablesUpdate<'employee_levels'>, org: string) => {
	const hasPermission = await doesUserHaveAdequatePermissions({ orgId: org });
	if (typeof hasPermission == 'string') return hasPermission;

	if (!band.id) return 'Band ID not found. Unable to update band';

	const supabase = createClient();
	const { error } = await supabase
		.from('employee_levels')
		.update({ ...band, org })
		.eq('id', band.id);
	if (error) return error.message;
	return 'Update';
};

export const createBand = async (band: TablesInsert<'employee_levels'>, org: string) => {
	const hasPermission = await doesUserHaveAdequatePermissions({ orgId: org });
	if (typeof hasPermission == 'string') return hasPermission;

	const supabase = createClient();
	const { error } = await supabase.from('employee_levels').insert({ ...band, org });
	if (error) return error.message;
	return true;
};

export const deleteBand = async (org: string, bandId?: number) => {
	const hasPermission = await doesUserHaveAdequatePermissions({ orgId: org });
	if (typeof hasPermission == 'string') return hasPermission;

	if (!bandId) return 'Band ID not found. Unable to delete band';

	const supabase = createClient();
	const { error } = await supabase.from('employee_levels').delete().eq('id', bandId);
	if (error) return error.code == '23503' ? 'Level is still connected to one or more employees' : error.message;
	return true;
};
