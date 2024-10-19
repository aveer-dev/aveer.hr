import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
	return (
		<div className="w-full space-y-12">
			<Skeleton className="h-40 w-full" />
			<Skeleton className="h-80 w-full" />
			<Skeleton className="h-80 w-full" />
		</div>
	);
}
