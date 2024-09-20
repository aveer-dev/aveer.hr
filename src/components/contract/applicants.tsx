import { createClient } from '@/utils/supabase/server';
import { Card } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import { ApplicantDetails } from '../open-role/roles/applicant-details';
import { Tables } from '@/type/database.types';
import { Separator } from '@/components/ui/separator';
import { ApplicantBadge } from '@/components/ui/applicant-stage-badge';

interface props {
	org: string;
	contract: Tables<'contracts'> & { profile: Tables<'profiles'>; role: Tables<'open_roles'> };
}

export const Applicants = async ({ org, contract }: props) => {
	const supabase = createClient();

	const managers = await supabase.from('managers').select().match({ org, profile: contract.profile.id });

	const { data, error } = await supabase
		.from('job_applications')
		.select(
			'*, country_location:countries!job_applications_country_location_fkey(name, country_code), org:organisations!job_applications_org_fkey(subdomain, name), role:open_roles!job_applications_role_fkey(job_title, team, id, policy:approval_policies!open_roles_policy_fkey(levels))'
		)
		.match({ org, stage: 'interview' });

	if (error) return error.message;

	const filtereddata = data?.filter(applicant => {
		const levels: any[] = applicant.levels;

		return managers?.data?.length ? applicant.role.team == contract.team || levels.find(level => level.id == contract.profile.id) : levels.find(level => level.id == contract.profile.id);
	});

	return (
		<section className="mt-20 w-full">
			<div className="flex items-center justify-between">
				<h2 className="flex items-center justify-between text-lg font-medium">Applicant review</h2>
			</div>

			<div className="">
				<Separator className="mb-4 mt-2" />

				{filtereddata.length > 0 && (
					<ul className="space-y-10">
						{filtereddata.map(applicant => (
							<li key={applicant.id}>
								<ApplicantDetails data={applicant as any} className="w-full text-left">
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
						))}
					</ul>
				)}

				{filtereddata.length == 0 && (
					<div className="flex min-h-40 items-center justify-center rounded-md bg-accent/50 text-xs text-muted-foreground">
						<p>You do not have any applianct review request</p>
					</div>
				)}
			</div>
		</section>
	);
};
