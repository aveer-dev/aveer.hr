'use server';

import { TablesInsert } from '@/type/database.types';
import { createClient } from '@/utils/supabase/server';

export const updateQuestions = async (payload: TablesInsert<'appraisal_questions'>[]) => {
	const supabase = createClient();
	const { data, error } = await supabase.from('appraisal_questions').insert(payload).select();

	if (error) return error.message;

	return data;
};
