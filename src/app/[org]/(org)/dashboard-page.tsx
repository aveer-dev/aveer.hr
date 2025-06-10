import { createClient } from '@/utils/supabase/server';
import { PERSON } from '@/type/person';
import { ClientTable } from './table';
import { OnboardingForm } from './onboarding';
import { DashboardCalendar } from '@/components/dashboard-calendar';
import { DashboardCharts } from './chart.component';
import { AttritionDialog } from '@/components/attrition/AttritionDialog';
import { ContractWithProfileAndTeam } from '@/dal/interfaces/contract.repository.interface';
import { TeamRepository } from '@/dal/repositories/team.repository';

export const DashboardPage = async ({ org, searchParams }: { org: string; searchParams: { [key: string]: string | string[] | undefined } }) => {
	const supabase = await createClient();

	const teamsRepository = new TeamRepository();
	const [{ data, error, count }, { count: openRoles }, { data: probation }, teams] = await Promise.all([
		supabase.from('contracts').select(`*, team:teams!contracts_team_fkey(name, id), profile:profiles!contracts_profile_fkey(*, nationality:countries!profiles_nationality_fkey(name))`, { count: 'estimated' }).match({ org }).order('id'),
		supabase.from('open_roles').select('*', { count: 'exact', head: true }).eq('org', org),
		supabase.from('org_settings').select('probation').eq('org', org).single(),
		teamsRepository.getAllByOrg(org)
	]);

	if (data && !data.length) {
		const { data, error } = await supabase.from('legal_entities').select().match({ org });

		if (error) {
			return (
				<div className="flex h-[50vh] flex-col items-center justify-center text-center">
					<p className="text-xs">Unable to fetch legal entities, please refresh page to try again</p>
					<p className="mt-6 text-xs text-muted-foreground">{error.message}</p>
				</div>
			);
		}

		if (data && !data.length) {
			return (
				<div className="mx-auto mt-24 flex min-h-[70vh] max-w-md flex-col gap-10">
					<div className="grid gap-3 text-center">
						<p className="text-base font-bold">Welcome to aveer.hr</p>
						<p className="text-xs text-muted-foreground">Just a few more details to get your account running</p>
					</div>

					<OnboardingForm org={org} />
				</div>
			);
		}
	}

	if (error)
		return (
			<div className="flex h-[50vh] flex-col items-center justify-center text-center">
				<p className="text-xs">Unable to fetch organisations available to you</p>
				<p className="mt-6 text-xs text-muted-foreground">{error.message}</p>
			</div>
		);

	return (
		<>
			<div className="mb-6 flex items-center gap-3">
				<div className="text-sm font-medium text-muted-foreground">Metrics:</div>
				<AttritionDialog org={org} contracts={data as unknown as ContractWithProfileAndTeam[]} teams={teams.data || []} />
			</div>

			<DashboardCharts openRoles={openRoles} contracts={count} />

			<DashboardCalendar org={org} />

			<ClientTable org={org} data={data as unknown as PERSON[]} probation={probation?.probation} />
		</>
	);
};
