import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { EditContractFormComponent } from './form.component';
import { BackButton } from '@/components/ui/back-button';

export default async function EditContractPage({ params }: { params: { [key: string]: string }; searchParams: { [key: string]: string } }) {
	return (
		<div className="mx-auto max-w-4xl">
			<div className="relative mb-6 flex items-center">
				<BackButton className="absolute -left-16" />
				<h1 className="text-xl font-semibold">Edit Contract</h1>
			</div>

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
