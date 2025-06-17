import { Tables, TablesInsert, TablesUpdate } from '@/type/database.types';
import { PostgrestError } from '@supabase/supabase-js';

export type LeaveWithRelations = Tables<'time_off'> & {
	profile?: Tables<'profiles'>;
	contract?: Tables<'contracts'>;
	hand_over?: Tables<'contracts'>;
};

export interface ILeaveRepository {
	getById(org: string, id: number | string): Promise<Tables<'time_off'> | null>;
	getAllByOrg(org: string, status?: Tables<'time_off'>['status']): Promise<Tables<'time_off'>[]>;
	getByProfile(org: string, profile: string, status?: Tables<'time_off'>['status']): Promise<Tables<'time_off'>[]>;
	getByContract(org: string, contract: number, status?: Tables<'time_off'>['status']): Promise<{ data: Tables<'time_off'>[] | null; error: PostgrestError | null }>;
	create(payload: TablesInsert<'time_off'>): Promise<Tables<'time_off'> | null>;
	update(org: string, id: number | string, payload: TablesUpdate<'time_off'>): Promise<Tables<'time_off'> | null>;
	delete(org: string, id: number | string): Promise<boolean>;

	getByIdWithRelations(org: string, id: number | string): Promise<LeaveWithRelations | null>;
	getAllByOrgWithRelations(org: string, status?: Tables<'time_off'>['status']): Promise<{ data: LeaveWithRelations[]; error: PostgrestError | null }>;
	getByProfileWithRelations(org: string, profile: string, status?: Tables<'time_off'>['status']): Promise<LeaveWithRelations[]>;
	getByContractWithRelations(org: string, contract: number, status?: Tables<'time_off'>['status']): Promise<{ data: LeaveWithRelations[]; error: PostgrestError | null }>;
}
