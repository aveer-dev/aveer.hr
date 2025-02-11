'use client';

import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loader';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

const supabase = createClient();

export const LogoutButton = () => {
	const [isLoading, toggleLoadingState] = useState(false);
	const router = useRouter();

	const logout = async () => {
		try {
			toggleLoadingState(true);
			const { error } = await supabase.auth.signOut();

			if (error) return toast.error(error.message);
			router.push(`${process.env.NEXT_PUBLIC_URL}/app/login`);
		} catch (error) {
			toast.error('Error logging you out, check your network and try again');
		}
	};

	return (
		<>
			<Button onClick={logout} variant={'secondary'} size={'icon'} className="h-8">
				<LogOut size={12} />
			</Button>

			<div className={cn('pointer-events-none fixed bottom-0 left-0 right-0 top-0 z-50 flex h-screen items-center justify-center bg-accent/40 text-sm text-foreground transition-all duration-500', isLoading ? 'opacity-100 backdrop-blur-sm' : 'opacity-0 backdrop-blur-0')}>
				<div className="flex items-center gap-2">
					<LoadingSpinner />
					Logging out
				</div>
			</div>
		</>
	);
};
