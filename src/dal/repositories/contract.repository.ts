import { IContractRepository, ContractWithRelations, ContractWithProfile, ContractWithTeam, ContractWithProfileAndTeam } from '../interfaces/contract.repository.interface';
import { Tables, TablesInsert, TablesUpdate } from '@/type/database.types';
import { createClient } from '@/utils/supabase/server';

export class ContractRepository implements IContractRepository {
	async getById(org: string, id: number | string): Promise<Tables<'contracts'> | null> {
		const supabase = await createClient();
		const { data: contractData, error: contractError } = await supabase.from('contracts').select('*').match({ org, id }).single();
		if (contractError) return null;
		return contractData;
	}

	async getByProfile(profileId: string): Promise<Tables<'contracts'>[]> {
		const supabase = await createClient();
		const { data: profileData, error: profileError } = await supabase.from('contracts').select('*').eq('profile', profileId);
		if (profileError || !profileData) return [];
		return profileData;
	}

	async getAllByOrg(org: string, status?: Tables<'contracts'>['status']): Promise<Tables<'contracts'>[]> {
		const supabase = await createClient();

		const request = supabase.from('contracts').select('*').eq('org', org);
		if (status) request.eq('status', status);

		const { data: orgData, error: orgError } = await request;
		if (orgError || !orgData) return [];
		return orgData;
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

	async getByIdWithRelations(org: string, id: number | string): Promise<ContractWithRelations | null> {
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
		if (relError) return null;
		return relData as unknown as ContractWithRelations;
	}

	async getAllByOrgWithRelations(org: string, status?: Tables<'contracts'>['status']): Promise<ContractWithRelations[]> {
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
		if (error || !data) return [];
		return data as unknown as ContractWithRelations[];
	}

	async getByIdWithProfile(org: string, id: number | string): Promise<ContractWithProfile | null> {
		const supabase = await createClient();
		const { data, error } = await supabase.from('contracts').select('*, profile:profiles!contracts_profile_fkey(*, nationality:countries!profiles_nationality_fkey(*))').match({ org, id }).single();
		if (error) return null;
		return data as unknown as ContractWithProfile;
	}

	async getAllByOrgWithProfile(org: string, status?: Tables<'contracts'>['status']): Promise<ContractWithProfile[]> {
		const supabase = await createClient();
		const request = supabase.from('contracts').select('*, profile:profiles!contracts_profile_fkey(*, nationality:countries!profiles_nationality_fkey(*))').eq('org', org);
		if (status) request.eq('status', status);
		const { data, error } = await request;
		if (error || !data) return [];
		return data as unknown as ContractWithProfile[];
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

	async getByProfileWithProfileAndTeam(id: number | string, org: string): Promise<ContractWithProfileAndTeam[] | null> {
		const supabase = await createClient();
		const { data, error } = await supabase.from('contracts').select('*, profile:profiles!contracts_profile_fkey(*, nationality:countries!profiles_nationality_fkey(*)), team:teams!contracts_team_fkey(id, name)').match({ profile: id, org });

		if (error) return null;
		return data as unknown as ContractWithProfileAndTeam[];
	}

	async getAllByOrgWithProfileAndTeam(org: string, status?: Tables<'contracts'>['status']): Promise<ContractWithProfileAndTeam[]> {
		const supabase = await createClient();
		const request = supabase.from('contracts').select('*, profile:profiles!contracts_profile_fkey(*, nationality:countries!profiles_nationality_fkey(*)), team:teams!contracts_team_fkey(id, name)').eq('org', org);
		if (status) request.eq('status', status);
		const { data, error } = await request;
		if (error || !data) return [];
		return data as unknown as ContractWithProfileAndTeam[];
	}
}
