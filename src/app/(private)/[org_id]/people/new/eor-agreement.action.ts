'use server';

import { TablesUpdate } from '@/type/database.types';
import { createClient } from '@/utils/supabase/server';

export const createContract = async ({ eorEntity, entity, profile, org }: { eorEntity: number; entity: number; profile: string; org: number }) => {
	const supabase = createClient();

	const { data, error } = await supabase.from('org_documents').insert({ name: 'EOR Contract', eor_entity: eorEntity, entity, profile, org, type: 'eor' });
	if (error) return error.message;
};
