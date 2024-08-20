import * as React from 'react';

import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Bolt, UserPlus, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NavLink } from './link';

export function NavMenu({ orgId }: { orgId: string }) {
	return (
		<NavigationMenu>
			<NavigationMenuList className="group-hover:text-accent">
				<NavigationMenuItem>
					<NavLink org={orgId} href={``} legacyBehavior passHref>
						<NavigationMenuLink className={cn(navigationMenuTriggerStyle(), 'gap-3 font-light')}>
							<Users size={16} />
							People
						</NavigationMenuLink>
					</NavLink>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavLink org={orgId} href={`/open-roles`} legacyBehavior passHref>
						<NavigationMenuLink className={cn(navigationMenuTriggerStyle(), 'gap-3 font-light')}>
							<UserPlus size={16} />
							Open Roles
						</NavigationMenuLink>
					</NavLink>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavLink org={orgId} href={`/settings`} legacyBehavior passHref>
						<NavigationMenuLink className={cn(navigationMenuTriggerStyle(), 'gap-3 font-light')}>
							<Bolt size={16} />
							Settings
						</NavigationMenuLink>
					</NavLink>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	);
}
