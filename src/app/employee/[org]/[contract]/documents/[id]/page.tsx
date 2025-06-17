import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';
import { Separator } from '@/components/ui/separator';
import { DocumentPage } from '@/components/documents/docuement-page';

export default async function TemplatePage(props: { params: Promise<{ [key: string]: string }>; searchParams: Promise<{ [key: string]: string }> }) {
	const params = await props.params;

	return (
		<div className="mx-auto w-full max-w-5xl">
			<Suspense
				fallback={
					<div className="mx-auto w-full max-w-5xl space-y-4 px-8">
						<div className="flex items-center justify-between">
							<Skeleton className="h-9 w-80" />
							<Skeleton className="h-9 w-24" />
						</div>

						<Separator className="w-full" />

						<div>
							<Skeleton className="mb-6 h-5 w-72" />
							<Skeleton className="mb-4 h-8 w-40" />
							<Skeleton className="mb-4 h-5 w-52" />
							<Skeleton className="mb-6 h-5 w-80" />
							<Skeleton className="mb-6 h-5 w-60" />
						</div>
					</div>
				}>
				<DocumentPage org={params.org} docId={params.id} />
			</Suspense>
		</div>
	);
}
