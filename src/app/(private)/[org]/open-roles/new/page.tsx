import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/utils/supabase/server';
import { TablesUpdate } from '@/type/database.types';
import { BackButton } from '@/components/ui/back-button';
import { ContractForm } from '@/components/forms/contract/form';

export default async function Home({ params, searchParams }: { params: { [key: string]: string }; searchParams: { [key: string]: string } }) {
	let roleDetails: TablesUpdate<'open_roles'> = {};

	if (searchParams.duplicate) {
		const supabase = createClient();
		const { data } = await supabase.from('open_roles').select().match({ id: searchParams.duplicate, org: params.org }).single();
		if (data) roleDetails = data;
	}

	return (
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
				<ContractForm formType="role" openRoleDuplicate={roleDetails} />
			</Suspense>
		</div>
	);
}
