import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';
import { LeavePage } from './leave-page';

export default function TimeoffPage(props: { params: Promise<{ [key: string]: string }> }) {
	return (
		<Suspense
			fallback={
				<div className="space-y-14">
					<Skeleton className="h-20 w-full" />
					<Skeleton className="h-80 w-full" />
				</div>
			}>
			<LeavePage {...props} />
		</Suspense>
	);
}
