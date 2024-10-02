'use server';

import { TablesInsert } from '@/type/database.types';
import { createClient } from '@/utils/supabase/server';

export const updateAnswer = async (payload: TablesInsert<'appraisal_answers'>) => {
	const supabase = createClient();
	const { data, error } = await supabase.from('appraisal_answers').upsert(payload).select();

	if (error) return error.message;

	return data;
};
