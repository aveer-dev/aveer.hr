import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

export const AppLink = async () => {
	const supabase = await createClient();

	const auth = await supabase.auth.getUser();
	const isLoggedIn = !!auth?.data.user;

	return (
		<Link
			href={'/app'}
			className={cn(
				buttonVariants({ variant: 'ghost' }),
				'relative h-7 gap-2 rounded-full font-normal transition-all group-focus-within:bg-primary/5 group-focus-within:font-medium group-hover:bg-primary/5 group-hover:font-medium group-focus-visible:bg-primary/5 group-focus-visible:font-medium'
			)}>
			{isLoggedIn ? 'Dashboard' : 'Login'}
			<ChevronRight size={12} className="transition-transform duration-300 group-focus-within:translate-x-1 group-hover:translate-x-1 group-focus-visible:translate-x-1" />
		</Link>
	);
};
