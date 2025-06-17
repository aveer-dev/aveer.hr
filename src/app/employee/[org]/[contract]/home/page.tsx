import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

import HomePageComponent from './home-page';

export default async function ContractPage(props: { params: Promise<{ [key: string]: string }> }) {
	return (
		<Suspense
			fallback={
				<div className="mx-auto max-w-3xl space-y-14">
					<Skeleton className="h-40 w-full" />
					<Skeleton className="h-80 w-full" />
					<Skeleton className="h-32 w-full" />
				</div>
			}>
			<HomePageComponent params={props.params} />
		</Suspense>
	);
}
