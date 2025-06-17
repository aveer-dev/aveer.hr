import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';
import { RequestsPageComponent } from './requests-page';

export default async function ProfilePage(props: { params: Promise<{ [key: string]: string }> }) {
	return (
		<Suspense
			fallback={
				<div className="mx-auto max-w-3xl space-y-12">
					<Skeleton className="h-56 w-full" />
					<Skeleton className="h-56 w-full" />
					<Skeleton className="h-56 w-full" />
				</div>
			}>
			<div className="mx-auto mt-24 max-w-3xl sm:mt-0">
				<h2 className="mb-16 text-4xl font-light">Requests</h2>

				<RequestsPageComponent {...props} />
			</div>
		</Suspense>
	);
}
