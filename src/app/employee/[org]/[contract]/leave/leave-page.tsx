import { LeaveRequestDialog } from '@/components/contract/leave';
import { DataTable } from '@/components/dashboard/table';
import { columns } from '@/components/leave/column';
import { Button } from '@/components/ui/button';
import { ROLE } from '@/type/contract.types';
import { createClient } from '@/utils/supabase/server';
import { Plus } from 'lucide-react';
import { redirect } from 'next/navigation';

export const LeavePage = async ({ params }: { params: Promise<{ [key: string]: string }> }) => {
	const supabase = await createClient();

	const { contract, org } = await params;

	const { data, error } = await supabase
		.from('contracts')
		.select(
			'*, profile:profiles!contracts_profile_fkey(first_name, last_name, email, id, nationality:countries!profiles_nationality_fkey(country_code, name)), org:organisations!contracts_org_fkey(name, id, subdomain), entity:legal_entities!contracts_entity_fkey(name, id, incorporation_country:countries!legal_entities_incorporation_country_fkey(country_code, name, currency_code))'
		)
		.eq('id', Number(contract))
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

	const [timeOffRequest, orgSettings] = await Promise.all([
		await supabase
			.from('time_off')
			.select(
				`*,
                hand_over:contracts!time_off_hand_over_fkey(id, job_title, profile:profiles!contracts_profile_fkey(first_name, last_name)),
                contract:contracts!time_off_contract_fkey(job_title,id, team, unpaid_leave_used, sick_leave_used, paternity_leave_used, paid_leave_used, maternity_leave_used),
                profile:profiles!time_off_profile_fkey(*)`
			)
			.match({ org, profile: (data.profile as any).id })
			.order('created_at', { ascending: false }),
		await supabase.from('org_settings').select().match({ org })
	]);
	const reviewType: ROLE = 'employee';

	const leaveDays = timeOffRequest!.data?.filter(item => item.status == 'approved' || item.status == 'pending');

	return (
		<div className="mt-24 w-full space-y-4 sm:mt-0 sm:space-y-10">
			<div className="flex items-end justify-between">
				<h2 className="text-4xl font-light">Leave Requests</h2>

				<div className="flex items-center gap-2">
					<LeaveRequestDialog usedLeaveDays={leaveDays} orgSettings={orgSettings?.data && orgSettings?.data[0]} contract={data}>
						<Button variant="secondary" className="h-8 w-8" size={'icon'}>
							<Plus size={16} />
						</Button>
					</LeaveRequestDialog>
				</div>
			</div>

			{timeOffRequest?.error && (
				<div className="flex min-h-56 flex-col items-center justify-center gap-2 bg-muted text-center text-muted-foreground">
					<p>Unable to fetch leaves</p>
					<p>{timeOffRequest?.error?.message}</p>
				</div>
			)}

			<DataTable data={(timeOffRequest?.data?.map(item => ({ ...item, reviewType, contract: data, profile: data.profile })) || []) as any} columns={columns} />
		</div>
	);
};
