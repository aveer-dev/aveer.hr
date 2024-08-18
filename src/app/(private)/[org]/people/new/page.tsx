import { Suspense } from 'react';
import { AddPerson } from './form';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/utils/supabase/server';
import { TablesUpdate } from '@/type/database.types';

export default async function Home({ params, searchParams }: { params: { [key: string]: string }; searchParams: { [key: string]: string } }) {
	let contractDetails: TablesUpdate<'contracts'> = {};

	if (searchParams.duplicate) {
		const supabase = createClient();
		const { data } = await supabase.from('contracts').select().match({ id: searchParams.duplicate, org: params.org }).single();
		if (data) contractDetails = data;
	}

	return (
		<div className="mx-auto max-w-4xl">
			<h1 className="mb-6 text-xl font-semibold">Add person</h1>

			<Suspense
				fallback={
					<div className="grid gap-6">
						<Skeleton className="h-60 w-full max-w-4xl"></Skeleton>
						<Skeleton className="h-60 w-full max-w-4xl"></Skeleton>
						<Skeleton className="h-60 w-full max-w-4xl"></Skeleton>
						<Skeleton className="h-60 w-full max-w-4xl"></Skeleton>
					</div>
				}>
				<AddPerson duplicate={contractDetails} />
			</Suspense>
		</div>
	);
}
