import { IDocumentRepository } from '../interfaces/document.repository.interface';
import { Tables, TablesInsert, TablesUpdate } from '@/type/database.types';
import { createClient } from '@/utils/supabase/server';

interface ShareEntry {
	access: string;
	profile: string;
	contract?: number;
}

function isShareEntry(value: unknown): value is ShareEntry {
	if (!value || typeof value !== 'object') return false;
	const entry = value as Record<string, unknown>;
	return typeof entry.access === 'string' && typeof entry.profile === 'string' && (entry.contract === undefined || typeof entry.contract === 'number');
}

export class DocumentRepository implements IDocumentRepository {
	async getById(id: number): Promise<Tables<'documents'> | null> {
		const supabase = await createClient();
		const { data, error } = await supabase.from('documents').select('*').eq('id', id).single();
		if (error) return null;
		return data;
	}

	async getAllByOrg(org: string): Promise<Tables<'documents'>[]> {
		const supabase = await createClient();
		const { data, error } = await supabase.from('documents').select('*').eq('org', org);
		if (error || !data) return [];
		return data;
	}

	async getByName(org: string, name: string): Promise<Tables<'documents'>[]> {
		const supabase = await createClient();
		const { data, error } = await supabase.from('documents').select('*').eq('org', org).ilike('name', `%${name}%`);
		if (error || !data) return [];
		return data;
	}

	async create(payload: TablesInsert<'documents'>): Promise<Tables<'documents'> | null> {
		const supabase = await createClient();
		const { data, error } = await supabase.from('documents').insert(payload).select().single();
		if (error) return null;
		return data;
	}

	async update(id: number, payload: TablesUpdate<'documents'>): Promise<Tables<'documents'> | null> {
		const supabase = await createClient();
		const { data, error } = await supabase.from('documents').update(payload).eq('id', id).select().single();
		if (error) return null;
		return data;
	}

	async delete(id: number): Promise<boolean> {
		const supabase = await createClient();
		const { error } = await supabase.from('documents').delete().eq('id', id);
		return !error;
	}

	async getUserAccessibleDocuments(org: string, userId: string): Promise<Tables<'documents'>[]> {
		const supabase = await createClient();
		// Fetch all documents in the organization
		const { data, error } = await supabase.from('documents').select('*').eq('org', org);

		if (error || !data) return [];

		// Filter documents based on all access conditions
		return data.filter(
			doc =>
				!doc.private || // public documents
				doc.owner === userId || // owned documents
				(doc.shared_with && // shared documents
					Array.isArray(doc.shared_with) &&
					doc.shared_with.some(share => isShareEntry(share) && share.profile === userId))
		);
	}
}
