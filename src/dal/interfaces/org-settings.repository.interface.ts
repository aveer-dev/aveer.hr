import { Tables, TablesInsert, TablesUpdate } from '@/type/database.types';
import { PostgrestError } from '@supabase/supabase-js';

export interface IOrgSettingsRepository {
	getByOrg(org: string): Promise<{ data: Tables<'org_settings'> | null; error: PostgrestError | null }>;
	create(payload: TablesInsert<'org_settings'>): Promise<{ data: Tables<'org_settings'> | null; error: PostgrestError | null }>;
	update(id: number, payload: TablesUpdate<'org_settings'>): Promise<{ data: Tables<'org_settings'> | null; error: PostgrestError | null }>;
	delete(id: number): Promise<{ data: null; error: PostgrestError | null }>;
}
