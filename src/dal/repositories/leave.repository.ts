import { ILeaveRepository, LeaveWithRelations } from '../interfaces/leave.repository.interface';
import { Tables, TablesInsert, TablesUpdate } from '@/type/database.types';
import { createClient } from '@/utils/supabase/server';

export class LeaveRepository implements ILeaveRepository {
	async getById(org: string, id: number | string): Promise<Tables<'time_off'> | null> {
		const supabase = await createClient();
		const { data, error } = await supabase.from('time_off').select('*').match({ org, id }).single();
		if (error) return null;
		return data;
	}

	async getAllByOrg(org: string, status?: Tables<'time_off'>['status']): Promise<Tables<'time_off'>[]> {
		const supabase = await createClient();
		const request = supabase.from('time_off').select('*').eq('org', org);
		if (status) request.eq('status', status);
		const { data, error } = await request;
		if (error || !data) return [];
		return data;
	}

	async getByProfile(org: string, profile: string, status?: Tables<'time_off'>['status']): Promise<Tables<'time_off'>[]> {
		const supabase = await createClient();
		const request = supabase.from('time_off').select('*').match({ org, profile });
		if (status) request.eq('status', status);
		const { data, error } = await request;
		if (error || !data) return [];
		return data;
	}

	async getByContract(org: string, contract: number, status?: Tables<'time_off'>['status']): Promise<Tables<'time_off'>[]> {
		const supabase = await createClient();
		const request = supabase.from('time_off').select('*').match({ org, contract });
		if (status) request.eq('status', status);
		const { data, error } = await request;
		if (error || !data) return [];
		return data;
	}

	async create(payload: TablesInsert<'time_off'>): Promise<Tables<'time_off'> | null> {
		const supabase = await createClient();
		const { data, error } = await supabase.from('time_off').insert(payload).select().single();
		if (error) return null;
		return data;
	}

	async update(org: string, id: number | string, payload: TablesUpdate<'time_off'>): Promise<Tables<'time_off'>> {
		const supabase = await createClient();
		const { data, error } = await supabase.from('time_off').update(payload).match({ org, id }).select().single();
		if (error) throw error;
		return data;
	}

	async delete(org: string, id: number | string): Promise<boolean> {
		const supabase = await createClient();
		const { error } = await supabase.from('time_off').delete().match({ org, id });
		return !error;
	}

	async getByIdWithRelations(org: string, id: number | string): Promise<LeaveWithRelations | null> {
		const supabase = await createClient();
		const { data, error } = await supabase
			.from('time_off')
			.select(
				`*,
        profile:profiles!time_off_profile_fkey(*),
        contract:contracts!time_off_contract_fkey(*),
        hand_over:contracts!time_off_hand_over_fkey(*)
      `
			)
			.match({ org, id })
			.single();
		if (error) return null;
		return data as unknown as LeaveWithRelations;
	}

	async getAllByOrgWithRelations(org: string, status?: Tables<'time_off'>['status']): Promise<LeaveWithRelations[]> {
		const supabase = await createClient();
		const request = supabase
			.from('time_off')
			.select(
				`*,
        profile:profiles!time_off_profile_fkey(*),
        contract:contracts!time_off_contract_fkey(*),
        hand_over:contracts!time_off_hand_over_fkey(*)
      `
			)
			.eq('org', org);
		if (status) request.eq('status', status);
		const { data, error } = await request;
		if (error || !data) return [];
		return data as unknown as LeaveWithRelations[];
	}

	async getByProfileWithRelations(org: string, profile: string, status?: Tables<'time_off'>['status']): Promise<LeaveWithRelations[]> {
		const supabase = await createClient();
		const request = supabase
			.from('time_off')
			.select(
				`*,
        profile:profiles!time_off_profile_fkey(*),
        contract:contracts!time_off_contract_fkey(*),
        hand_over:contracts!time_off_hand_over_fkey(*)
      `
			)
			.match({ org, profile });
		if (status) request.eq('status', status);
		const { data, error } = await request;
		if (error || !data) return [];
		return data as unknown as LeaveWithRelations[];
	}

	async getByContractWithRelations(org: string, contract: number, status?: Tables<'time_off'>['status']): Promise<LeaveWithRelations[]> {
		const supabase = await createClient();
		const request = supabase
			.from('time_off')
			.select(
				`*,
        profile:profiles!time_off_profile_fkey(*),
        contract:contracts!time_off_contract_fkey(*),
        hand_over:contracts!time_off_hand_over_fkey(*)
      `
			)
			.match({ org, contract });
		if (status) request.eq('status', status);
		const { data, error } = await request;
		if (error || !data) return [];
		return data as unknown as LeaveWithRelations[];
	}
}
