import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { DocumentsPage } from './documents-page';

export default async function ContractsPage(props: { params: Promise<{ [key: string]: string }>; searchParams: Promise<{ [key: string]: string }> }) {
	const org = (await props.params).org;

	return (
		<section>
			<div className="mb-8 flex items-center justify-between border-b pb-4">
				<h1 className="text-2xl font-medium">Documents</h1>
			</div>

			<Suspense
				fallback={
					<div className="grid grid-cols-1 gap-x-12 gap-y-8 sm:grid-cols-1 sm:gap-y-12 md:grid-cols-2 md:gap-y-16 lg:grid-cols-5">
						<Skeleton className="h-72 w-full" />
						<Skeleton className="h-72 w-full" />
						<Skeleton className="h-72 w-full" />
						<Skeleton className="h-72 w-full" />
						<Skeleton className="h-72 w-full" />
					</div>
				}>
				<DocumentsPage org={org} />
			</Suspense>
		</section>
	);
}
