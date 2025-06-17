import { Suspense } from 'react';
import { TeamPageComponent } from './team-page';
import { Skeleton } from '@/components/ui/skeleton';

export default async function ProfilePage(props: { params: Promise<{ [key: string]: string }> }) {
	return (
		<Suspense
			fallback={
				<div className="mx-auto max-w-3xl">
					<div>
						<Skeleton className="mb-1 h-7 w-20" />
						<Skeleton className="mb-4 h-4 w-32" />
					</div>

					<div className="space-y-4">
						<Skeleton className="h-20 w-full" />
						<Skeleton className="h-20 w-full" />
					</div>

					<div className="mt-16">
						<Skeleton className="mb-1 h-7 w-20" />
						<Skeleton className="mb-4 h-4 w-32" />
					</div>

					<div className="space-y-4">
						<Skeleton className="h-20 w-full" />
						<Skeleton className="h-20 w-full" />
					</div>
				</div>
			}>
			<div className="mx-auto mt-24 max-w-3xl sm:mt-0">
				<div className="mb-16">
					<h2 className="text-4xl font-light">
						Team <br /> & Direct Reports
					</h2>
				</div>

				<TeamPageComponent {...props} />
			</div>
		</Suspense>
	);
}
