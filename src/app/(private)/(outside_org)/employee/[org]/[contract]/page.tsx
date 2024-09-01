import { Suspense } from 'react';
import { Contract } from '@/components/contract/contract-details';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/utils/supabase/server';
import { Details } from '@/components/ui/details';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InfoIcon } from 'lucide-react';

export default async function ContractPage({ params }: { params: { [key: string]: string }; searchParams: { [key: string]: string } }) {
	const supabase = createClient();
	const { data, error } = await supabase
		.from('contracts')
		.select(
			'*, organisations(id, name), level:employee_levels!contracts_level_fkey(level, role), entity:legal_entities!contracts_entity_fkey(incorporation_country, address_state, street_address, address_code), profile:profiles!contracts_profile_fkey(first_name, last_name, email, nationality), signed_by:profiles!contracts_signed_by_fkey(first_name, last_name, email), terminated_by:profiles!contracts_terminated_by_fkey(first_name, last_name, email)'
		)
		.match({ org: params.org, id: params.contract })
		.single();

	return (
		<Suspense
			fallback={
				<div className="mx-auto grid w-full max-w-4xl gap-10 p-6 pt-0">
					<div className="flex justify-between">
						<div className="flex gap-4">
							<Skeleton className="h-10 w-10 rounded-full" />

							<div className="grid gap-4">
								<div className="flex gap-4">
									<Skeleton className="h-7 w-48" />
									<Skeleton className="h-7 w-16" />
								</div>
								<Skeleton className="h-4 w-10" />
							</div>
						</div>

						<Skeleton className="h-9 w-32" />
					</div>

					<Skeleton className="h-9 w-full max-w-2xl" />

					<div className="grid gap-16">
						<div>
							<Skeleton className="mb-4 h-9 w-44" />
							<div className="grid grid-cols-2 border-t border-t-border pt-6">
								<div>
									<Skeleton className="mb-6 h-5 w-20" />
									<Skeleton className="mb-4 h-8 w-40" />
									<Skeleton className="mb-4 h-5 w-28" />
									<Skeleton className="mb-6 h-5 w-44" />
									<Skeleton className="mb-6 h-5 w-36" />
								</div>
								<div>
									<Skeleton className="mb-6 h-5 w-20" />
									<Skeleton className="mb-4 h-8 w-40" />
									<Skeleton className="mb-4 h-5 w-28" />
									<Skeleton className="mb-6 h-5 w-44" />
									<Skeleton className="mb-6 h-5 w-36" />
								</div>
							</div>
						</div>

						<div>
							<Skeleton className="mb-4 h-9 w-44" />
							<div className="grid grid-cols-2 gap-x-5 gap-y-10 border-t border-t-border pt-6">
								<div>
									<Skeleton className="mb-6 h-5 w-20" />
									<Skeleton className="mb-6 h-5 w-44" />
								</div>
								<div>
									<Skeleton className="mb-6 h-5 w-20" />
									<Skeleton className="mb-6 h-5 w-36" />
								</div>
								<div>
									<Skeleton className="mb-6 h-5 w-20" />
									<Skeleton className="mb-6 h-5 w-44" />
								</div>
								<div>
									<Skeleton className="mb-6 h-5 w-20" />
									<Skeleton className="mb-6 h-5 w-36" />
								</div>
							</div>

							<div className="mt-10">
								<Skeleton className="mb-6 h-7 w-56" />
								<Skeleton className="mb-4 h-5 w-96" />
								<Skeleton className="mb-4 h-5 w-full max-w-xl" />
								<Skeleton className="mb-4 h-5 w-full max-w-lg" />
								<Skeleton className="mb-4 h-5 w-full max-w-xl" />
								<Skeleton className="mb-4 h-5 w-full max-w-2xl" />
							</div>
						</div>

						<div>
							<Skeleton className="mb-4 h-9 w-44" />
							<div className="grid grid-cols-2 border-t border-t-border pt-6">
								<div>
									<Skeleton className="mb-6 h-5 w-20" />
									<Skeleton className="mb-4 h-8 w-40" />
									<Skeleton className="mb-4 h-5 w-28" />
									<Skeleton className="mb-6 h-5 w-44" />
									<Skeleton className="mb-6 h-5 w-36" />
								</div>
								<div>
									<Skeleton className="mb-6 h-5 w-20" />
									<Skeleton className="mb-4 h-8 w-40" />
									<Skeleton className="mb-4 h-5 w-28" />
									<Skeleton className="mb-6 h-5 w-44" />
									<Skeleton className="mb-6 h-5 w-36" />
								</div>
							</div>
						</div>

						<div>
							<Skeleton className="mb-4 h-9 w-44" />
							<div className="grid grid-cols-2 border-t border-t-border pt-6">
								<div>
									<Skeleton className="mb-6 h-5 w-20" />
									<Skeleton className="mb-4 h-8 w-40" />
									<Skeleton className="mb-4 h-5 w-28" />
									<Skeleton className="mb-6 h-5 w-44" />
									<Skeleton className="mb-6 h-5 w-36" />
								</div>
								<div>
									<Skeleton className="mb-6 h-5 w-20" />
									<Skeleton className="mb-4 h-8 w-40" />
									<Skeleton className="mb-4 h-5 w-28" />
									<Skeleton className="mb-6 h-5 w-44" />
									<Skeleton className="mb-6 h-5 w-36" />
								</div>
							</div>
						</div>
					</div>
				</div>
			}>
			<Contract org={params.org} id={params.contract} signatureType={'profile'} />

			{/* <section className="mx-auto mt-6 grid max-w-4xl gap-10 p-6 pt-0">
				<Tabs defaultValue="overview" className="grid gap-6">
					<TabsList className="grid w-fit grid-cols-2">
						<TabsTrigger value="overview">Overview</TabsTrigger>
						<TabsTrigger value="contract">Contract</TabsTrigger>
					</TabsList>

					<TabsContent value="overview"></TabsContent>

					<TabsContent value="contract" className="grid gap-10">
						<div className="flex w-fit items-center gap-3 rounded-sm border border-accent bg-accent px-3 py-2 text-xs font-thin">
							<InfoIcon size={12} />
							{`You can not edit your contract details. You'd need to reachout to your contact or manager to request an edit/change`}
						</div>

						<Details formType="contract" data={data} />
					</TabsContent>
				</Tabs>
			</section> */}
		</Suspense>
	);
}
