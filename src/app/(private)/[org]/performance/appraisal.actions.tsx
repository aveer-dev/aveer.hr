'use server';

import { TablesInsert } from '@/type/database.types';
import { doesUserHaveAdequatePermissions } from '@/utils/api';
import { createClient } from '@/utils/supabase/server';

export const deleteQuestion = async (query: { id: number; org: string }) => {
	const canUser = await doesUserHaveAdequatePermissions({ orgId: query.org });
	if (canUser !== true) return canUser;

	const supabase = createClient();
	const { error } = await supabase.from('appraisal_questions').delete().match(query);

	if (error) return error.message;
	return true;
};

export const createQuestions = async (payload: TablesInsert<'appraisal_questions'>[]) => {
	const canUser = await doesUserHaveAdequatePermissions({ orgId: payload[0].org });
	if (canUser !== true) return canUser;

	const payloadWithId = payload.filter(item => !!item.id);
	const payloadWithoutId = payload.filter(item => !item.id);

	const supabase = createClient();
	const [updateRes, inserRes] = await Promise.all([await supabase.from('appraisal_questions').upsert(payloadWithId).select(), await supabase.from('appraisal_questions').insert(payloadWithoutId).select()]);

	if (updateRes.error || inserRes.error) {
		if (inserRes.error) return inserRes.error.message;
		if (updateRes.error) return updateRes.error.message;
	}

	return [...updateRes.data, ...inserRes.data];
};
