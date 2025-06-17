import { Suspense } from 'react';
import { Contract } from '@/components/contract/contract-details';
import { Skeleton } from '@/components/ui/skeleton';

export default async function ContractPage(props: { params: Promise<{ [key: string]: string }>; searchParams: Promise<{ [key: string]: string }> }) {
	const params = await props.params;

	return (
		<Suspense
			fallback={
				<div className="mx-auto grid w-full max-w-4xl gap-10 p-6 pt-0">
					<div className="flex justify-between">
						<div className="flex gap-4">
							<Skeleton className="h-10 w-10 rounded-full" />

							<div className="grid gap-4">
								<div className="flex gap-4">
									<Skeleton className="h-7 w-48" />
									<Skeleton className="h-7 w-16" />
								</div>
								<Skeleton className="h-4 w-10" />
							</div>
						</div>

						<Skeleton className="h-9 w-32" />
					</div>

					<Skeleton className="h-9 w-full max-w-2xl" />

					<div className="grid gap-16">
						<div>
							<Skeleton className="mb-4 h-9 w-44" />
							<div className="grid grid-cols-2 border-t border-t-border pt-6">
								<div>
									<Skeleton className="mb-6 h-5 w-20" />
									<Skeleton className="mb-4 h-8 w-40" />
									<Skeleton className="mb-4 h-5 w-28" />
									<Skeleton className="mb-6 h-5 w-44" />
									<Skeleton className="mb-6 h-5 w-36" />
								</div>
								<div>
									<Skeleton className="mb-6 h-5 w-20" />
									<Skeleton className="mb-4 h-8 w-40" />
									<Skeleton className="mb-4 h-5 w-28" />
									<Skeleton className="mb-6 h-5 w-44" />
									<Skeleton className="mb-6 h-5 w-36" />
								</div>
							</div>
						</div>

						<div>
							<Skeleton className="mb-4 h-9 w-44" />
							<div className="grid grid-cols-2 gap-x-5 gap-y-10 border-t border-t-border pt-6">
								<div>
									<Skeleton className="mb-6 h-5 w-20" />
									<Skeleton className="mb-6 h-5 w-44" />
								</div>
								<div>
									<Skeleton className="mb-6 h-5 w-20" />
									<Skeleton className="mb-6 h-5 w-36" />
								</div>
								<div>
									<Skeleton className="mb-6 h-5 w-20" />
									<Skeleton className="mb-6 h-5 w-44" />
								</div>
								<div>
									<Skeleton className="mb-6 h-5 w-20" />
									<Skeleton className="mb-6 h-5 w-36" />
								</div>
							</div>

							<div className="mt-10">
								<Skeleton className="mb-6 h-7 w-56" />
								<Skeleton className="mb-4 h-5 w-96" />
								<Skeleton className="mb-4 h-5 w-full max-w-xl" />
								<Skeleton className="mb-4 h-5 w-full max-w-lg" />
								<Skeleton className="mb-4 h-5 w-full max-w-xl" />
								<Skeleton className="mb-4 h-5 w-full max-w-2xl" />
							</div>
						</div>

						<div>
							<Skeleton className="mb-4 h-9 w-44" />
							<div className="grid grid-cols-2 border-t border-t-border pt-6">
								<div>
									<Skeleton className="mb-6 h-5 w-20" />
									<Skeleton className="mb-4 h-8 w-40" />
									<Skeleton className="mb-4 h-5 w-28" />
									<Skeleton className="mb-6 h-5 w-44" />
									<Skeleton className="mb-6 h-5 w-36" />
								</div>
								<div>
									<Skeleton className="mb-6 h-5 w-20" />
									<Skeleton className="mb-4 h-8 w-40" />
									<Skeleton className="mb-4 h-5 w-28" />
									<Skeleton className="mb-6 h-5 w-44" />
									<Skeleton className="mb-6 h-5 w-36" />
								</div>
							</div>
						</div>

						<div>
							<Skeleton className="mb-4 h-9 w-44" />
							<div className="grid grid-cols-2 border-t border-t-border pt-6">
								<div>
									<Skeleton className="mb-6 h-5 w-20" />
									<Skeleton className="mb-4 h-8 w-40" />
									<Skeleton className="mb-4 h-5 w-28" />
									<Skeleton className="mb-6 h-5 w-44" />
									<Skeleton className="mb-6 h-5 w-36" />
								</div>
								<div>
									<Skeleton className="mb-6 h-5 w-20" />
									<Skeleton className="mb-4 h-8 w-40" />
									<Skeleton className="mb-4 h-5 w-28" />
									<Skeleton className="mb-6 h-5 w-44" />
									<Skeleton className="mb-6 h-5 w-36" />
								</div>
							</div>
						</div>
					</div>
				</div>
			}>
			<Contract org={params.org} id={params.contract} signatureType={'org'} />
		</Suspense>
	);
}
