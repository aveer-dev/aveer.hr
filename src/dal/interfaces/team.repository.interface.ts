import { Tables, TablesInsert, TablesUpdate } from '@/type/database.types';
import { PostgrestError } from '@supabase/supabase-js';

export interface ITeamRepository {
	getById(id: number): Promise<Tables<'teams'> | null>;
	getAllByOrg(org: string): Promise<{ data: Tables<'teams'>[] | null; error: PostgrestError | null }>;
	getByName(org: string, name: string): Promise<Tables<'teams'>[]>;
	create(payload: TablesInsert<'teams'>): Promise<Tables<'teams'> | null>;
	update(id: number, payload: TablesUpdate<'teams'>): Promise<Tables<'teams'> | null>;
	delete(id: number): Promise<boolean>;
}
