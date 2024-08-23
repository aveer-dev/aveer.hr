import { createClient } from '@/utils/supabase/server';
import { ContractForm } from '@/components/forms/contract/form';

export const EditContractFormComponent = async ({ org, id }: { org: string; id: string }) => {
	const supabase = createClient();
	const { data, error } = await supabase.from('contracts').select('*, profile:profiles!contracts_profile_fkey(first_name, id, last_name, email, nationality)').match({ org, id }).single();

	if (error) {
		return (
			<div>
				<p className="text-center text-xs text-muted-foreground">Unable to fetch contract details. Please refresh page</p>
			</div>
		);
	}

	return <ContractForm contractData={data} />;
};
