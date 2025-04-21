'use server';

import { TablesInsert, TablesUpdate } from '@/type/database.types';
import { createClient } from '@/utils/supabase/server';

export const updateAnswer = async ({ payload, otherPayload }: { payload?: TablesInsert<'appraisal_answers'>; otherPayload?: TablesUpdate<'appraisal_answers'> }) => {
	const supabase = await createClient();
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

export const getTeamAppraisalAnswers = async ({ org, contractIds, appraisalCycleId }: { org: string; contractIds: number[]; appraisalCycleId: number }) => {
	if (!contractIds.length) return [];

	const supabase = await createClient();
	const { data, error } = await supabase.from('appraisal_answers').select('*').eq('org', org).in('contract_id', contractIds).eq('appraisal_cycle_id', appraisalCycleId);
	if (error) throw new Error(error.message);

	return data;
};

export const getAppraisalAnswer = async ({ org, contractId, appraisalCycleId }: { org: string; contractId: number; appraisalCycleId: number }) => {
	const supabase = await createClient();

	const { data, error } = await supabase.from('appraisal_answers').select('*').eq('org', org).match({ contract_id: contractId, appraisal_cycle_id: appraisalCycleId });
	if (error) throw new Error(error.message);

	return data?.[0];
};
