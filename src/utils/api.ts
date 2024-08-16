'use server';

import { createClient } from './supabase/server';

export const getEORAgreementByCountry = async (selectedEntityIncCountry: string) => {
	const supabase = createClient();

	const res = await supabase.from('org_documents').select('*, eor_entity:legal_entities!org_documents_eor_entity_fkey(incorporation_country)').not('eor_entity', 'is', null).eq('legal_entities.incorporation_country', selectedEntityIncCountry).single();
	return res;
};
