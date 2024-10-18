import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/utils/supabase/server';
import { Todos } from '../../../todos';
import { Payments } from '../../../payments';

export default async function ContractPage({ params }: { params: { [key: string]: string } }) {
	const supabase = createClient();

	const { data, error } = await supabase
		.from('contracts')
		.select(
			'*, profile:profiles!contracts_profile_fkey(first_name, last_name, email, id, nationality:countries!profiles_nationality_fkey(country_code, name)), org:organisations!contracts_org_fkey(name, id, subdomain), entity:legal_entities!contracts_entity_fkey(name, id, incorporation_country:countries!legal_entities_incorporation_country_fkey(country_code, name, currency_code))'
		)
		.eq('id', params.contract)
		.single();

	if (error) {
		return (
			<div className="flex min-h-56 flex-col items-center justify-center gap-2 bg-muted text-center text-muted-foreground">
				<p>Unable to fetch contracts</p>
				<p>{error?.message}</p>
			</div>
		);
	}

	return (
		<Suspense
			fallback={
				<div className="grid w-full gap-6">
					<div className="flex justify-between gap-4">
						<Skeleton className="h-5 w-5" />
						<Skeleton className="h-9 w-56" />
						<Skeleton className="h-6 w-32" />
						<Skeleton className="h-5 w-20" />
						<Skeleton className="h-4 w-16" />
						<Skeleton className="h-4 w-12" />
						<Skeleton className="h-4 w-12" />
					</div>
					<div className="flex justify-between gap-4">
						<Skeleton className="h-5 w-5" />
						<Skeleton className="h-9 w-56" />
						<Skeleton className="h-6 w-32" />
						<Skeleton className="h-5 w-20" />
						<Skeleton className="h-4 w-16" />
						<Skeleton className="h-4 w-12" />
						<Skeleton className="h-4 w-12" />
					</div>
					<div className="flex justify-between gap-4">
						<Skeleton className="h-5 w-5" />
						<Skeleton className="h-9 w-56" />
						<Skeleton className="h-6 w-32" />
						<Skeleton className="h-5 w-20" />
						<Skeleton className="h-4 w-16" />
						<Skeleton className="h-4 w-12" />
						<Skeleton className="h-4 w-12" />
					</div>
					<div className="flex justify-between gap-4">
						<Skeleton className="h-5 w-5" />
						<Skeleton className="h-9 w-56" />
						<Skeleton className="h-6 w-32" />
						<Skeleton className="h-5 w-20" />
						<Skeleton className="h-4 w-16" />
						<Skeleton className="h-4 w-12" />
						<Skeleton className="h-4 w-12" />
					</div>
				</div>
			}>
			<div className="space-y-14">
				<Todos />

				<Payments contract={data as any} />
			</div>
		</Suspense>
	);
}
