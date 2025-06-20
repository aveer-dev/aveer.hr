import { Suspense } from 'react';
import AppraisalsPageComponent from './page-component';
import { Skeleton } from '@/components/ui/skeleton';

export default function AppraisalsPage(props: { params: Promise<{ [key: string]: string }> }) {
	return (
		<Suspense
			fallback={
				<div className="space-y-14">
					<Skeleton className="h-11 w-full" />
					<Skeleton className="h-11 w-full" />
					<Skeleton className="h-11 w-full" />
					<Skeleton className="h-11 w-full" />
				</div>
			}>
			<AppraisalsPageComponent params={props.params} />
		</Suspense>
	);
}
