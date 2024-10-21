import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/utils/supabase/server';
import { ContractForm } from '@/components/forms/contract/form';
import { PageLoader } from '@/components/ui/page-loader';
import { getEmployees, getFormEntities, getOrgLevels, getPolicies, getTeams } from '@/utils/form-data-init';

export default async function Home({ params, searchParams }: { params: { [key: string]: string }; searchParams: { [key: string]: string } }) {
	const supabase = createClient();

	const [roleDetails, entities, levels, teams, policies, employees] = await Promise.all([
		searchParams.duplicate ? await supabase.from('open_roles').select().match({ id: searchParams.duplicate, org: params.org }).single() : undefined,
		await getFormEntities({ org: params.org }),
		await getOrgLevels({ org: params.org }),
		await getTeams({ org: params.org }),
		await getPolicies({ org: params.org }),
		await getEmployees({ org: params.org })
	]);

	const { data } = await supabase.from('org_settings').select().eq('org', params.org).single();

	return (
		<Suspense fallback={<PageLoader isLoading />}>
			<div className="mx-auto max-w-4xl">
				<div className="relative">
					<h1 className="mb-6 mt-6 text-xl font-semibold lg:mt-0">Create a role</h1>
				</div>

				<Suspense
					fallback={
						<div className="grid gap-6">
							<Skeleton className="h-60 w-full max-w-4xl"></Skeleton>
							<Skeleton className="h-60 w-full max-w-4xl"></Skeleton>
							<Skeleton className="h-60 w-full max-w-4xl"></Skeleton>
							<Skeleton className="h-60 w-full max-w-4xl"></Skeleton>
						</div>
					}>
					<ContractForm employeesData={employees} orgBenefits={data} formType="role" policiesData={policies} openRoleData={roleDetails?.data ? roleDetails?.data : undefined} entitiesData={entities as any} levels={levels} teamsData={teams} />
				</Suspense>
			</div>
		</Suspense>
	);
}
