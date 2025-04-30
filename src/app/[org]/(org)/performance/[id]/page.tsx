import { Suspense } from 'react';
import { AppraisalDetails } from './appraisal-details';
import { Skeleton } from '@/components/ui/skeleton';

export default function AppraisalCyclePage({ params }: { params: Promise<{ [key: string]: string }> }) {
	return (
		<Suspense fallback={<Skeleton className="h-[calc(100vh-10rem)]" />}>
			<AppraisalDetails params={params} />
		</Suspense>
	);
}
