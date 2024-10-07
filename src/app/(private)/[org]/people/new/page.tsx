import { Suspense } from 'react';
import { ContractForm } from '@/components/forms/contract/form';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/utils/supabase/server';
import { BackButton } from '@/components/ui/back-button';
import { PageLoader } from '@/components/ui/page-loader';
import { getFormEntities, getOrgLevels, getTeams, getRoles, getEmployees } from '@/utils/form-data-init';

export default async function Home({ params, searchParams }: { params: { [key: string]: string }; searchParams: { [key: string]: string } }) {
	const supabase = createClient();

	const [contract, entities, levels, teams, roles, employees] = await Promise.all([
		searchParams.duplicate ? await supabase.from('contracts').select().match({ id: searchParams.duplicate, org: params.org }).single() : undefined,
		await getFormEntities({ org: params.org }),
		await getOrgLevels({ org: params.org }),
		await getTeams({ org: params.org }),
		await getRoles({ org: params.org }),
		await getEmployees({ org: params.org })
	]);

	const { data } = await supabase.from('org_settings').select().eq('org', params.org).single();

	return (
		<Suspense fallback={<PageLoader isLoading />}>
			<div className="mx-auto max-w-4xl">
				<div className="relative mb-4 flex items-center gap-4">
					<BackButton />

					<h1 className="text-xl font-semibold">Add person</h1>
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
					<ContractForm employeesData={employees} orgBenefits={data} contractData={contract?.data ? contract.data : undefined} entitiesData={entities as any} levels={levels} teamsData={teams} rolesData={roles} />
				</Suspense>
			</div>
		</Suspense>
	);
}
