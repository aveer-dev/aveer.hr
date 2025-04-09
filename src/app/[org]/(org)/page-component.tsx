import { Suspense } from 'react';
import { DashboardPage } from './dashboard-page';
import { Skeleton } from '@/components/ui/skeleton';
import AppHomePage from './app-home-page.tsx';

export const PageComponent = async (props: { params: Promise<{ [key: string]: string }>; searchParams: Promise<{ [key: string]: string }> }) => {
	const params = await props.params;
	const searchParams = await props.searchParams;

	return (
		<Suspense
			fallback={
				params.org === 'app' ? (
					<div className="flex h-[50vh] flex-col items-center justify-center gap-10 text-center">
						<div className="space-y-3">
							<Skeleton className="h-6 w-72" />
							<Skeleton className="h-4 w-72" />
						</div>

						<div className="mb-8 flex justify-between">
							<Skeleton className="h-9 w-32" />
							<Skeleton className="h-9 w-32" />
						</div>
					</div>
				) : (
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
				)
			}>
			{params.org === 'app' ? <AppHomePage /> : <DashboardPage org={params.org} searchParams={searchParams} />}
		</Suspense>
	);
};
