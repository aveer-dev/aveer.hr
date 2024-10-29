'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from '@/lib/utils';

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const isMac = typeof window !== 'undefined' ? navigator.platform.toUpperCase().indexOf('MAC') >= 0 : false;

const ShortcutKey = ({ children }: { children: string }): JSX.Element => {
	const className = 'inline-flex items-center justify-center w-5 h-5 p-1 text-[0.625rem] rounded font-semibold leading-none border border-neutral-200 text-neutral-500 border-b-2';

	if (children === 'Mod') {
		return <kbd className={className}>{isMac ? '⌘' : 'Ctrl'}</kbd>; // ⌃
	}

	if (children === 'Shift') {
		return <kbd className={className}>⇧</kbd>;
	}

	if (children === 'Alt') {
		return <kbd className={className}>{isMac ? '⌥' : 'Alt'}</kbd>;
	}

	return <kbd className={className}>{children}</kbd>;
};

const TooltipContent = React.forwardRef<React.ElementRef<typeof TooltipPrimitive.Content>, React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & { shortcut?: string[] }>(({ shortcut, className, sideOffset = 4, ...props }, ref) => {
	return (
		<TooltipPrimitive.Content
			ref={ref}
			sideOffset={sideOffset}
			className={cn(
				'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-xs font-light text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
				className
			)}
			{...props}>
			{!!shortcut && (
				<div className="flex items-center gap-2">
					{props.children}
					<span className="flex items-center gap-0.5">
						{shortcut.map(shortcutKey => (
							<ShortcutKey key={shortcutKey}>{shortcutKey}</ShortcutKey>
						))}
					</span>
				</div>
			)}

			{!shortcut && props.children}
		</TooltipPrimitive.Content>
	);
});
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
