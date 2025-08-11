'use client';

import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const BackButton = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
	const router = useRouter();

	return (
		<Button {...props} onClick={() => router.back()} variant={'outline'} size={'icon'} className={cn('rounded-full lg:absolute lg:-left-16 lg:top-1/2 lg:-translate-y-1/2', props.className)}>
			<ChevronLeft size={12} />
		</Button>
	);
};
