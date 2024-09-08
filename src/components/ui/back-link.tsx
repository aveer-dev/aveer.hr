import { ChevronLeft } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { AnchorHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export const BackLink = (props: AnchorHTMLAttributes<HTMLAnchorElement>) => {
	return (
		<Link {...props} href={props.href || './'} className={cn(buttonVariants({ variant: 'outline', size: 'icon' }), 'rounded-full lg:absolute lg:-left-16 lg:top-1/2 lg:-translate-y-1/2', props.className)}>
			<ChevronLeft size={12} />
		</Link>
	);
};
