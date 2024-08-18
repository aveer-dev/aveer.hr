import { CircleHelp } from 'lucide-react';
import { NavMenu } from '../ui/nav-menu';
import { LogoutButton } from './logout-button';
import { AccountTypeToggle } from './account-type-toggle';
import { createClient } from '@/utils/supabase/server';

export const Header = async ({ orgId }: { orgId?: string }) => {
	const supabase = createClient();

	const { data } = await supabase.auth.getSession();

	return (
		<header className="flex w-full items-center justify-between border-b border-b-input px-6 py-4">
			<div className="flex items-center gap-3">
				<div className="font-logo text-xl font-light">aveer.hr</div>
				{data.session?.user && <AccountTypeToggle orgId={orgId} />}
			</div>

			{orgId && data.session?.user && <NavMenu orgId={orgId} />}

			<div className="flex items-center gap-3">
				<button className="flex items-center gap-2 text-xs">
					Do you need help <CircleHelp className="text-muted-foreground" size={16} />
				</button>

				{data.session?.user && (
					<>
						<div className="h-3 w-px bg-muted-foreground"></div>
						<LogoutButton />
					</>
				)}
			</div>
		</header>
	);
};
