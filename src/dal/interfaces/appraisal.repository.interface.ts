import { Tables, TablesInsert, TablesUpdate } from '@/type/database.types';
import { PostgrestError } from '@supabase/supabase-js';

export interface IAppraisalRepository {
	// Appraisal Cycles
	getCycleById(id: number): Promise<{ data: Tables<'appraisal_cycles'> | null; error: PostgrestError | null }>;
	getAllCycles(org: string): Promise<{ data: Tables<'appraisal_cycles'>[] | null; error: PostgrestError | null }>;
	createCycle(payload: TablesInsert<'appraisal_cycles'>): Promise<{ data: Tables<'appraisal_cycles'> | null; error: PostgrestError | null }>;
	updateCycle(id: number, payload: TablesUpdate<'appraisal_cycles'>): Promise<{ data: Tables<'appraisal_cycles'> | null; error: PostgrestError | null }>;
	deleteCycle(id: number): Promise<{ data: null; error: PostgrestError | null }>;

	// Appraisal Answers
	getAnswerById(id: number): Promise<{ data: Tables<'appraisal_answers'> | null; error: PostgrestError | null }>;
	getAllAnswersForCycle(cycleId: number): Promise<{ data: Tables<'appraisal_answers'>[] | null; error: PostgrestError | null }>;
	getAllOrgAnswers(org: string): Promise<{ data: Tables<'appraisal_answers'>[] | null; error: PostgrestError | null }>;
	createAnswer(payload: TablesInsert<'appraisal_answers'>): Promise<{ data: Tables<'appraisal_answers'> | null; error: PostgrestError | null }>;
	updateAnswer(id: number, payload: TablesUpdate<'appraisal_answers'>): Promise<{ data: Tables<'appraisal_answers'> | null; error: PostgrestError | null }>;
	deleteAnswer(id: number): Promise<{ data: null; error: PostgrestError | null }>;

	// Appraisal Questions
	getQuestionsById(id: number): Promise<{ data: Tables<'template_questions'> | null; error: PostgrestError | null }>;
	getAllQuestions(org: string): Promise<{ data: Tables<'template_questions'>[] | null; error: PostgrestError | null }>;
	createQuestions(payload: TablesInsert<'template_questions'>): Promise<{ data: Tables<'template_questions'> | null; error: PostgrestError | null }>;
	updateQuestions(id: number, payload: TablesUpdate<'template_questions'>): Promise<{ data: Tables<'template_questions'> | null; error: PostgrestError | null }>;
	deleteQuestions(id: number): Promise<{ data: null; error: PostgrestError | null }>;
	getQuestionsByTemplate(templateId: number): Promise<{ data: Tables<'template_questions'>[] | null; error: PostgrestError | null }>;

	// Appraisal Settings
	getSettingsByOrg(org: string): Promise<{ data: Tables<'appraisal_settings'> | null; error: PostgrestError | null }>;
	createSettings(payload: TablesInsert<'appraisal_settings'>): Promise<{ data: Tables<'appraisal_settings'> | null; error: PostgrestError | null }>;
	updateSettings(id: number, payload: TablesUpdate<'appraisal_settings'>): Promise<{ data: Tables<'appraisal_settings'> | null; error: PostgrestError | null }>;
	deleteSettings(id: number): Promise<{ data: null; error: PostgrestError | null }>;
}
