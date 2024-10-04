'use server';

import { TablesInsert, TablesUpdate } from '@/type/database.types';
import { createClient } from '@/utils/supabase/server';

export const updateAnswer = async ({ payload, otherPayload }: { payload?: TablesInsert<'appraisal_answers'>; otherPayload?: TablesUpdate<'appraisal_answers'> }) => {
	const supabase = createClient();
	if (payload) {
		const { data, error } = await supabase.from('appraisal_answers').upsert(payload).select();
		if (error) return error.message;

		return data;
	}

	if (otherPayload) {
		const { data, error } = await supabase.from('appraisal_answers').update(otherPayload).match({ org: otherPayload.org, id: otherPayload.id }).select();
		if (error) return error.message;

		return data;
	}

	return 'Either payload returned for appraisal answer';
};
