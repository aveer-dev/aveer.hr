import { Suspense } from 'react';
import { OpenRoleForm } from './form';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/utils/supabase/server';
import { TablesUpdate } from '@/type/database.types';

export default async function Home({ params, searchParams }: { params: { [key: string]: string }; searchParams: { [key: string]: string } }) {
	let roleDetails: TablesUpdate<'open_roles'> = {};

	if (searchParams.duplicate) {
		const supabase = createClient();
		const { data } = await supabase.from('open_roles').select().match({ id: searchParams.duplicate, org: params.org }).single();
		if (data) roleDetails = data;
	}

	return (
		<div className="mx-auto max-w-4xl">
			<h1 className="mb-6 text-xl font-semibold">Create a role</h1>

			<Suspense
				fallback={
					<div className="grid gap-6">
						<Skeleton className="h-60 w-full max-w-4xl"></Skeleton>
						<Skeleton className="h-60 w-full max-w-4xl"></Skeleton>
						<Skeleton className="h-60 w-full max-w-4xl"></Skeleton>
						<Skeleton className="h-60 w-full max-w-4xl"></Skeleton>
					</div>
				}>
				<OpenRoleForm duplicate={roleDetails} />
			</Suspense>
		</div>
	);
}
