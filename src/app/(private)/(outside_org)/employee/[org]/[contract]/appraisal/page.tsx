import { EmployeeAppraisals } from '@/components/contract/contract-appraisals';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProfilePage({ params }: { params: { [key: string]: string } }) {
	const supabase = createClient();

	const { data, error } = await supabase
		.from('contracts')
		.select('*, team:teams!contracts_team_fkey(name, id), profile:profiles!contracts_profile_fkey(first_name, last_name, email, id), org:organisations!contracts_org_fkey(name, id, subdomain)')
		.eq('id', params.contract)
		.single();

	if (error) {
		return (
			<div className="flex min-h-56 flex-col items-center justify-center gap-2 bg-muted text-center text-muted-foreground">
				<p>Unable to fetch contract</p>
				<p>{error?.message}</p>
			</div>
		);
	}

	if (data.status !== 'signed') redirect('./home');

	return <EmployeeAppraisals formType={'employee'} role={'employee'} org={params.org} contract={data} group={'employee'} />;
}
