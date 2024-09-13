import { createClient } from '@/utils/supabase/server';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import { ApplicantDetails } from '../open-role/roles/applicant-details';
import { Tables } from '@/type/database.types';

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
		.eq('org', org);

	if (error) return error.message;

	const filtereddata = data?.filter(applicant => {
		const levels: any[] = applicant.levels;

		return managers?.data?.length ? applicant.role.team == contract.team || levels.find(level => level.id == contract.profile.id) : levels.find(level => level.id == contract.profile.id);
	});

	return (
		<section className="mt-6 w-full">
			<div className="mb-8 flex items-center justify-between">
				<h2 className="flex items-center justify-between text-xl font-bold">Job applications</h2>
			</div>

			<div className="">
				<ul className="space-y-10">
					{filtereddata.map(applicant => (
						<li key={applicant.id}>
							<ApplicantDetails data={applicant as any} className="w-full text-left">
								<Card className="flex w-full items-center justify-between border-none p-3 transition-all duration-500 group-hover:bg-accent/80 group-focus:bg-accent/80 group-focus-visible:bg-accent/80">
									<div className="space-y-2">
										<h2 className="text-xs">
											{applicant?.first_name} {applicant?.last_name}
											<Badge className="ml-2 py-px text-[10px]" variant={'secondary'}>
												{applicant.stage}
											</Badge>
										</h2>
										<p className="text-xs text-muted-foreground">{applicant.role.job_title}</p>
									</div>

									<ChevronRight size={12} />
								</Card>
							</ApplicantDetails>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
};
