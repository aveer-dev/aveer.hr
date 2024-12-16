import { LeaveReview } from '@/components/leave/leave-review';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ROLE } from '@/type/contract.types';
import { createClient } from '@/utils/supabase/server';
import { format } from 'date-fns';
import { ChevronRight, List } from 'lucide-react';
import { LeaveActions } from './leave-actions';
import { Tables } from '@/type/database.types';

interface props {
	org: string;
	contract: Tables<'contracts'>;
	reviewType: ROLE;
	orgSettings: Tables<'org_settings'> | null;
}

export const LeaveRequests = async ({ org, contract, reviewType, orgSettings }: props) => {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from('time_off')
		.select(
			'*, hand_over:contracts!time_off_hand_over_fkey(id, job_title, profile:profiles!contracts_profile_fkey(first_name, last_name)), contract:contracts!time_off_contract_fkey(job_title,id, team, unpaid_leave_used, sick_leave_used, paternity_leave_used, paid_leave_used, maternity_leave_used), profile:profiles!time_off_profile_fkey(*)'
		)
		.match({ org, contract: contract.id });

	if (error) return error.message;

	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant={'secondary'} size={'icon'} className="h-9">
					<List size={14} />
				</Button>
			</SheetTrigger>

			<SheetContent className="sm:max-w-lg">
				<SheetHeader>
					<SheetTitle>Your leave requests</SheetTitle>
					<SheetDescription>Review, update and cancel leave requests here.</SheetDescription>
				</SheetHeader>

				{data.length > 0 && (
					<ul className="mt-10 grid gap-4 py-4">
						{data.map(leave => (
							<li key={leave.id}>
								<LeaveReview data={leave as any} reviewType={reviewType} contractId={contract.id}>
									<button className="w-full">
										<Card className="flex items-center justify-between p-4 text-left">
											<div className="space-y-3 text-xs text-muted-foreground">
												<h3 className="font-semibold capitalize text-foreground">{leave.leave_type} leave</h3>
												<div>
													From <span className="text-foreground">{format(leave.from, 'PP')}</span>
												</div>
												<div>
													To <span className="text-foreground">{format(leave.to, 'PP')}</span>
												</div>
											</div>

											<div className="flex items-center gap-2">
												<Badge variant={leave.status == 'approved' ? 'secondary-success' : leave.status == 'denied' ? 'secondary-destructive' : leave.status == 'pending' ? 'secondary-warn' : 'secondary'}>{leave.status}</Badge>
												<ChevronRight size={12} />
											</div>
										</Card>
									</button>
								</LeaveReview>

								<LeaveActions orgSettings={orgSettings} contract={contract} data={leave} org={org} id={leave.id} />
							</li>
						))}
					</ul>
				)}

				{data.length == 0 && (
					<div className="mt-10 flex min-h-32 items-center justify-center rounded-md bg-accent/80 text-xs text-muted-foreground">
						<p>You do not have any leave request, yet</p>
					</div>
				)}
			</SheetContent>
		</Sheet>
	);
};
