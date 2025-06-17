import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
	return (
		<div className="mx-auto max-w-3xl space-y-12">
			<Skeleton className="h-20 w-full" />
			<Skeleton className="h-56 w-full" />
			<Skeleton className="h-56 w-full" />
			<Skeleton className="h-56 w-full" />
		</div>
	);
}
