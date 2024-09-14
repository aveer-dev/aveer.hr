import { LeaveReview } from '@/components/leave/leave-review';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { createClient } from '@/utils/supabase/server';
import { format } from 'date-fns';
import { ChevronRight, Edit, List, Trash2 } from 'lucide-react';

interface props {
	org: string;
	contractId: number;
}

export const LeaveRequests = async ({ org, contractId }: props) => {
	const supabase = createClient();

	const { data, error } = await supabase
		.from('time_off')
		.select(
			'*, hand_over:contracts!time_off_hand_over_fkey(id, job_title, profile:profiles!contracts_profile_fkey(first_name, last_name)), contract:contracts!time_off_contract_fkey(job_title,id, team, unpaid_leave_used, sick_leave_used, paternity_leave_used, paid_leave_used, maternity_leave_used), profile:profiles!time_off_profile_fkey(*)'
		)
		.match({ org, contract: contractId });

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

				<ul className="mt-10 grid gap-4 py-4">
					{data.map(leave => (
						<li key={leave.id}>
							<LeaveReview data={leave as any} reviewType={'employee'}>
								<button className="w-full">
									<Card className="flex items-center justify-between p-4 text-left">
										<div className="space-y-3 text-xs text-muted-foreground">
											<div>
												From <span className="text-foreground">{format(leave.from, 'PP')}</span>
											</div>
											<div>
												To <span className="text-foreground">{format(leave.to, 'PP')}</span>
											</div>
										</div>

										<div className="flex items-center gap-2">
											<Badge variant={'secondary'}>{leave.leave_type} leave</Badge>
											<ChevronRight size={12} />
										</div>
									</Card>
								</button>
							</LeaveReview>

							<div className="mt-2 flex items-center gap-1">
								<Button variant={'ghost'} className="h-6 text-destructive hover:bg-destructive/10 hover:text-destructive focus:ring-destructive focus-visible:bg-destructive/10 focus-visible:text-destructive focus-visible:ring-destructive">
									<Trash2 size={12} />
								</Button>
								<Button variant={'ghost'} className="h-6">
									<Edit size={12} />
								</Button>
							</div>
						</li>
					))}
				</ul>
			</SheetContent>
		</Sheet>
	);
};
