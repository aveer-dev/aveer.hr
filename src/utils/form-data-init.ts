import { createClient } from './supabase/server';

export const getFormEntities = async ({ org }: { org: string }) => {
	const supabase = createClient();

	const [{ data: entities }, { data: eorEntities }] = await Promise.all([
		await supabase.from('legal_entities').select('*, incorporation_country:countries!legal_entities_incorporation_country_fkey(currency_code, name)').eq('org', org),
		await supabase.from('legal_entities').select('*, incorporation_country:countries!legal_entities_incorporation_country_fkey(currency_code, name)').eq('is_eor', true)
	]);

	return { eorEntities, entities };
};

export const getOrgLevels = async ({ org }: { org: string }) => {
	const supabase = createClient();

	const res = await supabase.from('employee_levels').select().match({ org });

	return res;
};

export const getTeams = async ({ org }: { org: string }) => {
	const supabase = createClient();

	const res = await supabase.from('teams').select().eq('org', org);

	return res;
};

export const getEmployees = async ({ org }: { org: string }) => {
	const supabase = createClient();

	const res = await supabase.from('contracts').select('*, profile:profiles!contracts_profile_fkey(first_name, last_name)').match({ org, status: 'signed' });

	return res;
};

export const getRoles = async ({ org }: { org: string }) => {
	const supabase = createClient();

	const res = await supabase.from('open_roles').select().eq('org', org);

	return res;
};

export const getPolicies = async ({ org }: { org: string }) => {
	const supabase = createClient();

	const res = await supabase.from('approval_policies').select().match({ org, type: 'role_application' });

	return res;
};
