import { Skeleton } from '@/components/ui/skeleton';

export const HeaderLoader = () => {
	return (
		<header className="sticky top-0 z-20 h-[120px] w-full bg-background shadow-sm">
			<div className="flex items-center justify-between px-6 py-4">
				<div className="flex items-center gap-3">
					<Skeleton className="h-7 w-[68px]" />
					<Skeleton className="h-7 w-28" />
				</div>

				<Skeleton className="h-8 w-28" />
			</div>

			<div className="flex items-center gap-4 px-6 pt-4">
				<Skeleton className="h-10 w-28" />
				<Skeleton className="h-10 w-28" />
				<Skeleton className="h-10 w-28" />
				<Skeleton className="h-10 w-28" />
				<Skeleton className="h-10 w-28" />
				<Skeleton className="h-10 w-28" />
				<Skeleton className="h-10 w-28" />
				<Skeleton className="h-10 w-28" />
				<Skeleton className="ml-auto h-10 w-28" />
			</div>
		</header>
	);
};
