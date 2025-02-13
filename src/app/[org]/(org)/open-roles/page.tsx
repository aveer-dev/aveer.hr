import { Roles } from '@/components/open-role';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';

export default async function OpenRolesPage(props: { params: Promise<{ [key: string]: string }>; searchParams: Promise<{ [key: string]: string }> }) {
	return (
		<Suspense
			fallback={
				<div>
					<div className="mb-14 flex items-center justify-between">
						<Skeleton className="h-9 w-40" />
						<Skeleton className="h-9 w-96" />
					</div>

					<div className="mb-16 space-y-5">
						<Skeleton className="h-16 w-full" />
						<Skeleton className="h-16 w-full" />
						<Skeleton className="h-16 w-full" />
						<Skeleton className="h-16 w-full" />
						<Skeleton className="h-16 w-full" />
					</div>
				</div>
			}>
			<Roles type={'role'} orgId={(await props.params).org} />
		</Suspense>
	);
}
