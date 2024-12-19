import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { WorkActivity } from './task-manager/work-activity';
import { AppraisalsPage } from './appraisals';

export default async function PerformancePage(props: { params: Promise<{ [key: string]: string }>; searchParams: Promise<{ [key: string]: string }> }) {
	const params = await props.params;
	const searchParams = await props.searchParams;

	return (
		<div className="mx-auto max-w-4xl space-y-32">
			<Suspense
				fallback={
					<div className="space-y-14">
						<Skeleton className="h-40 w-full" />
						<Skeleton className="h-80 w-full" />
					</div>
				}>
				<WorkActivity paramCycleId={searchParams.cycle} org={params.org} />
			</Suspense>

			<Suspense fallback={<Skeleton className="h-80 w-full" />}>
				<AppraisalsPage org={params.org} />
			</Suspense>
		</div>
	);
}
