import { ITeamRepository } from '../interfaces/team.repository.interface';
import { Tables, TablesInsert, TablesUpdate } from '@/type/database.types';
import { createClient } from '@/utils/supabase/server';

export class TeamRepository implements ITeamRepository {
	async getById(id: number): Promise<Tables<'teams'> | null> {
		const supabase = await createClient();
		const { data, error } = await supabase.from('teams').select('*').eq('id', id).single();
		if (error) return null;
		return data;
	}

	async getAllByOrg(org: string) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('teams').select('*').eq('org', org);
		return { data, error };
	}

	async getByName(org: string, name: string): Promise<Tables<'teams'>[]> {
		const supabase = await createClient();
		const { data, error } = await supabase.from('teams').select('*').eq('org', org).ilike('name', `%${name}%`);
		if (error || !data) return [];
		return data;
	}

	async create(payload: TablesInsert<'teams'>): Promise<Tables<'teams'> | null> {
		const supabase = await createClient();
		const { data, error } = await supabase.from('teams').insert(payload).select().single();
		if (error) return null;
		return data;
	}

	async update(id: number, payload: TablesUpdate<'teams'>): Promise<Tables<'teams'> | null> {
		const supabase = await createClient();
		const { data, error } = await supabase.from('teams').update(payload).eq('id', id).select().single();
		if (error) return null;
		return data;
	}

	async delete(id: number): Promise<boolean> {
		const supabase = await createClient();
		const { error } = await supabase.from('teams').delete().eq('id', id);
		return !error;
	}
}
