import { createClient } from '@/utils/supabase/server';
import { Button, buttonVariants } from '@/components/ui/button';
import { getApplicants, getBoardingRequests, getLeaveRequests } from '@/components/contract/contract-assignments/utils';
import { cn } from '@/lib/utils';
import { Tables } from '@/type/database.types';
import { format } from 'date-fns';
import { LeaveReview } from '@/components/leave/leave-review';
import { ApplicantDetails } from '@/components/open-role/roles/applicant-details';

export const Todos = async ({ profile, contract, org, team }: { profileId?: string; org: string; contract: Tables<'contracts'>; team: number; profile: Tables<'profiles'> }) => {
	const supabase = await createClient();

	if (!profile) return;

	const manager = contract.status == 'signed' && (await supabase.from('managers').select().match({ org, person: contract.id, team: team })).data;

	const leaveRequests = contract.status == 'signed' && (await getLeaveRequests({ org, contract, manager: manager && manager.length > 0 ? manager[0] : undefined, status: 'pending' }));
	const applicants = contract.status == 'signed' && (await getApplicants({ org, contract, manager: manager && manager.length > 0 ? manager[0] : undefined }));
	// const boardingRequests = contract.status == 'signed' && (await getBoardingRequests({ org, contract, manager: manager && manager.length > 0 ? manager[0] : undefined }));

	const todos = [...(leaveRequests ? leaveRequests : []), ...(applicants ? applicants : [])].sort((a, b) => (new Date((a as any)?.created_at) as any) - (new Date((b as any)?.created_at) as any));

	return (
		!!todos.length && (
			<section className={cn(contract.status !== 'signed' && 'pointer-events-none opacity-50 blur-sm', 'w-full')}>
				<h2 className="mb-4 text-sm font-normal text-support">Todos</h2>

				<ul className="space-y-2 rounded-md pb-4 text-sm text-primary/90">
					{todos.map((item, index) => {
						if (!item || typeof item == 'string') return;
						return (
							<li key={index} className="flex items-center gap-1">
								<div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary/40"></div>

								{!!(item as any)?.from && !!(item as any)?.to && (
									<LeaveReview reviewType={'manager'} data={item as any} contract={(item as any)?.contract}>
										<Button variant={'ghost'} className="block h-[unset] w-[unset] gap-3 whitespace-normal py-3 text-left">
											<time className="pr-2 text-muted-foreground">{format(item.created_at as string, 'PPP')}</time>
											<span className="">
												{(item as any)?.profile?.first_name} has a {(item as any)?.leave_type} leave request pending your approval
											</span>
										</Button>
									</LeaveReview>
								)}

								{(item as any)?.role && (
									<ApplicantDetails
										key={index}
										userRole={manager || (item as any)?.role.direct_report == contract.id ? 'manager' : 'employee'}
										contractId={contract.id}
										data={item as any}
										className={cn(buttonVariants({ variant: 'ghost' }), 'block whitespace-normal py-3 text-left text-xs font-light')}>
										<time className="pr-2 text-muted-foreground">{format(item.created_at as string, 'PPP')}</time>
										<span className="">You have a {(item as any)?.role.job_title} role applicant pending your review</span>
									</ApplicantDetails>
								)}
							</li>
						);
					})}
				</ul>
			</section>
		)
	);
};
