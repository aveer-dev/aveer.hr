import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/utils/supabase/server';
import { Todos } from './todo/todos';
import { Payments } from './payments';
import { Tables } from '@/type/database.types';
import { Info, Undo2 } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default async function ContractPage(props: { params: Promise<{ [key: string]: string }> }) {
	const params = await props.params;
	const supabase = await createClient();

	const { data, error } = await supabase
		.from('contracts')
		.select(
			'*, profile:profiles!contracts_profile_fkey(*), org:organisations!contracts_org_fkey(name, id, subdomain), entity:legal_entities!contracts_entity_fkey(name, id, incorporation_country:countries!legal_entities_incorporation_country_fkey(country_code, name, currency_code))'
		)
		.eq('id', Number(params.contract))
		.single();

	if (error) {
		return (
			<div className="flex min-h-56 flex-col items-center justify-center gap-2 bg-muted text-center text-muted-foreground">
				<p>Unable to fetch contracts</p>
				<p>{error?.message}</p>
				<Link href={'/app/login'} className={cn(buttonVariants(), 'mt-6 gap-4')}>
					<Undo2 size={12} />
					Go to login
				</Link>
			</div>
		);
	}

	return (
		<Suspense
			fallback={
				<div className="space-y-14">
					<Skeleton className="h-40 w-full" />
					<Skeleton className="h-80 w-full" />
					<Skeleton className="h-32 w-full" />
				</div>
			}>
			{(data.status == 'awaiting org signature' || data.status == 'awaiting signature' || data.status == 'awaiting signatures') && (
				<div className="mb-5 flex w-full items-end justify-between gap-5 rounded-sm border border-accent bg-accent px-3 py-2 text-xs font-thin">
					<div className="flex gap-3">
						<Info size={16} />

						{data.status == 'awaiting org signature'
							? `Your employee portal is pending approval from a rep at ${data.org.name}`
							: `You'll need to sign the contract with ${data.org.name} to use this employee platforn. Click on review contract to review and sign the contract.`}
					</div>

					{(data.status == 'awaiting signature' || data.status == 'awaiting signatures') && (
						<Link className={cn(buttonVariants())} href={`./contract`}>
							Review contract
						</Link>
					)}
				</div>
			)}

			<div className="space-y-14">
				<Todos profile={data.profile as Tables<'profiles'>} contract={data as any} profileId={data.profile?.id} org={params.org} team={data.team as number} />

				<Payments contract={data as any} />
			</div>
		</Suspense>
	);
}
