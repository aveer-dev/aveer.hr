import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { FileManagement } from '@/components/file-manager/files-page.component';

export default function FilesPage({ params }: { params: Promise<{ [key: string]: string }> }) {
	return (
		<div className="h-full w-full">
			<Suspense fallback={<Skeleton className="h-full min-h-[300px] w-full" />}>
				<FileManagement role="admin" params={params} />
			</Suspense>
		</div>
	);
}
