import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfilePageComponent } from './profile-page';

export default function ProfilePage(props: { params: Promise<{ [key: string]: string }> }) {
	return (
		<Suspense
			fallback={
				<div className="mx-auto max-w-3xl space-y-12">
					<Skeleton className="h-40 w-full" />
					<Skeleton className="h-80 w-full" />
					<Skeleton className="h-80 w-full" />
				</div>
			}>
			<ProfilePageComponent {...props} />
		</Suspense>
	);
}
