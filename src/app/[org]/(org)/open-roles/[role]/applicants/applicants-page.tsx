import { createClient } from '@/utils/supabase/server';
import { ApplicantsBoard } from '@/components/job-applicants/applicants-board';
import { KanbanBoard } from '@caldwell619/react-kanban';
import { CustomCard } from '@/components/job-applicants/types';
import { BackButton } from '@/components/ui/back-button';

export const ApplicantsPageComponent = async ({ roleId, org, className, asComponent = false }: { asComponent?: boolean; roleId: string; org: string; className?: string }) => {
	const supabase = await createClient();

	const [{ data, error }, { data: role, error: roleError }] = await Promise.all([
		supabase
			.from('job_applications')
			.select(
				`*, country_location:countries!job_applications_country_location_fkey(name, country_code),
            org:organisations!job_applications_org_fkey(subdomain, name),
            role:open_roles!job_applications_role_fkey(job_title, id, policy:approval_policies!open_roles_policy_fkey(levels))`
			)
			.match({ org, role: roleId })
			.order('created_at'),
		supabase.from('open_roles').select('job_title').match({ id: roleId, org }).single()
	]);

	if (error || roleError)
		return (
			<div className="flex min-h-48 flex-col items-center justify-center gap-4 rounded-md border py-10 text-center text-xs text-muted-foreground">
				<p className="font-light">Error fetching data</p>
				<p className="font-light">{error?.message || roleError?.message}</p>
			</div>
		);

	if (data && data.length == 0) {
		return (
			<div className="flex min-h-48 flex-col items-center justify-center rounded-md border py-10 text-center text-xs text-muted-foreground">
				<p className="font-light">No role applicants yet</p>
			</div>
		);
	}

	const stages = ['applicant', 'review', 'interview', 'offer', 'hired', 'reject'];

	const initialBoards: KanbanBoard<CustomCard> = { columns: stages.map(stage => ({ id: stage, title: stage, cards: data?.filter(applicant => applicant.stage == stage) || [] })) };

	return (
		<div>
			{!asComponent && (
				<div className="relative mb-10 flex w-full items-center justify-between border-b pb-4">
					<BackButton />

					<h1 className="text-xl font-medium">
						Applicants: <span className="font-medium text-muted-foreground">{role?.job_title}</span>
					</h1>
				</div>
			)}
			<ApplicantsBoard stages={stages} initialBoards={initialBoards as any} className={className} />;
		</div>
	);
};
