import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
	'inline-flex duration-500 transition-all items-center justify-center whitespace-nowrap rounded-md text-xs font-light ring-offset-background transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring focus:ring-ring focus:!ring-1 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50',
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground hover:bg-primary/90',
				destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
				secondary_destructive: 'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:ring-destructive focus:ring-destructive',
				outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
				secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
				ghost: 'hover:bg-accent hover:text-accent-foreground',
				ghost_destructive: 'hover:bg-destructive/10 hover:text-destructive text-destructive focus-visible:ring-destructive focus:ring-destructive',
				link: 'text-primary underline-offset-4 hover:underline'
			},
			size: {
				default: 'h-10 px-4 py-2',
				sm: 'h-9 rounded-md px-3',
				lg: 'h-11 rounded-md px-8',
				icon: 'h-10 w-10'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'sm'
		}
	}
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps & { tooltipShortcut?: string[]; tooltip?: string; tooltipClassName?: string }>(({ tooltipShortcut, tooltip, tooltipClassName, className, variant, size, asChild = false, ...props }, ref) => {
	const Comp = asChild ? Slot : 'button';

	if (tooltip) {
		return (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
					</TooltipTrigger>

					<TooltipContent shortcut={tooltipShortcut}>
						<p className={cn(tooltipClassName)}>{tooltip}</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	}

	return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = 'Button';

export { Button, buttonVariants };
