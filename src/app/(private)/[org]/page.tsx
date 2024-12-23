import { DashboardCharts } from './chart.component';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/utils/supabase/server';
import { PERSON } from '@/type/person';
import { ClientTable } from './table';
import { OnboardingForm } from './onboarding';
import { DashboardCalendar } from '@/components/dashboard-calendar';

export default async function OrgPage(props: { params: Promise<{ [key: string]: string }>; searchParams: Promise<{ [key: string]: string }> }) {
	const supabase = await createClient();
	const { data, error, count } = await supabase
		.from('contracts')
		.select('profile:profiles!contracts_profile_fkey(first_name, last_name, nationality:countries!profiles_nationality_fkey(name)), org, id, status, job_title, employment_type, start_date, team:teams!contracts_team_fkey(name, id)', { count: 'estimated' })
		.match({ org: (await props.params).org })
		.order('id');

	if (data && !data.length) {
		const { data, error } = await supabase
			.from('legal_entities')
			.select()
			.match({ org: (await props.params).org });

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
					<OnboardingForm org={(await props.params).org} />
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
		<section className="mx-auto">
			<div className="mb-20 grid w-fit grid-cols-2 flex-wrap gap-x-20 gap-y-10">
				<Suspense
					fallback={
						<>
							<Skeleton className="h-32 w-full max-w-80" />
							<Skeleton className="h-32 w-full max-w-80" />
						</>
					}>
					<DashboardCharts contracts={count} org={(await props.params).org} />
				</Suspense>
			</div>

			<DashboardCalendar org={(await props.params).org} />
			<Suspense fallback={<Skeleton className="h-96 w-full max-w-[1200px]"></Skeleton>}>
				<ClientTable org={(await props.params).org} data={data as unknown as PERSON[]} />
			</Suspense>
		</section>
	);
}
