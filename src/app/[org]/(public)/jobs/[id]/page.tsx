'use server';

import { Suspense } from 'react';
import { RoleDetails } from '@/components/open-role';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

export default async function JobPage(props: { params: Promise<{ [key: string]: string }>; searchParams: Promise<{ [key: string]: string }> }) {
	const params = await props.params;
	return (
		<Suspense
			fallback={
				<div>
					<div className="mb-16 space-y-3">
						<Skeleton className="h-8 w-96" />
						<Skeleton className="h-4 w-96" />
					</div>

					<div>
						<Skeleton className="h-6 w-28" />
						<Separator className="mb-8 mt-4 w-full" />
						<Skeleton className="h-72 w-full" />
						<Skeleton className="mt-10 h-72 w-full" />
						<Skeleton className="mt-10 h-72 w-full" />
					</div>
				</div>
			}>
			<RoleDetails type={'job'} orgId={params.org} role={params.id} />
		</Suspense>
	);
}
