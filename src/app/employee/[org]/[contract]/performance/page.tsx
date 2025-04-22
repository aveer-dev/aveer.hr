import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { EmployeeAppraisalList } from '@/components/appraisal/employee-appraisal-list';

export default async function AppraisalPage(props: { params: Promise<{ [key: string]: string }> }) {
	const params = await props.params;
	const supabase = await createClient();

	const { data: contract, error } = await supabase
		.from('contracts')
		.select('*, team:teams!contracts_team_fkey(name, id), profile:profiles!contracts_profile_fkey(first_name, last_name, email, id), org:organisations!contracts_org_fkey(name, id, subdomain)')
		.eq('id', Number(params.contract))
		.single();

	if (error) {
		return (
			<div className="flex min-h-56 flex-col items-center justify-center gap-2 bg-muted text-center text-muted-foreground">
				<p>Unable to fetch contract</p>
				<p>{error?.message}</p>
			</div>
		);
	}

	if (contract.status !== 'signed') redirect('./home');

	return (
		<div className="container mx-auto px-0 py-8">
			<div className="space-y-6">
				<EmployeeAppraisalList org={params.org} contract={contract} />
			</div>
		</div>
	);
}
