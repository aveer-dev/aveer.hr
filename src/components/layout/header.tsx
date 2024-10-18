import { CircleHelp } from 'lucide-react';
import { NavMenu } from '@/components/ui/nav-menu';
import { LogoutButton } from './logout-button';
import { AccountTypeToggle } from './account-type-toggle';
import { createClient } from '@/utils/supabase/server';
import { NavLink } from '@/components/ui/link';

export const Header = async ({ orgId }: { orgId?: string }) => {
	const supabase = createClient();

	const { data } = await supabase.auth.getUser();

	return (
		<header className="sticky top-0 z-20 w-full bg-background shadow-sm">
			<div className="flex items-center justify-between px-6 py-4">
				<div className="flex items-center gap-3">
					<NavLink org={orgId} href={'/'} className="font-logo text-xl font-light">
						aveer.hr
					</NavLink>
					{data?.user && orgId && <AccountTypeToggle orgId={orgId} />}
				</div>

				<div className="flex items-center gap-4">
					<button className="flex items-center gap-2 text-xs">
						<CircleHelp className="text-muted-foreground" size={16} />
					</button>

					{data?.user && (
						<>
							<div className="h-3 w-px bg-muted-foreground"></div>
							<LogoutButton />
						</>
					)}
				</div>
			</div>

			{orgId && orgId !== 'employee' && data?.user && (
				<div className="no-scrollbar flex items-center overflow-x-auto px-6 pt-4">
					<NavMenu orgId={orgId} />
				</div>
			)}
		</header>
	);
};
