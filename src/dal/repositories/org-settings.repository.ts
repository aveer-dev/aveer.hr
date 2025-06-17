import { IOrgSettingsRepository } from '../interfaces/org-settings.repository.interface';
import { TablesInsert, TablesUpdate } from '@/type/database.types';
import { createClient } from '@/utils/supabase/server';

export class OrgSettingsRepository implements IOrgSettingsRepository {
	async getByOrg(org: string) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('org_settings').select('*').eq('org', org).single();
		return { data, error };
	}
	async create(payload: TablesInsert<'org_settings'>) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('org_settings').insert(payload).select().single();
		return { data, error };
	}
	async update(id: number, payload: TablesUpdate<'org_settings'>) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('org_settings').update(payload).eq('id', id).select().single();
		return { data, error };
	}
	async delete(id: number) {
		const supabase = await createClient();
		const { error } = await supabase.from('org_settings').delete().eq('id', id);
		return { data: null, error };
	}
}
