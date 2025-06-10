import { Tables, TablesInsert, TablesUpdate } from '@/type/database.types';
import { PostgrestError } from '@supabase/supabase-js';

export interface IQuestionTemplateRepository {
	getById(id: number): Promise<{ data: Tables<'question_templates'> | null; error: PostgrestError | null }>;
	getAllByOrg(org: string): Promise<{ data: Tables<'question_templates'>[] | null; error: PostgrestError | null }>;
	create(payload: TablesInsert<'question_templates'>): Promise<{ data: Tables<'question_templates'> | null; error: PostgrestError | null }>;
	update(id: number, payload: TablesUpdate<'question_templates'>): Promise<{ data: Tables<'question_templates'> | null; error: PostgrestError | null }>;
	delete(id: number): Promise<{ data: null; error: PostgrestError | null }>;
}
