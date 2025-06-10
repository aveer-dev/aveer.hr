import { IManagerRepository } from '../interfaces/manager.repository.interface';
import { TablesInsert, TablesUpdate } from '@/type/database.types';
import { createClient } from '@/utils/supabase/server';

export class ManagerRepository implements IManagerRepository {
	async getById(id: number) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('managers').select('*').eq('id', id).single();
		return { data, error };
	}
	async getAllByOrg(org: string) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('managers').select('*').eq('org', org);
		return { data, error };
	}
	async getAllByTeam(team: number) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('managers').select('*').eq('team', team);
		return { data, error };
	}
	async getByProfile(profile: string) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('managers').select('*').eq('profile', profile);
		return { data, error };
	}
	async create(payload: TablesInsert<'managers'>) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('managers').insert(payload).select().single();
		return { data, error };
	}
	async update(id: number, payload: TablesUpdate<'managers'>) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('managers').update(payload).eq('id', id).select().single();
		return { data, error };
	}
	async delete(id: number) {
		const supabase = await createClient();
		const { error } = await supabase.from('managers').delete().eq('id', id);
		return { data: null, error };
	}
	// Team-related
	async getTeamsByManager(profile: string) {
		const supabase = await createClient();
		// Find all teams where this profile is a manager
		const { data: managerRows, error } = await supabase.from('managers').select('team').eq('profile', profile);
		if (error || !managerRows) return { data: null, error };
		const teamIds = managerRows.map((row: any) => row.team).filter(Boolean);
		if (teamIds.length === 0) return { data: [], error: null };
		const { data, error: teamError } = await supabase.from('teams').select('*').in('id', teamIds);
		return { data, error: teamError };
	}
	async getByContract(contractId: number) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('managers').select('*').eq('person', contractId).maybeSingle();
		return { data, error };
	}
}
