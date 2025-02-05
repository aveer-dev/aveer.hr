import { createClient } from '@/utils/supabase/server';
import { columns } from '@/components/leave/column';
import { ROLE } from '@/type/contract.types';
import { DataTable } from '@/components/dashboard/table';

export const LeavePage = async ({ org }: { org: string }) => {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from('time_off')
		.select(
			`*,
            hand_over: contracts!time_off_hand_over_fkey(id, job_title, profile: profiles!contracts_profile_fkey(first_name, last_name)),
            contract: contracts!time_off_contract_fkey(job_title, id, team, unpaid_leave_used, sick_leave_used, paternity_leave_used, paid_leave_used, maternity_leave_used, org(subdomain, name), profile(first_name, last_name, email)),
            profile: profiles!time_off_profile_fkey(*)`
		)
		.eq('org', org)
		.order('created_at', { ascending: false });

	if (error) return error.message;

	const reviewType: ROLE = 'admin';

	return <DataTable data={data.map(item => ({ ...item, reviewType }))} columns={columns} />;
};
