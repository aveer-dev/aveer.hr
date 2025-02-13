import { createClient } from '@/utils/supabase/server';
import { ApplicantsBoard } from '@/components/job-applicants/applicants-board';
import { KanbanBoard } from '@caldwell619/react-kanban';
import { CustomCard } from '@/components/job-applicants/types';

export const ApplicantsPageComponent = async ({ roleId, org, className }: { roleId: string; org: string; className?: string }) => {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from('job_applications')
		.select(
			`*, country_location:countries!job_applications_country_location_fkey(name, country_code),
            org:organisations!job_applications_org_fkey(subdomain, name),
            role:open_roles!job_applications_role_fkey(job_title, id, policy:approval_policies!open_roles_policy_fkey(levels))`
		)
		.match({ org, role: roleId })
		.order('created_at');

	if (error) return <div></div>;

	if (data && data.length == 0) {
		return (
			<div className="flex min-h-48 flex-col items-center justify-center rounded-md border py-10 text-center text-xs text-muted-foreground">
				<p className="font-light">No role applicants yet</p>
			</div>
		);
	}

	const stages = ['review', 'interview', 'offer', 'hired', 'rejected'];

	const initialBoards: KanbanBoard<CustomCard> = { columns: stages.map(stage => ({ id: stage, title: stage, cards: data?.filter(applicant => applicant.stage == stage) || [] })) };

	return <ApplicantsBoard initialBoards={initialBoards as any} className={className} />;
};
