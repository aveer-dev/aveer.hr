import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex font-light items-center rounded-full border px-2.5 py-0.5 text-xs transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2', {
	variants: {
		variant: {
			default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
			secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
			'secondary-destructive': 'border-transparent bg-destructive/10 text-destructive hover:bg-destructive/15',
			destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
			'secondary-success': 'border-transparent border-green-300 bg-green-50 text-green-500 hover:bg-green-100',
			'secondary-warn': 'border-transparent border-orange-300 bg-orange-50 text-orange-500 hover:bg-orange-100',
			outline: 'text-foreground'
		}
	},
	defaultVariants: {
		variant: 'default'
	}
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
	return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
