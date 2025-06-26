'use server';

import { createClient } from '@/utils/supabase/server';
import { Tables, Database } from '@/type/database.types';
import { TablesInsert, TablesUpdate } from '@/type/database.types';
import { doesUserHaveAdequatePermissions } from '@/utils/api';
import { GOAL_SCORE, Objective } from '../appraisal/appraisal.types';

interface Answer {
	question_id: number;
	answer: any;
	[key: string]: any;
}

export async function createQuestionTemplate(data: TablesInsert<'question_templates'>) {
	const supabase = await createClient();
	const { data: template, error } = await supabase.from('question_templates').insert(data).select().single();

	if (error) throw error;
	return template;
}

export async function updateQuestionTemplate(id: number, data: TablesUpdate<'question_templates'>) {
	const supabase = await createClient();
	const { data: template, error } = await supabase.from('question_templates').update(data).eq('id', id).select().single();

	if (error) throw error;
	return template;
}

export async function createTemplateQuestions(templateId: number, questions: TablesInsert<'template_questions'>[]) {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from('template_questions')
		.insert(
			questions.map(q => ({
				...q,
				template_id: templateId
			}))
		)
		.select();

	if (error) throw error;
	return data;
}

export async function updateTemplateQuestions(templateId: number, questions: TablesInsert<'template_questions'>[], existingQuestions: Tables<'template_questions'>[]) {
	const supabase = await createClient();

	const existingIds = new Set(existingQuestions.map(q => q?.id));
	const updatedIds = new Set(questions.filter(q => q.id).map(q => q?.id));

	// Find questions to delete (exist in DB but not in updated questions)
	const idsToDelete = Array.from(existingIds).filter(id => !updatedIds.has(id));

	// Delete questions that are no longer present
	if (idsToDelete.length > 0) {
		await supabase.from('template_questions').delete().in('id', idsToDelete);
	}

	// Split questions into updates and new inserts
	const updates = questions.filter(q => q.id);
	const newQuestions = questions.filter(q => !q.id).map(({ id, ...question }) => question);

	// Update existing questions
	if (updates.length > 0) {
		const { error: updateError } = await supabase.from('template_questions').upsert(
			updates.map(q => ({
				...q,
				template_id: templateId
			}))
		);

		if (updateError) throw updateError;
	}

	// Insert new questions
	if (newQuestions.length > 0) {
		const { data: insertedQuestions, error: insertError } = await supabase
			.from('template_questions')
			.insert(
				newQuestions.map(q => ({
					...q,
					template_id: templateId
				}))
			)
			.select();

		if (insertError) throw insertError;
		return [...updates, ...(insertedQuestions || [])];
	}

	return updates;
}

export async function getQuestionTemplate(id: number) {
	const supabase = await createClient();
	const { data: template, error: templateError } = await supabase.from('question_templates').select().eq('id', id).single();

	if (templateError) throw templateError;

	const { data: questions, error: questionsError } = await supabase.from('template_questions').select().eq('template_id', id).order('order_index');

	if (questionsError) throw questionsError;

	return {
		...template,
		questions
	};
}

export async function getTemplateQuestions({ org, templateId }: { org: string; templateId: number }) {
	const supabase = await createClient();

	const { data, error } = await supabase.from('template_questions').select().match({ org, template_id: templateId }).order('order_index');

	if (error) throw error;
	return data;
}

export async function getQuestionTemplates({ org }: { org: string }) {
	const supabase = await createClient();
	const { data, error } = await supabase.from('question_templates').select().match({ org }).order('created_at', { ascending: false });

	if (error) throw error;
	return data;
}

export const deleteQuestion = async (query: { id: number; org: string }) => {
	const canUser = await doesUserHaveAdequatePermissions({ orgId: query.org });
	if (canUser !== true) return canUser;

	const supabase = await createClient();
	const { error } = await supabase.from('template_questions').delete().match(query);

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

export const createAppraisalCycle = async (payload: TablesInsert<'appraisal_cycles'>) => {
	const canUser = await doesUserHaveAdequatePermissions({ orgId: payload.org });
	if (canUser !== true) return canUser;

	const supabase = await createClient();
	const { error, data } = await supabase.from('appraisal_cycles').insert(payload).select();

	if (error) return error.message;

	return data;
};

export const updateAppraisalCycle = async (payload: TablesUpdate<'appraisal_cycles'>, id: number, org: string) => {
	const canUser = await doesUserHaveAdequatePermissions({ orgId: org });
	if (canUser !== true) return canUser;

	const supabase = await createClient();
	const { data, error } = await supabase.from('appraisal_cycles').update(payload).match({ org, id }).select();

	if (error) return error.message;

	return data;
};

export const deleteAppraisalCycle = async (org: string, cycleId: number) => {
	const canUser = await doesUserHaveAdequatePermissions({ orgId: org });
	if (canUser !== true) return canUser;

	const supabase = await createClient();
	const { error } = await supabase.from('appraisal_cycles').delete().match({ id: cycleId, org });

	if (error) return error.message;
	return true;
};

export async function deleteQuestionTemplate({ id, org }: { id: string; org: string }) {
	const supabase = await createClient();

	// First delete all associated questions
	const { error: questionsError } = await supabase.from('template_questions').delete().match({ template_id: id, org }).select();

	if (questionsError) throw questionsError;

	// // Then delete the template
	const { error: templateError } = await supabase.from('question_templates').delete().match({ id, org }).select();

	if (templateError) throw templateError;
}

export const autoSaveAnswer = async ({ answerId, questionId, value, org, appraisalCycleId, contractId, answerType }: { answerId?: number; questionId: number; value: any; org: string; appraisalCycleId: number; contractId: number; answerType: 'self' | 'manager' | 'summary' }) => {
	const supabase = await createClient();

	if (answerId) {
		// Update existing answer
		const { data: existingAnswer } = await supabase.from('appraisal_answers').select('answers, manager_answers').eq('id', answerId).single();

		if (existingAnswer) {
			const existingAnswers = existingAnswer[answerType == 'manager' ? 'manager_answers' : 'answers'] as unknown as Answer[];
			const answerIndex = existingAnswers.findIndex(a => a.question_id === questionId);

			let answers: Answer[];
			// Question not found in existing answers, append new answer
			if (answerIndex === -1) answers = [...existingAnswers, { question_id: questionId, answer: value }];
			// Update existing answer
			else answers = existingAnswers.map(a => (a.question_id === questionId ? { ...a, answer: value } : a));

			const { data, error } = await supabase
				.from('appraisal_answers')
				.update(answerType == 'manager' ? { manager_answers: answers } : { answers })
				.eq('id', answerId)
				.select();
			if (error) throw error;
			return data;
		}
	} else {
		// Create new answer
		const { data: existingAnswers } = await supabase.from('appraisal_answers').select('*').eq('appraisal_cycle_id', appraisalCycleId).eq('contract_id', contractId).eq('org', org).single();

		if (existingAnswers) {
			// Update existing record with new answer
			const answers = [...(existingAnswers[answerType == 'manager' ? 'manager_answers' : 'answers'] as unknown as Answer[]), { question_id: questionId, answer: value }];
			const { data, error } = await supabase
				.from('appraisal_answers')
				.update(answerType == 'manager' ? { manager_answers: answers } : { answers })
				.eq('id', existingAnswers.id)
				.select();
			if (error) throw error;
			return data;
		} else {
			// Create new record
			const payload: TablesInsert<'appraisal_answers'> = {
				appraisal_cycle_id: appraisalCycleId,
				contract_id: contractId,
				org,
				status: 'draft'
			};
			answerType == 'manager' ? (payload.manager_answers = [{ question_id: questionId, answer: value }]) : (payload.answers = [{ question_id: questionId, answer: value }]);

			const { data, error } = await supabase.from('appraisal_answers').insert(payload).select();
			if (error) throw error;
			return data;
		}
	}
};

export const submitAppraisal = async ({ answerId, employee_submission_date, manager_submission_date, status }: { answerId?: number; employee_submission_date?: string; manager_submission_date?: string; status?: Database['public']['Enums']['appraisal_status'] }) => {
	const supabase = await createClient();

	if (!answerId) throw 'Answer id required';

	const updateData: TablesUpdate<'appraisal_answers'> = {};
	if (status) updateData.status = status;
	if (employee_submission_date) updateData.employee_submission_date = employee_submission_date;
	if (manager_submission_date) updateData.manager_submission_date = manager_submission_date;

	const { error } = await supabase.from('appraisal_answers').update(updateData).eq('id', answerId);

	if (error) throw error;
};

export const autoSaveObjectives = async ({
	answerId,
	objectives,
	org,
	appraisalCycleId,
	contractId,
	managerObjectivesScore,
	objectivesScore
}: {
	managerObjectivesScore?: GOAL_SCORE[];
	objectivesScore?: GOAL_SCORE[];
	answerId?: number;
	objectives?: Objective[];
	org: string;
	appraisalCycleId: number;
	contractId: number;
}) => {
	const supabase = await createClient();

	const payload: TablesUpdate<'appraisal_answers'> = {};
	if (objectives) payload.objectives = objectives as any;
	if (objectivesScore) payload.employee_goal_score = objectivesScore as any;
	if (managerObjectivesScore) payload.manager_goal_score = managerObjectivesScore as any;

	if (answerId) {
		// Update existing answer
		const { error, data } = await supabase.from('appraisal_answers').update(payload).eq('id', answerId).select();

		if (error) throw error;
		return data;
	}

	// Create new answer
	const { data: existingAnswers } = await supabase.from('appraisal_answers').select('*').eq('appraisal_cycle_id', appraisalCycleId).eq('contract_id', contractId).eq('org', org).single();

	if (existingAnswers) {
		// Update existing record with objectives
		const { error, data } = await supabase.from('appraisal_answers').update(payload).eq('id', existingAnswers.id).select();

		if (error) throw error;
		return data;
	}

	// Create new record
	const insertPayload: TablesInsert<'appraisal_answers'> = {
		...payload,
		appraisal_cycle_id: appraisalCycleId,
		contract_id: contractId,
		org,
		status: 'draft'
	};

	const { error, data } = await supabase.from('appraisal_answers').insert(insertPayload).select();
	if (error) throw error;
	return data;
};
