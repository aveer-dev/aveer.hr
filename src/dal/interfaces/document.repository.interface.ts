import { Tables, TablesInsert, TablesUpdate } from '@/type/database.types';
import { PostgrestError } from '@supabase/supabase-js';

export interface IDocumentRepository {
	getById(id: number): Promise<Tables<'documents'> | null>;
	getAllByOrg(org: string): Promise<Tables<'documents'>[]>;
	getByName(org: string, name: string): Promise<Tables<'documents'>[]>;
	create(payload: TablesInsert<'documents'>): Promise<Tables<'documents'> | null>;
	update(id: number, payload: TablesUpdate<'documents'>): Promise<Tables<'documents'> | null>;
	delete(id: number): Promise<{ data: null; error: PostgrestError | null }>;
	getUserAccessibleDocuments(org: string, userId: string): Promise<Tables<'documents'>[]>;
}
