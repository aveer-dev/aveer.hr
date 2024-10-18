import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/utils/supabase/server';
import { Todos } from './todos';
import { Payments } from './payments';
import { Tables } from '@/type/database.types';

export default async function ContractPage({ params }: { params: { [key: string]: string } }) {
	const supabase = createClient();

	const { data, error } = await supabase
		.from('contracts')
		.select(
			'*, profile:profiles!contracts_profile_fkey(*), org:organisations!contracts_org_fkey(name, id, subdomain), entity:legal_entities!contracts_entity_fkey(name, id, incorporation_country:countries!legal_entities_incorporation_country_fkey(country_code, name, currency_code))'
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
				<div className="space-y-14">
					<Skeleton className="h-20 w-full" />
					<Skeleton className="h-80 w-full" />
					<Skeleton className="h-32 w-full" />
				</div>
			}>
			<div className="space-y-14">
				<Todos profile={data.profile as Tables<'profiles'>} profileId={data.profile?.id} org={params.org} contractId={data.id} team={data.team as number} />

				<Payments contract={data as any} />
			</div>
		</Suspense>
	);
}
