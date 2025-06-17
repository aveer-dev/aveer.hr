import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { FilesPageComponent } from './files-page';

export default async function ProfilePage(props: { params: Promise<{ [key: string]: string }> }) {
	return (
		<Suspense fallback={<Skeleton className="h-full min-h-[300px] w-full" />}>
			<div className="mx-auto mt-24 w-full sm:mt-0">
				<h2 className="mb-16 text-4xl font-light">Files</h2>

				<FilesPageComponent {...props} />
			</div>
		</Suspense>
	);
}
