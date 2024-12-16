'use server';

import { TablesInsert, TablesUpdate } from '@/type/database.types';
import { doesUserHaveAdequatePermissions } from '@/utils/api';
import { createClient } from '@/utils/supabase/server';

export const deleteQuestion = async (query: { id: number; org: string }) => {
	const canUser = await doesUserHaveAdequatePermissions({ orgId: query.org });
	if (canUser !== true) return canUser;

	const supabase = await createClient();
	const { error } = await supabase.from('appraisal_questions').delete().match(query);

	if (error) return error.message;
	return true;
};

export const createQuestions = async (payload: TablesInsert<'appraisal_questions'>) => {
	const canUser = await doesUserHaveAdequatePermissions({ orgId: payload.org });
	if (canUser !== true) return canUser;

	const supabase = await createClient();
	const { error, data } = await supabase.from('appraisal_questions').upsert(payload).select();

	if (error) return error.message;

	return data[0];
};

export const createAppraisalSettings = async (payload: TablesInsert<'appraisal_settings'>) => {
	const canUser = await doesUserHaveAdequatePermissions({ orgId: payload.org });
	if (canUser !== true) return canUser;

	const supabase = await createClient();
	const { error, data } = await supabase.from('appraisal_settings').insert(payload).select();

	if (error) return error.message;

	return data;
};

export const updateAppraisalSettings = async (payload: TablesUpdate<'appraisal_settings'>, id: number, org: string) => {
	const canUser = await doesUserHaveAdequatePermissions({ orgId: org });
	if (canUser !== true) return canUser;

	const supabase = await createClient();
	const { data, error } = await supabase.from('appraisal_settings').update(payload).match({ org, id }).select();

	if (error) return error.message;

	return data;
};
