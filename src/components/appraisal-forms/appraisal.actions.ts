'use server';

import { Tables } from '@/type/database.types';
import { createClient } from '@/utils/supabase/server';
import { TablesInsert, TablesUpdate } from '@/type/database.types';
import { doesUserHaveAdequatePermissions } from '@/utils/api';

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

	const { data, error } = await supabase.from('template_questions').select().match({ org, template_id: templateId });

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

export async function deleteQuestionTemplate(id: number, org: string) {
	const supabase = await createClient();

	// First delete all associated questions
	const { error: questionsError } = await supabase.from('template_questions').delete().match({ template_id: id, org }).select();

	if (questionsError) throw questionsError;

	// // Then delete the template
	const { error: templateError } = await supabase.from('question_templates').delete().match({ id, org }).select();

	if (templateError) throw templateError;
}
