import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
	return (
		<div className="mx-auto mt-24 max-w-3xl space-y-14 sm:mt-0">
			<Skeleton className="h-56 w-full" />
			<Skeleton className="h-56 w-full" />
		</div>
	);
}
