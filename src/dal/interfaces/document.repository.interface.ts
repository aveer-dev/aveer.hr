import { Tables, TablesInsert, TablesUpdate } from '@/type/database.types';

export interface IDocumentRepository {
	getById(id: number): Promise<Tables<'documents'> | null>;
	getAllByOrg(org: string): Promise<Tables<'documents'>[]>;
	getByName(org: string, name: string): Promise<Tables<'documents'>[]>;
	create(payload: TablesInsert<'documents'>): Promise<Tables<'documents'> | null>;
	update(id: number, payload: TablesUpdate<'documents'>): Promise<Tables<'documents'> | null>;
	delete(id: number): Promise<boolean>;
	getUserAccessibleDocuments(org: string, userId: string): Promise<Tables<'documents'>[]>;
}
