import { Suspense } from 'react';
import { ContractorTableComponent } from './contractor-table.component';
import { Skeleton } from '@/components/ui/skeleton';

export default async function ContractorPage() {
	return (
		<div className="grid gap-5">
			<h1 className="text-2xl font-medium">Contracts</h1>

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
				<ContractorTableComponent />
			</Suspense>
		</div>
	);
}
