import { getChartData, LeaveRequestDialog } from '@/components/contract/leave';
import { LeaveStat } from '@/components/contract/leave/leave-stat';
import { DataTable } from '@/components/dashboard/table';
import { columns } from '@/components/leave/column';
import { Skeleton } from '@/components/ui/skeleton';
import { ROLE } from '@/type/contract.types';
import { createClient } from '@/utils/supabase/server';
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

	const chartData = getChartData(data, orgSettings?.data && orgSettings?.data[0]);
	const leaveDays = timeOffRequest!.data?.filter(item => item.status == 'approved' || item.status == 'pending');

	return (
		<div className="w-full">
			<div className="flex items-center justify-between">
				<h2 className="flex items-center justify-between text-base font-medium text-support">Leave summary</h2>

				<div className="flex items-center gap-2">
					<LeaveRequestDialog usedLeaveDays={leaveDays} orgSettings={orgSettings?.data && orgSettings?.data[0]} contract={data} />
				</div>
			</div>

			<div className="mt-14 grid gap-x-10 gap-y-16 sm:grid-cols-2">
				{chartData.map(stat => (
					<LeaveStat key={stat.label} {...stat} org={org} profile={(data.profile as any).id} />
				))}
			</div>

			{chartData.length == 0 && (
				<div className="flex gap-4">
					<Skeleton className="h-36 w-20" />
					<Skeleton className="h-36 w-20" />
					<Skeleton className="h-36 w-20" />
				</div>
			)}

			<div className="mb-6 mt-24 flex w-full items-center justify-between pb-3">
				<h2 className="flex items-center justify-between text-base font-medium text-support">Leave requests</h2>
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
