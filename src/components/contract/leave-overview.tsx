import { ArrowUpRight } from 'lucide-react';
import { Tables } from '@/type/database.types';
import { createClient } from '@/utils/supabase/server';
import { Skeleton } from '@/components/ui/skeleton';
import { getChartData, LeaveRequestDialog } from './leave';
import { Separator } from '@/components/ui/separator';
import { ROLE } from '@/type/contract.types';
import { LeaveStat } from './leave/leave-stat';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { DataTable } from '@/components/dashboard/table';
import { columns } from '@/components/leave/column';

interface props {
	data: Tables<'contracts'> & { profile: Tables<'profiles'>; org: Tables<'organisations'>; entity: Tables<'legal_entities'> & { incorporation_country: { currency_code: string } } };
	reviewType: ROLE;
	orgSettings: Tables<'org_settings'> | null;
}

export const LeaveOverview = async ({ data, reviewType, orgSettings }: props) => {
	const supabase = await createClient();

	const chartData = getChartData(data, orgSettings);

	const { data: leaveRequests, error: leaveRequestsError } = await supabase
		.from('time_off')
		.select(
			'*, hand_over:contracts!time_off_hand_over_fkey(id, job_title, profile:profiles!contracts_profile_fkey(first_name, last_name)), contract:contracts!time_off_contract_fkey(job_title,id, team, unpaid_leave_used, sick_leave_used, paternity_leave_used, paid_leave_used, maternity_leave_used), profile:profiles!time_off_profile_fkey(*)'
		)
		.match({ org: orgSettings?.org, contract: data.id })
		.or('status.eq.pending,status.eq.approved');

	if (leaveRequestsError)
		return (
			<div className="mt-10 flex min-h-32 items-center justify-center rounded-md bg-accent/80 text-xs text-muted-foreground">
				<p>You do not have any leave request, yet</p>
				<p>{leaveRequestsError.message}</p>
			</div>
		);

	return (
		<section className="mt-4 w-full">
			{data?.direct_report && (
				<div className="mb-10 flex w-full items-center justify-between rounded-2xl border bg-muted/40 p-2">
					<h2 className="p-2 text-sm font-light">Reports to</h2>

					<Link href={(data.direct_report as any) ? `./${(data.direct_report as any).id}` : ''} className={cn(buttonVariants({ variant: 'outline' }), 'flex items-center gap-2')}>
						<p className="text-sm font-light">
							{(data.direct_report as any)?.profile?.first_name} {(data.direct_report as any)?.profile?.last_name}
						</p>
						<Separator className="h-3" orientation="vertical" />
						<ArrowUpRight size={12} />
					</Link>
				</div>
			)}

			<div className="space-y-16">
				{/* leave */}
				<div className="w-full">
					<div className="flex items-center justify-between">
						<h2 className="text-base font-medium text-support">Leave days</h2>

						<div className="flex items-center gap-2">{data.status == 'signed' && <LeaveRequestDialog usedLeaveDays={leaveRequests!} orgSettings={orgSettings} contract={data} />}</div>
					</div>

					<div className="mt-14 grid gap-x-10 gap-y-16 sm:grid-cols-2">
						{chartData.map(stat => (
							<LeaveStat key={stat.label} {...stat} org={data.org.subdomain} profile={(data.profile as any).id} />
						))}
					</div>

					{chartData.length == 0 && (
						<div className="flex gap-4">
							<Skeleton className="h-36 w-20" />
							<Skeleton className="h-36 w-20" />
							<Skeleton className="h-36 w-20" />
						</div>
					)}

					<div className="mt-24">
						<h2 className="mb-4 text-base font-medium text-support">Leave requests</h2>
						<DataTable data={(leaveRequests?.map(item => ({ ...item, reviewType, contract: data, profile: data.profile })) || []) as any} columns={columns} />
					</div>
				</div>
			</div>
		</section>
	);
};
