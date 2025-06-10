import { IQuestionTemplateRepository } from '../interfaces/question-template.repository.interface';
import { TablesInsert, TablesUpdate } from '@/type/database.types';
import { createClient } from '@/utils/supabase/server';

export class QuestionTemplateRepository implements IQuestionTemplateRepository {
	async getById(id: number) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('question_templates').select('*').eq('id', id).single();
		return { data, error };
	}
	async getAllByOrg(org: string) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('question_templates').select('*').eq('org', org);
		return { data, error };
	}
	async create(payload: TablesInsert<'question_templates'>) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('question_templates').insert(payload).select().single();
		return { data, error };
	}
	async update(id: number, payload: TablesUpdate<'question_templates'>) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('question_templates').update(payload).eq('id', id).select().single();
		return { data, error };
	}
	async delete(id: number) {
		const supabase = await createClient();
		const { error } = await supabase.from('question_templates').delete().eq('id', id);
		return { data: null, error };
	}
}
