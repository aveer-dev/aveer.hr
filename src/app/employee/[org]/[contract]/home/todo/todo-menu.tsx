'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PanelLeftOpen } from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';
import { useMediaQuery } from 'usehooks-ts';

export const TodoMenu = ({ children }: { children: ReactNode }) => {
	const isDesktop = useMediaQuery('(min-width: 768px)');
	const [open, setOpen] = useState(false);

	useEffect(() => {
		setOpen(isDesktop);
	}, [isDesktop]);

	return (
		<>
			<ul
				onClick={() => !isDesktop && setOpen(open => !open)}
				className={cn(
					'absolute bottom-4 left-4 top-4 z-10 max-h-72 min-h-72 w-full max-w-0 space-y-1 overflow-y-auto overflow-x-hidden rounded-3xl bg-background px-0 py-4 pb-10 text-sm drop-shadow-md transition-all duration-500 sm:drop-shadow-sm sm:[position:initial]',
					open && 'max-w-[16rem] px-8'
				)}>
				{children}
			</ul>

			<Button onClick={() => setOpen(open => !open)} className={cn('absolute bottom-6 left-6 z-10 mt-auto rounded-full')} variant={'outline'} size={'icon'}>
				<PanelLeftOpen className={cn(open && '-scale-x-100')} size={16} />
			</Button>
		</>
	);
};
