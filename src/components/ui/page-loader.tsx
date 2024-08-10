import { cn } from '@/lib/utils';
import { LoadingSpinner } from './loader';
import { ReactNode } from 'react';

export const PageLoader = ({ isLoading, children }: { isLoading?: boolean; children?: ReactNode }) => {
	return (
		<div className={cn('pointer-events-none fixed bottom-0 left-0 right-0 top-0 z-10 flex items-center justify-center bg-accent/40 text-sm text-foreground transition-all duration-500', isLoading ? 'opacity-100 backdrop-blur-sm' : 'opacity-0 backdrop-blur-0')}>
			<div className="flex items-center gap-2">
				<LoadingSpinner />
				{children}
			</div>
		</div>
	);
};
