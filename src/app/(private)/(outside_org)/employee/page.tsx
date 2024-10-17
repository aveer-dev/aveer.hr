import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Search, Signature } from 'lucide-react';
import { format } from 'date-fns';
import { createClient } from '@/utils/supabase/server';
import { Todos } from './todos';
import { Payments } from './payments';
import { ContractsFilter } from './contract-filter';

export default async function ContractorPage() {
	const supabase = createClient();

	const {
		data: { user },
		error: authError
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return (
			<div className="flex min-h-56 flex-col items-center justify-center gap-2 bg-muted text-center text-muted-foreground">
				<p>Unable to fetch user details</p>
				<p>{authError?.message}</p>
			</div>
		);
	}

	const { data: profileData, error: profileError } = await supabase.from('profiles').select().eq('id', user?.id);

	if (profileError) {
		return (
			<div className="flex min-h-56 flex-col items-center justify-center gap-2 bg-muted text-center text-muted-foreground">
				<p>Unable to fetch profile data</p>
				<p>{profileError?.message}</p>
			</div>
		);
	}

	const { data, error } = await supabase
		.from('contracts')
		.select(
			'*, profile:profiles!contracts_profile_fkey(first_name, last_name, email, id, nationality:countries!profiles_nationality_fkey(country_code, name)), org:organisations!contracts_org_fkey(name, id, subdomain), entity:legal_entities!contracts_entity_fkey(name, id, incorporation_country:countries!legal_entities_incorporation_country_fkey(country_code, name, currency_code))'
		)
		.eq('profile', user.id);

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
			<section className="mx-auto max-w-4xl">
				<div className="flex items-start justify-between border-b pb-8">
					<div className="space-y-1">
						<h1 className="text-2xl font-bold">Hi, Emmanuel</h1>
						<p className="text-sm font-light text-support">
							{format(new Date(), 'eeee')}, {format(new Date(), 'LLLL')} {format(new Date(), 'M')}
						</p>
					</div>

					<div className="flex items-center gap-2">
						<ContractsFilter contracts={data || []} />

						<Button className="h-8 w-8 rounded-2xl border p-0" variant={'secondary'}>
							<Search size={12} />
						</Button>
					</div>
				</div>

				<div className="mt-8 space-y-14">
					<Todos />

					<Payments contracts={(data as any[]) || []} />
				</div>
			</section>
		</Suspense>
	);
}
