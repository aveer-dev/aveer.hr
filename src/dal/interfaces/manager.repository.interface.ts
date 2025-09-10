import { Tables, TablesInsert, TablesUpdate } from '@/type/database.types';
import { PostgrestError } from '@supabase/supabase-js';

export interface IManagerRepository {
	getById(id: number): Promise<{ data: Tables<'managers'> | null; error: PostgrestError | null }>;
	getAllByOrg(org: string): Promise<{ data: Tables<'managers'>[] | null; error: PostgrestError | null }>;
	getAllByTeam(team: number): Promise<{ data: Tables<'managers'>[] | null; error: PostgrestError | null }>;
	getByProfile(profile: string): Promise<{ data: Tables<'managers'>[] | null; error: PostgrestError | null }>;
	create(payload: TablesInsert<'managers'>): Promise<{ data: Tables<'managers'> | null; error: PostgrestError | null }>;
	update(id: number, payload: TablesUpdate<'managers'>): Promise<{ data: Tables<'managers'> | null; error: PostgrestError | null }>;
	delete(id: number): Promise<{ data: null; error: PostgrestError | null }>;
	// Team-related
	getTeamsByManager(profile: string): Promise<{ data: Tables<'teams'>[] | null; error: PostgrestError | null }>;
	getByContract({ contractId, team }: { contractId: number; team: number }): Promise<{ data: Tables<'managers'>[] | null; error: PostgrestError | null }>;
}
