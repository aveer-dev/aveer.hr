import { Database, Tables, TablesInsert, TablesUpdate } from '@/type/database.types';

export type ContractWithRelations = Tables<'contracts'> & {
	org?: Tables<'organisations'>;
	level?: Tables<'employee_levels'>;
	entity?: Tables<'legal_entities'> & { incorporation_country?: Tables<'countries'> };
	profile?: Tables<'profiles'> & { nationality?: Tables<'countries'> };
	signed_by?: Pick<Tables<'profiles'>, 'first_name' | 'last_name' | 'email'>;
	terminated_by?: Pick<Tables<'profiles'>, 'first_name' | 'last_name' | 'email'>;
	team?: Pick<Tables<'teams'>, 'id' | 'name'>;
	direct_report?: { job_title?: string; id?: number; profile?: Pick<Tables<'profiles'>, 'first_name' | 'last_name'> };
};

export type ContractWithProfile = Tables<'contracts'> & {
	profile?: Tables<'profiles'> & { nationality?: Tables<'countries'> };
};

export type ContractWithTeam = Tables<'contracts'> & {
	team?: Pick<Tables<'teams'>, 'id' | 'name'>;
};

export type ContractWithProfileAndTeam = Tables<'contracts'> & {
	profile?: Tables<'profiles'> & { nationality?: Tables<'countries'> };
	team?: Pick<Tables<'teams'>, 'id' | 'name'>;
};

export interface IContractRepository {
	getById(org: string, id: number | string): Promise<Tables<'contracts'> | null>;
	getByProfile(profileId: string): Promise<Tables<'contracts'>[]>;
	getAllByOrg(org: string, status?: Tables<'contracts'>['status']): Promise<Tables<'contracts'>[]>;
	create(payload: TablesInsert<'contracts'>): Promise<Tables<'contracts'> | null>;
	update(org: string, id: number | string, payload: TablesUpdate<'contracts'>): Promise<Tables<'contracts'> | null>;
	delete(org: string, id: number | string): Promise<boolean>;

	getByIdWithRelations(org: string, id: number | string): Promise<ContractWithRelations | null>;
	getAllByOrgWithRelations(org: string, status?: Tables<'contracts'>['status']): Promise<ContractWithRelations[]>;

	getByIdWithProfile(org: string, id: number | string): Promise<ContractWithProfile | null>;
	getAllByOrgWithProfile({ org, status }: { org: string; status?: Tables<'contracts'>['status'] }): Promise<ContractWithProfile[]>;

	getByIdWithTeam(org: string, id: number | string): Promise<ContractWithTeam | null>;
	getAllByOrgWithTeam(org: string, status?: Tables<'contracts'>['status']): Promise<ContractWithTeam[]>;

	getByIdWithProfileAndTeam(org: string, id: number | string): Promise<ContractWithProfileAndTeam | null>;
	getAllByOrgWithProfileAndTeam(org: string, status?: Tables<'contracts'>['status']): Promise<ContractWithProfileAndTeam[]>;

	getByProfileWithProfileAndTeam(id: number | string, org: string): Promise<ContractWithProfileAndTeam[] | null>;
}
