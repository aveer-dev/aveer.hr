import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function ContractsPage() {
	return (
		<section>
			<div className="mb-8 flex items-center justify-between border-b pb-4">
				<h1 className="text-2xl font-medium">Templates</h1>

				<Button>New template</Button>
			</div>

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
				<ul className="grid grid-cols-4 gap-x-20 gap-y-16">
					<Link href={'./templates/new'} passHref legacyBehavior>
						<li className="flex h-72 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-blue-400 transition-all duration-500 hover:border-solid">
							<Plus size="12" /> New template
						</li>
					</Link>

					<Link href={'./templates/123'} passHref legacyBehavior>
						<li className="flex h-72 cursor-pointer flex-col items-center justify-center rounded-md border border-secondary bg-accent/50 text-left text-sm font-light drop-shadow-sm transition-all duration-500 hover:drop-shadow">
							<div className="space-y-2">
								<div>Employment Agreement</div>
								<div className="text-xs text-muted-foreground">Created: 12th May, 2023</div>
							</div>
						</li>
					</Link>
				</ul>
			</Suspense>
		</section>
	);
}
