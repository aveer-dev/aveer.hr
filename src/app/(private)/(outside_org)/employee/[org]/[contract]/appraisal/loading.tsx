import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
	return (
		<div className="space-y-14">
			<Skeleton className="h-20 w-full" />
			<Skeleton className="h-56 w-full" />
		</div>
	);
}
