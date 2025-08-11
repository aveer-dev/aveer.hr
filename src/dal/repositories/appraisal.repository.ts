import { IAppraisalRepository } from '../interfaces/appraisal.repository.interface';
import { TablesInsert, TablesUpdate } from '@/type/database.types';
import { createClient } from '@/utils/supabase/server';

export class AppraisalRepository implements IAppraisalRepository {
	// Appraisal Cycles
	async getCycleById(id: number) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('appraisal_cycles').select('*').eq('id', id).single();
		return { data, error };
	}
	async getAllCycles(org: string) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('appraisal_cycles').select('*').eq('org', org);
		return { data, error };
	}
	async createCycle(payload: TablesInsert<'appraisal_cycles'>) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('appraisal_cycles').insert(payload).select().single();
		return { data, error };
	}
	async updateCycle(id: number, payload: TablesUpdate<'appraisal_cycles'>) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('appraisal_cycles').update(payload).eq('id', id).select().single();
		return { data, error };
	}
	async deleteCycle(id: number) {
		const supabase = await createClient();
		const { error } = await supabase.from('appraisal_cycles').delete().eq('id', id);
		return { data: null, error };
	}

	// Appraisal Answers
	async getAnswerById(id: number) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('appraisal_answers').select('*').eq('id', id).single();
		return { data, error };
	}
	async getAllAnswersForCycle(cycleId: number) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('appraisal_answers').select('*').eq('appraisal_cycle_id', cycleId);
		return { data, error };
	}
	async getAllOrgAnswers(org: string) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('appraisal_answers').select('*').eq('org', org);
		return { data, error };
	}
	async createAnswer(payload: TablesInsert<'appraisal_answers'>) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('appraisal_answers').insert(payload).select().single();
		return { data, error };
	}
	async updateAnswer(id: number, payload: TablesUpdate<'appraisal_answers'>) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('appraisal_answers').update(payload).eq('id', id).select().single();
		return { data, error };
	}
	async deleteAnswer(id: number) {
		const supabase = await createClient();
		const { error } = await supabase.from('appraisal_answers').delete().eq('id', id);
		return { data: null, error };
	}

	// Appraisal Questions
	async getQuestionsById(id: number) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('template_questions').select('*').eq('id', id).single();
		return { data, error };
	}
	async getAllQuestions(org: string) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('template_questions').select('*').eq('org', org);
		return { data, error };
	}
	async createQuestions(payload: TablesInsert<'template_questions'>) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('template_questions').insert(payload).select().single();
		return { data, error };
	}
	async updateQuestions(id: number, payload: TablesUpdate<'template_questions'>) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('template_questions').update(payload).eq('id', id).select().single();
		return { data, error };
	}
	async deleteQuestions(id: number) {
		const supabase = await createClient();
		const { error } = await supabase.from('template_questions').delete().eq('id', id);
		return { data: null, error };
	}
	async getQuestionsByTemplate(templateId: number) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('template_questions').select('*').eq('template_id', templateId).order('order_index');
		return { data, error };
	}

	// Appraisal Settings
	async getSettingsByOrg(org: string) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('appraisal_settings').select('*').eq('org', org).single();
		return { data, error };
	}
	async createSettings(payload: TablesInsert<'appraisal_settings'>) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('appraisal_settings').insert(payload).select().single();
		return { data, error };
	}
	async updateSettings(id: number, payload: TablesUpdate<'appraisal_settings'>) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('appraisal_settings').update(payload).eq('id', id).select().single();
		return { data, error };
	}
	async deleteSettings(id: number) {
		const supabase = await createClient();
		const { error } = await supabase.from('appraisal_settings').delete().eq('id', id);
		return { data: null, error };
	}
}
