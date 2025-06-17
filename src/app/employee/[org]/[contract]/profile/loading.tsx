import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
	return (
		<div className="mx-auto w-full max-w-3xl space-y-12">
			<Skeleton className="h-40 w-full" />
			<Skeleton className="h-80 w-full" />
			<Skeleton className="h-80 w-full" />
		</div>
	);
}
