import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { GlowEffect } from '@/components/ui/glow-effect';

export const AppLink = async () => {
	const supabase = await createClient();

	const auth = await supabase.auth.getUser();
	const isLoggedIn = !!auth?.data.user;

	return (
		<ul className="flex items-center gap-6">
			{!isLoggedIn && (
				<li>
					<Link href={'/app/login'} className="text-sm">
						Login
					</Link>
				</li>
			)}

			<li className="relative">
				<GlowEffect colors={['#FF5733', '#33FF57', '#3357FF', '#F1C40F']} mode="colorShift" blur="soft" duration={3} scale={1} className="rounded-full" />
				<Link href={'/app/login'} className={cn(buttonVariants(), 'relative gap-3 rounded-full text-sm')}>
					{isLoggedIn ? 'Go to dashboard' : 'Request access'}
					<ChevronRight size={12} />
				</Link>
			</li>
		</ul>
	);
};
