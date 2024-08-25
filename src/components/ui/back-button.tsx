'use client';

import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const BackButton = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
	const router = useRouter();

	return (
		<Button {...props} onClick={() => router.back()} variant={'outline'} size={'icon'} className={cn(props.className, 'top-1/2 -translate-y-1/2 rounded-full')}>
			<ChevronLeft size={12} />
		</Button>
	);
};
