import { createClient } from '@/utils/supabase/server';
import { PERSON } from '@/type/person';
import { ClientTable } from './table';
import { OnboardingForm } from './onboarding';
import { DashboardCalendar } from '@/components/dashboard-calendar';
import { DashboardCharts } from './chart.component';

export const DashboardPage = async ({ org, searchParams }: { org: string; searchParams: { [key: string]: string | string[] | undefined } }) => {
	const supabase = await createClient();

	const [{ data, error, count }, { count: openRoles }, { data: probation }] = await Promise.all([
		supabase
			.from('contracts')
			.select(
				`
                profile:profiles!contracts_profile_fkey(first_name, last_name, nationality:countries!profiles_nationality_fkey(name)),
                org, id, status, job_title, employment_type, start_date`,
				{ count: 'estimated' }
			)
			.match({ org })
			.order('id'),
		supabase.from('open_roles').select('*', { count: 'exact', head: true }).eq('org', org),
		supabase.from('org_settings').select('probation').eq('org', org).single()
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
			<DashboardCharts openRoles={openRoles} contracts={count} />

			<DashboardCalendar org={org} />

			<ClientTable org={org} data={data as unknown as PERSON[]} probation={probation?.probation} />
		</>
	);
};
