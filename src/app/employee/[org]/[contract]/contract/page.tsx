'use server';

import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';
import { ContractPageComponent } from './contract-page';

export default async function ProfilePage(props: { params: Promise<{ [key: string]: string }> }) {
	return (
		<Suspense
			fallback={
				<div className="mx-auto max-w-3xl space-y-12">
					<Skeleton className="h-20 w-full" />
					<Skeleton className="h-56 w-full" />
					<Skeleton className="h-56 w-full" />
					<Skeleton className="h-56 w-full" />
				</div>
			}>
			<ContractPageComponent {...props} />
		</Suspense>
	);
}
