import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { EditContractFormComponent } from './form.component';

export default async function EditContractPage({ params }: { params: { [key: string]: string }; searchParams: { [key: string]: string } }) {
	return (
		<div className="mx-auto max-w-4xl">
			<h1 className="mb-6 text-xl font-semibold">Edit Contract</h1>

			<Suspense
				fallback={
					<div className="grid gap-6">
						<Skeleton className="h-60 w-full max-w-4xl"></Skeleton>
						<Skeleton className="h-60 w-full max-w-4xl"></Skeleton>
						<Skeleton className="h-60 w-full max-w-4xl"></Skeleton>
						<Skeleton className="h-60 w-full max-w-4xl"></Skeleton>
					</div>
				}>
				<EditContractFormComponent org={params.org} id={params.contract} />
			</Suspense>
		</div>
	);
}
