import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';
import { AppraisalsPage } from '../appraisals';

export default function SettingsPage({ params }: { params: Promise<{ [key: string]: string }> }) {
	return (
		<div className="mx-auto space-y-32">
			<Suspense fallback={<Skeleton className="h-80 w-full" />}>
				<AppraisalsPage params={params} />
			</Suspense>
		</div>
	);
}
