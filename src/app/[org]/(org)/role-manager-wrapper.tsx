'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Error404Wrapper } from '../../../components/ui/error-404-wrapper';
import { buttonVariants } from '../../../components/ui/button';
import { Undo2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface RoleManagerWrapperProps {
	children: ReactNode;
	orgId: string;
}

export const RoleManagerWrapper = ({ children, orgId }: RoleManagerWrapperProps) => {
	const pathname = usePathname();

	if (!pathname.includes('open-role') && !pathname.includes('job')) {
		return (
			<Error404Wrapper cursorText="error">
				<div className="mx-auto max-w-xl">
					<h1 className="mb-3 text-4xl font-extrabold">Unauthorized</h1>

					<h3 className="mb-3 text-lg font-bold">You do not have access</h3>
					<p className="text-sm">You do not have access to this page. Please contact your admin or HR.</p>

					<div className="mt-6 flex gap-4">
						<Link href={'/app'} className={cn(buttonVariants({ variant: 'outline' }), 'gap-4')}>
							<Undo2 size={12} />
							Back home
						</Link>

						<Link href={`/${orgId}/open-roles`} className={cn(buttonVariants(), 'gap-4')}>
							Open Roles
						</Link>
					</div>
				</div>
			</Error404Wrapper>
		);
	}

	return <>{children}</>;
};
