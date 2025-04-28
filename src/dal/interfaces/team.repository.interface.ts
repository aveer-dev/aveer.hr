import { Tables, TablesInsert, TablesUpdate } from '@/type/database.types';

export interface ITeamRepository {
	getById(id: number): Promise<Tables<'teams'> | null>;
	getAllByOrg(org: string): Promise<Tables<'teams'>[]>;
	getByName(org: string, name: string): Promise<Tables<'teams'>[]>;
	create(payload: TablesInsert<'teams'>): Promise<Tables<'teams'> | null>;
	update(id: number, payload: TablesUpdate<'teams'>): Promise<Tables<'teams'> | null>;
	delete(id: number): Promise<boolean>;
}
