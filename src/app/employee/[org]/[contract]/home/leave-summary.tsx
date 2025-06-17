import { getChartData, LeaveRequestDialog } from '@/components/contract/leave';
import { LeaveStat } from '@/components/contract/leave/leave-stat';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tables } from '@/type/database.types';
import { List, Plus } from 'lucide-react';
import Link from 'next/link';

export const LeaveSummary = ({ org, contract, orgSettings, usedLeaveDays }: { org: string; contract: Tables<'contracts'> & { profile: Tables<'profiles'> }; orgSettings: Tables<'org_settings'> | null; usedLeaveDays: Tables<'time_off'>[] }) => {
	const chartData = getChartData(contract, orgSettings);

	return (
		<div>
			<div className="mb-2 flex items-center justify-between">
				<h2 className="text-xs text-muted-foreground">Leave summary</h2>

				<div className="flex items-center gap-2">
					<Link href={`/employee/${org}/${contract.id}/leave`} className={cn(buttonVariants({ variant: 'secondary' }), 'h-8 w-8')}>
						<List size={12} className="scale-125" />
					</Link>

					<LeaveRequestDialog usedLeaveDays={usedLeaveDays} orgSettings={orgSettings} contract={contract}>
						<Button variant="secondary" size="icon" className="h-8 w-8">
							<Plus size={12} />
						</Button>
					</LeaveRequestDialog>
				</div>
			</div>

			<div className="grid gap-x-10 gap-y-7 rounded-md bg-muted p-6 sm:grid-cols-2">
				{chartData.map(stat => (
					<LeaveStat key={stat.label} {...stat} org={org} profile={contract.profile.id} minimal={true} />
				))}
			</div>
		</div>
	);
};
