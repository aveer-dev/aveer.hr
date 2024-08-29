import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/utils/supabase/server';
import { TablesUpdate } from '@/type/database.types';
import { BackButton } from '@/components/ui/back-button';
import { ContractForm } from '@/components/forms/contract/form';
import { PageLoader } from '@/components/ui/page-loader';

export default async function Home({ params, searchParams }: { params: { [key: string]: string }; searchParams: { [key: string]: string } }) {
	let roleDetails: TablesUpdate<'open_roles'> = {};
	const supabase = createClient();

	if (searchParams.duplicate) {
		const { data } = await supabase.from('open_roles').select().match({ id: searchParams.duplicate, org: params.org }).single();
		if (data) roleDetails = data;
	}

	const { data } = await supabase.from('org_settings').select().eq('org', params.org).single();

	return (
		<Suspense fallback={<PageLoader isLoading />}>
			<div className="mx-auto max-w-4xl">
				<div className="relative">
					<BackButton className="absolute -left-16" />
					<h1 className="mb-6 text-xl font-semibold">Create a role</h1>
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
					<ContractForm orgBenefits={data} formType="role" openRoleDuplicate={roleDetails} />
				</Suspense>
			</div>
		</Suspense>
	);
}
