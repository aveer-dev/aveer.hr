'use server';

import { TablesInsert, TablesUpdate } from '@/type/database.types';
import { createClient } from '@/utils/supabase/server';

interface SubmitAppraisalPayload {
	answerId?: number;
	answers?: { question_id: number; answer: any }[];
	manager_answers?: { question_id: number; answer: any }[];
	employee_goal_score?: { question_id: number; answer: any }[];
	manager_goal_score?: { question_id: number; answer: any }[];
	employee_submission_date?: string;
	manager_submission_date?: string;
	status?: 'draft' | 'submitted' | 'manager_reviewed';
	objectives?: any[];
}

export const submitAppraisal = async (payload: SubmitAppraisalPayload) => {
	const supabase = await createClient();

	if (!payload.answerId) {
		throw new Error('Answer ID is required');
	}

	const updateData: Record<string, any> = {};
	if (payload.status) updateData.status = payload.status;
	if (payload.employee_submission_date) updateData.employee_submission_date = payload.employee_submission_date;
	if (payload.manager_submission_date) updateData.manager_submission_date = payload.manager_submission_date;

	const { data, error } = await supabase.from('appraisal_answers').update(updateData).eq('id', payload.answerId).select();

	if (error) throw new Error(error.message);
	return data;
};

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

export const uploadGoalFile = async ({ file, org, goalId, appraisalId }: { file: File; org: string; goalId: string; appraisalId: number }) => {
	const supabase = await createClient();
	const fileExt = file.name.split('.').pop();
	const fileName = `${org}/${appraisalId}/${goalId}/${crypto.randomUUID()}.${fileExt}`;

	const { data, error } = await supabase.storage.from('appraisal-files').upload(fileName, file, { upsert: true });

	if (error) throw new Error(error.message);

	return data.path;
};

export const deleteGoalFile = async ({ filePath }: { filePath: string }) => {
	const supabase = await createClient();
	const { error } = await supabase.storage.from('appraisal-files').remove([filePath]);
	if (error) throw new Error(error.message);
};

export const getGoalFileUrl = async ({ filePath }: { filePath: string }) => {
	const supabase = await createClient();
	const { data, error } = await supabase.storage.from('appraisal-files').createSignedUrl(filePath, 60);
	if (error) throw new Error(error.message);

	return data.signedUrl;
};
