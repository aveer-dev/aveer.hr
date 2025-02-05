import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';
import { LeavePage } from './leave-page';

export default async function TimeoffPage(props: { params: Promise<{ [key: string]: string }> }) {
	const params = await props.params;

	return (
		<Suspense
			fallback={
				<div className="space-y-14">
					<Skeleton className="h-20 w-full" />
					<Skeleton className="h-80 w-full" />
				</div>
			}>
			<LeavePage contract={params.contract} org={params.org} />
		</Suspense>
	);
}
