import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
	return (
		<div className="space-y-12">
			<Skeleton className="h-56 w-full" />
			<Skeleton className="h-56 w-full" />
			<Skeleton className="h-56 w-full" />
		</div>
	);
}
