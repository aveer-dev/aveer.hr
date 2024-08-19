import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/utils/supabase/server';
import { OpenRoleForm } from '../../new/form';
import { BackButton } from '@/components/ui/back-button';

export default async function EditContractPage({ params }: { params: { [key: string]: string }; searchParams: { [key: string]: string } }) {
	const supabase = createClient();
	const { data, error } = await supabase.from('open_roles').select().match({ org: params.org, id: params.role }).single();

	if (error) {
		return (
			<div className="flex h-[50vh] flex-col items-center justify-center text-center">
				<p className="text-xs">Unable to fetch roles, please refresh page to try again</p>
				<p className="mt-6 text-xs text-muted-foreground">{error.message}</p>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-4xl">
			<div className="relative">
				<BackButton className="absolute -left-16" />
				<h1 className="mb-6 text-xl font-semibold">Edit Open Role</h1>
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
				<OpenRoleForm data={data} />
			</Suspense>
		</div>
	);
}
