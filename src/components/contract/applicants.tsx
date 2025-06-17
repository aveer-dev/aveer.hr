import { Card } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import { ApplicantDetails } from '../open-role/roles/applicant-details';
import { Tables } from '@/type/database.types';
import { Separator } from '@/components/ui/separator';
import { ApplicantBadge } from '@/components/ui/applicant-stage-badge';
import { getApplicants } from './contract-assignments/utils';

interface props {
	org: string;
	contract: Tables<'contracts'> & { profile: Tables<'profiles'>; role: Tables<'open_roles'>; team: { id: number; name: string } };
	manager?: Tables<'managers'> | null;
}

export const Applicants = async ({ org, contract, manager }: props) => {
	const applicants = await getApplicants({ org, contract, manager });

	return (
		<section className="mt-20 w-full">
			<div className="flex items-center justify-between">
				<h2 className="text-base font-medium text-support">Applicants review</h2>
			</div>

			<div className="">
				<Separator className="mb-4 mt-2" />

				{typeof applicants !== 'string' && applicants.length > 0 && (
					<ul className="space-y-10">
						{applicants.map(
							applicant =>
								applicant && (
									<li key={applicant.id}>
										<ApplicantDetails userRole={manager || applicant.role.direct_report == contract.id ? 'manager' : 'employee'} contractId={contract.id} data={applicant as any} className="w-full text-left">
											<Card className="flex w-full items-center justify-between border-none p-3 transition-all duration-500 group-hover:bg-accent/80 group-focus:bg-accent/80 group-focus-visible:bg-accent/80">
												<div className="space-y-2">
													<div className="flex items-center gap-2">
														<h2 className="text-xs">
															{applicant?.first_name} {applicant?.last_name}
														</h2>
														<ApplicantBadge stage={applicant.stage} />
													</div>
													<p className="text-xs text-muted-foreground">{applicant.role.job_title}</p>
												</div>

												<ChevronRight size={12} />
											</Card>
										</ApplicantDetails>
									</li>
								)
						)}
					</ul>
				)}

				{typeof applicants !== 'string' && applicants.length == 0 && (
					<div className="flex min-h-40 items-center justify-center rounded-md bg-accent/50 text-xs text-muted-foreground">
						<p>You do not have any applicant review request</p>
					</div>
				)}
			</div>
		</section>
	);
};
