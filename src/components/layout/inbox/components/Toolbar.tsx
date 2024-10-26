import React, { ButtonHTMLAttributes, HTMLProps, forwardRef } from 'react';

import { cn } from '@/lib/utils';
import { Surface } from './Surface';
import { Button, ButtonProps } from '@/components/ui/button';

export type ToolbarWrapperProps = {
	shouldShowContent?: boolean;
	isVertical?: boolean;
} & HTMLProps<HTMLDivElement>;

const ToolbarWrapper = forwardRef<HTMLDivElement, ToolbarWrapperProps>(({ shouldShowContent = true, children, isVertical = false, className, ...rest }, ref) => {
	const toolbarClassName = cn('text-black inline-flex h-full leading-none gap-0.5', isVertical ? 'flex-col p-2' : 'flex-row p-1 items-center', className);

	return (
		shouldShowContent && (
			<Surface className={toolbarClassName} {...rest} ref={ref}>
				{children}
			</Surface>
		)
	);
});

ToolbarWrapper.displayName = 'Toolbar';

export type ToolbarDividerProps = {
	horizontal?: boolean;
} & HTMLProps<HTMLDivElement>;

const ToolbarDivider = forwardRef<HTMLDivElement, ToolbarDividerProps>(({ horizontal, className, ...rest }, ref) => {
	const dividerClassName = cn('bg-neutral-200 dark:bg-neutral-800', horizontal ? 'w-full min-w-[1.5rem] h-[1px] my-1 first:mt-0 last:mt-0' : 'h-full min-h-[1.5rem] w-[1px] mx-1 first:ml-0 last:mr-0', className);

	return <div className={dividerClassName} ref={ref} {...rest} />;
});

ToolbarDivider.displayName = 'Toolbar.Divider';

export type ToolbarButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	active?: boolean;
	activeClassname?: string;
	tooltip?: string;
	tooltipShortcut?: string[];
	buttonSize?: ButtonProps['size'];
	variant?: ButtonProps['variant'];
};

const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(({ children, buttonSize = 'icon', variant = 'ghost', className, tooltip, tooltipShortcut, activeClassname, ...rest }, ref) => {
	const buttonClass = cn('gap-1 min-w-[2rem] px-2 w-auto', className);

	return (
		<Button className={cn(buttonClass, rest.active && activeClassname, rest.active && 'text-blue-500 hover:text-blue-600', 'h-8 p-1')} variant={variant} ref={ref} onClick={rest.onClick}>
			{children}
		</Button>
	);
});

ToolbarButton.displayName = 'ToolbarButton';

export const Toolbar = {
	Wrapper: ToolbarWrapper,
	Divider: ToolbarDivider,
	Button: ToolbarButton
};
