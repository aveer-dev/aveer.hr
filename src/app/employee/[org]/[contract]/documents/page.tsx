import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { DocumentsPage } from './documents-page';

export default async function ContractsPage(props: { params: Promise<{ [key: string]: string }>; searchParams: Promise<{ [key: string]: string }> }) {
	const org = (await props.params).org;
	const contract = (await props.params).contract;

	return (
		<section className="@container">
			<Suspense
				fallback={
					<div className="grid grid-cols-1 gap-x-12 gap-y-8 @sm:grid-cols-1 @sm:gap-y-12 @md:grid-cols-3 @md:gap-y-16 @[49rem]:grid-cols-5">
						<Skeleton className="h-72 w-full" />
						<Skeleton className="h-72 w-full" />
						<Skeleton className="h-72 w-full" />
						<Skeleton className="h-72 w-full" />
						<Skeleton className="h-72 w-full" />
					</div>
				}>
				<DocumentsPage contract={Number(contract)} org={org} />
			</Suspense>
		</section>
	);
}
