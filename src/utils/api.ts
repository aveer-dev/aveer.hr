'use server';

import { createClient } from './supabase/server';

export const getEORAgreementByCountry = async (selectedEntityIncCountry: string) => {
	const supabase = createClient();

	const res = await supabase.from('org_documents').select('*, eor_entity:legal_entities!org_documents_eor_entity_fkey(incorporation_country)').not('eor_entity', 'is', null).eq('legal_entities.incorporation_country', selectedEntityIncCountry);
	return res;
};

export const doesUserHaveAdequatePermissions = async ({ orgId }: { orgId: string }) => {
	const supabase = createClient();

	const {
		data: { user }
	} = await supabase.auth.getUser();
	const role = await supabase.from('profiles_roles').select().match({ organisation: orgId, profile: user?.id });
	if (role.error) return role.error.message;
	if (role.data && !role.data.length) return `You do not have adequate org permission for this action`;
	return true;
};

export const createEORAgreement = async ({ org }: { org: string }) => {
	const supabase = createClient();
	const { data, error } = await supabase.from('org_documents').insert({ name: 'EOR Contract', org, type: 'eor' }).select('id').single();
	if (error) return error.message;
	if (data) return data.id;
};

export const getCountries = async () => {
	const supabase = createClient();

	const { data, error } = await supabase.from('countries').select();
	if (!error) return data;
};
