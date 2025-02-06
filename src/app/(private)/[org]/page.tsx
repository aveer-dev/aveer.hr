import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardPage } from './dashboard-page';

export default async function OrgPage(props: { params: Promise<{ [key: string]: string }>; searchParams: Promise<{ [key: string]: string }> }) {
	const params = await props.params;

	return (
		<section className="mx-auto">
			<Suspense
				fallback={
					<div>
						<div className="mb-20 flex gap-20">
							<Skeleton className="h-44 w-full max-w-40" />
							<Skeleton className="h-44 w-full max-w-40" />
						</div>

						<div className="mb-20">
							<div className="mb-8 flex justify-between">
								<Skeleton className="h-9 w-full max-w-40" />
								<Skeleton className="h-9 w-full max-w-40" />
							</div>

							<Skeleton className="h-32 w-full" />
						</div>

						<Skeleton className="h-96 w-full" />
					</div>
				}>
				<DashboardPage org={params.org} />
			</Suspense>
		</section>
	);
}
