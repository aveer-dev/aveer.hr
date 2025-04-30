import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { NewPersonPage } from './page-component';

export default function Home(props: { params: Promise<{ [key: string]: string }>; searchParams: Promise<{ [key: string]: string }> }) {
	return (
		<div className="mx-auto max-w-4xl">
			<div className="relative mb-4 flex items-center gap-4">
				<h1 className="text-xl font-semibold">Add person</h1>
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
				<NewPersonPage param={props} />
			</Suspense>
		</div>
	);
}
