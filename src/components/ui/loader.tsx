import * as React from 'react';
import { cn } from '@/lib/utils';
import { LoaderCircle } from 'lucide-react';

const spinnerVariants = 'rounded-full animate-spin text-muted-foreground';

interface LoadingSpinnerProps extends React.HTMLAttributes<SVGSVGElement> {
	className?: string;
}

const LoadingSpinner = React.forwardRef<SVGSVGElement, LoadingSpinnerProps>((props, ref) => {
	const { className, ...rest } = props;
	return <LoaderCircle size={14} ref={ref} className={cn(spinnerVariants, className)} {...rest} />;
});

LoadingSpinner.displayName = 'LoadingSpinner';

export { LoadingSpinner };
