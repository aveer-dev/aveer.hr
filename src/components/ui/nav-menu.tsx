import * as React from 'react';
import Link from 'next/link';

import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Bolt, UserPlus, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export function NavMenu({ orgId }: { orgId: string }) {
	return (
		<NavigationMenu>
			<NavigationMenuList className="group-hover:text-accent">
				<NavigationMenuItem>
					<Link href={`/${orgId}/`} legacyBehavior passHref>
						<NavigationMenuLink className={cn(navigationMenuTriggerStyle(), 'gap-3 font-light')}>
							<Users size={16} />
							People
						</NavigationMenuLink>
					</Link>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<Link href={`/${orgId}/open-roles`} legacyBehavior passHref>
						<NavigationMenuLink className={cn(navigationMenuTriggerStyle(), 'gap-3 font-light')}>
							<UserPlus size={16} />
							Open Roles
						</NavigationMenuLink>
					</Link>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<Link href={`/${orgId}/settings`} legacyBehavior passHref>
						<NavigationMenuLink className={cn(navigationMenuTriggerStyle(), 'gap-3 font-light')}>
							<Bolt size={16} />
							Settings
						</NavigationMenuLink>
					</Link>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	);
}
