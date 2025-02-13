import { Suspense } from 'react';
import { ApplicantsPageComponent } from './applicants-page';
import { Skeleton } from '@/components/ui/skeleton';

export default async function ApplicantsPage(props: { params: Promise<{ [key: string]: string }> }) {
	const params = await props.params;

	return (
		<div>
			<div className="mb-6 flex w-full items-center justify-between border-b pb-3">
				<h1 className="text-2xl font-medium">Role Applicants</h1>
			</div>

			<Suspense
				fallback={
					<div className="flex gap-16">
						<div className="space-y-7">
							<Skeleton className="h-44 w-72" />
							<Skeleton className="h-44 w-72" />
							<Skeleton className="h-44 w-72" />
						</div>
						<div className="space-y-7">
							<Skeleton className="h-44 w-72" />
							<Skeleton className="h-44 w-72" />
							<Skeleton className="h-44 w-72" />
						</div>
						<div className="space-y-7">
							<Skeleton className="h-44 w-72" />
							<Skeleton className="h-44 w-72" />
							<Skeleton className="h-44 w-72" />
						</div>
					</div>
				}>
				<ApplicantsPageComponent org={params.org} roleId={params.role} />
			</Suspense>
		</div>
	);
}
