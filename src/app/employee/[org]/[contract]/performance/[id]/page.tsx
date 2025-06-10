import { Suspense } from 'react';
import AppraisalPageComponent from './page-component';
import { Skeleton } from '@/components/ui/skeleton';

export default function PerformancePage(props: { params: Promise<{ [key: string]: string }> }) {
	return (
		<Suspense
			fallback={
				<div className="space-y-14">
					<Skeleton className="h-11 w-full" />
					<Skeleton className="h-11 w-full" />
					<Skeleton className="h-11 w-full" />
				</div>
			}>
			<AppraisalPageComponent params={props.params} />
		</Suspense>
	);
}
