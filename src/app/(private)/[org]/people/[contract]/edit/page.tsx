import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { BackButton } from '@/components/ui/back-button';
import { createClient } from '@/utils/supabase/server';
import { ContractForm } from '@/components/forms/contract/form';
import { getFormEntities, getOrgLevels, getRoles, getTeams } from '@/utils/form-data-init';

export default async function EditContractPage({ params }: { params: { [key: string]: string }; searchParams: { [key: string]: string } }) {
	const supabase = createClient();
	const [{ data, error }, entities, levels, teams, roles] = await Promise.all([
		await supabase.from('contracts').select('*, profile:profiles!contracts_profile_fkey(first_name, id, last_name, email, nationality)').match({ org: params.org, id: params.contract }).single(),
		await getFormEntities({ org: params.org }),
		await getOrgLevels({ org: params.org }),
		await getTeams({ org: params.org }),
		await getRoles({ org: params.org })
	]);

	if (error) {
		return (
			<div>
				<p className="text-center text-xs text-muted-foreground">Unable to fetch contract details. Please refresh page</p>
			</div>
		);
	}

	const manager = await supabase.from('managers').select().match({ org: params.org, person: data.id, profile: data.profile.id, team: data.team });

	return (
		<div className="mx-auto max-w-4xl">
			<div className="relative mb-6 flex items-center">
				<BackButton className="absolute -left-16" />
				<h1 className="text-xl font-semibold">Edit Contract</h1>
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
				<ContractForm contractData={data} entitiesData={entities as any} levels={levels} teamsData={teams} rolesData={roles} manager={manager} />
			</Suspense>
		</div>
	);
}
