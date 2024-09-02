import { createClient } from '@/utils/supabase/server';
import { columns } from './table-column';
import { CONTRACT } from '@/type/contract.types';
import { toast } from 'sonner';
import { ContractorTable } from './table';

export const ContractorTableComponent = async () => {
	const supabase = createClient();
	let tableData: CONTRACT[] = [];

	const {
		data: { user },
		error: authError
	} = await supabase.auth.getUser();
	if (authError || !user) toast.error(authError?.message || 'Unable to get user details');

	if (user) {
		const { data, error } = await supabase
			.from('contracts')
			.select(
				'*, profile:profiles!contracts_profile_fkey(first_name, last_name, email, id, nationality:countries!profiles_nationality_fkey(country_code, name)), org:organisations!contracts_org_fkey(name, id, subdomain), entity:legal_entities!contracts_entity_fkey(name, id, incorporation_country:countries!legal_entities_incorporation_country_fkey(country_code, name))'
			)
			.eq('profile', user?.id);
		if (error) toast.error(error.message);
		if (data) tableData = data as any;
	}

	return <ContractorTable data={tableData || []} columns={columns} />;
};
