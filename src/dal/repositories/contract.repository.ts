import { IContractRepository, ContractWithRelations, ContractWithProfile, ContractWithTeam, ContractWithProfileAndTeam } from '../interfaces/contract.repository.interface';
import { Tables, TablesInsert, TablesUpdate } from '@/type/database.types';
import { createClient } from '@/utils/supabase/server';

export class ContractRepository implements IContractRepository {
	async getById(org: string, id: number | string) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('contracts').select('*').match({ org, id }).single();
		return { data, error };
	}

	async getByProfile(profileId: string): Promise<Tables<'contracts'>[]> {
		const supabase = await createClient();
		const { data: profileData, error: profileError } = await supabase.from('contracts').select('*').eq('profile', profileId);
		if (profileError || !profileData) return [];
		return profileData;
	}

	async getAllByOrg(org: string, status?: Tables<'contracts'>['status']) {
		const supabase = await createClient();

		const request = supabase.from('contracts').select('*').eq('org', org);
		if (status) request.eq('status', status);

		const { data, error } = await request;
		return { data, error };
	}

	async create(payload: TablesInsert<'contracts'>): Promise<Tables<'contracts'> | null> {
		const supabase = await createClient();
		const { data: createData, error: createError } = await supabase.from('contracts').insert(payload).select().single();
		if (createError) return null;
		return createData;
	}

	async update(org: string, id: number | string, payload: TablesUpdate<'contracts'>): Promise<Tables<'contracts'> | null> {
		const supabase = await createClient();
		const { data: updateData, error: updateError } = await supabase.from('contracts').update(payload).match({ org, id }).select().single();
		if (updateError) return null;
		return updateData;
	}

	async delete(org: string, id: number | string): Promise<boolean> {
		const supabase = await createClient();
		const { error: deleteError } = await supabase.from('contracts').delete().match({ org, id });
		return !deleteError;
	}

	async getByIdWithRelations(org: string, id: number | string) {
		const supabase = await createClient();
		const { data: relData, error: relError } = await supabase
			.from('contracts')
			.select(
				`*,
				org:organisations!contracts_org_fkey(id, name, subdomain),
				level:employee_levels!contracts_level_fkey(level, role),
				entity:legal_entities!contracts_entity_fkey(incorporation_country:countries!legal_entities_incorporation_country_fkey(currency_code, name), address_state, street_address, address_code),
				profile:profiles!contracts_profile_fkey(*, nationality:countries!profiles_nationality_fkey(*)),
				signed_by:profiles!contracts_signed_by_fkey(first_name, last_name, email),
				terminated_by:profiles!contracts_terminated_by_fkey(first_name, last_name, email),
				team:teams!contracts_team_fkey(id, name),
				direct_report(job_title, id, profile(first_name, last_name))
			`
			)
			.match({ org, id })
			.single();
		return { data: relData as unknown as ContractWithRelations, error: relError };
	}

	async getAllByOrgWithRelations(org: string, status?: Tables<'contracts'>['status']) {
		const supabase = await createClient();
		const request = supabase
			.from('contracts')
			.select(
				`*,
				org:organisations!contracts_org_fkey(id, name, subdomain),
				level:employee_levels!contracts_level_fkey(level, role),
				entity:legal_entities!contracts_entity_fkey(incorporation_country:countries!legal_entities_incorporation_country_fkey(currency_code, name), address_state, street_address, address_code),
				profile:profiles!contracts_profile_fkey(*, nationality:countries!profiles_nationality_fkey(*)),
				signed_by:profiles!contracts_signed_by_fkey(first_name, last_name, email),
				terminated_by:profiles!contracts_terminated_by_fkey(first_name, last_name, email),
				team:teams!contracts_team_fkey(id, name),
				direct_report(job_title, id, profile(first_name, last_name))
			`
			)
			.eq('org', org);
		if (status) request.eq('status', status);
		const { data, error } = await request;
		return { data: data as unknown as ContractWithRelations[], error };
	}

	async getByIdWithProfile(org: string, id: number | string): Promise<ContractWithProfile | null> {
		const supabase = await createClient();
		const { data, error } = await supabase.from('contracts').select('*, profile:profiles!contracts_profile_fkey(*, nationality:countries!profiles_nationality_fkey(*))').match({ org, id }).single();
		if (error) return null;
		return data as unknown as ContractWithProfile;
	}

	async getAllByOrgWithProfile({ org, status, team }: { org: string; status?: Tables<'contracts'>['status']; team?: number }) {
		const supabase = await createClient();
		const request = supabase.from('contracts').select('*, profile:profiles!contracts_profile_fkey(*, nationality:countries!profiles_nationality_fkey(*))').eq('org', org);
		if (status) request.eq('status', status);
		if (team) request.eq('team', team);
		const { data, error } = await request;
		return { data: data as unknown as ContractWithProfile[], error };
	}

	async getByIdWithTeam(org: string, id: number | string): Promise<ContractWithTeam | null> {
		const supabase = await createClient();
		const { data, error } = await supabase.from('contracts').select('*, team:teams!contracts_team_fkey(id, name)').match({ org, id }).single();
		if (error) return null;
		return data as unknown as ContractWithTeam;
	}

	async getAllByOrgWithTeam(org: string, status?: Tables<'contracts'>['status']): Promise<ContractWithTeam[]> {
		const supabase = await createClient();
		const request = supabase.from('contracts').select('*, team:teams!contracts_team_fkey(id, name)').eq('org', org);
		if (status) request.eq('status', status);
		const { data, error } = await request;
		if (error || !data) return [];
		return data as unknown as ContractWithTeam[];
	}

	async getByIdWithProfileAndTeam(org: string, id: number | string): Promise<ContractWithProfileAndTeam | null> {
		const supabase = await createClient();
		const { data, error } = await supabase.from('contracts').select('*, profile:profiles!contracts_profile_fkey(*, nationality:countries!profiles_nationality_fkey(*)), team:teams!contracts_team_fkey(id, name)').match({ org, id }).single();
		console.log(data, error);

		if (error) return null;
		return data as unknown as ContractWithProfileAndTeam;
	}

	async getByProfileWithProfileAndTeam({ id, org }: { id: number | string; org: string }) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('contracts').select('*, profile:profiles!contracts_profile_fkey(*, nationality:countries!profiles_nationality_fkey(*)), team:teams!contracts_team_fkey(id, name)').match({ profile: id, org });

		return { data: data as unknown as ContractWithProfileAndTeam[], error };
	}

	async getAllByOrgWithProfileAndTeam(org: string, status?: Tables<'contracts'>['status']) {
		const supabase = await createClient();
		const request = supabase.from('contracts').select('*, profile:profiles!contracts_profile_fkey(*, nationality:countries!profiles_nationality_fkey(*)), team:teams!contracts_team_fkey(id, name)').eq('org', org);
		if (status) request.eq('status', status);
		const { data, error } = await request;
		return { data: data as unknown as ContractWithProfileAndTeam[], error };
	}

	async getByTeamStatusOrgWithProfile({ team, status, org, contractId }: { team?: number; status?: Tables<'contracts'>['status']; org: string; contractId?: number }) {
		const supabase = await createClient();
		const request = supabase.from('contracts').select('*, profile:profiles!contracts_profile_fkey(*, nationality:countries!profiles_nationality_fkey(*))').eq('org', org);
		if (team && contractId) request.or(`team.eq.${team},direct_report.eq.${contractId}`);
		else if (team) request.eq('team', team);
		else if (contractId) request.eq('direct_report', contractId);

		if (status) request.eq('status', status);
		const { data, error } = await request;
		return { data: data as (Tables<'contracts'> & { profile?: Tables<'profiles'> & { nationality?: Tables<'countries'> } })[] | null, error };
	}
}
