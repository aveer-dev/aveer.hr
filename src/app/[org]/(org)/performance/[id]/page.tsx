import { Suspense } from 'react';
import { AppraisalDetails } from './appraisal-details';
import { Skeleton } from '@/components/ui/skeleton';

export default async function AppraisalCyclePage({ params }: { params: Promise<{ [key: string]: string }> }) {
	const { org, id } = await params;

	return (
		<Suspense fallback={<Skeleton className="h-[calc(100vh-10rem)]" />}>
			<AppraisalDetails org={org} id={id} />
		</Suspense>
	);
}
