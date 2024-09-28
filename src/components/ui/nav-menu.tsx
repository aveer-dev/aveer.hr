'use client';

import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Bolt, CalendarPlus, ChartPie, UserPlus, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NavLink } from './link';
import { usePathname } from 'next/navigation';

export function NavMenu({ orgId }: { orgId: string }) {
	const path = usePathname();

	return (
		<NavigationMenu>
			<NavigationMenuList className="group-hover:text-accent">
				<NavigationMenuItem>
					<NavLink org={orgId} href={`/`} legacyBehavior passHref>
						<NavigationMenuLink active={path.includes('people') || path == '/' || path == `/${orgId}`} className={cn(navigationMenuTriggerStyle(), 'gap-3 font-light')}>
							<Users size={16} />
							People
						</NavigationMenuLink>
					</NavLink>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavLink org={orgId} href={`/open-roles`} legacyBehavior passHref>
						<NavigationMenuLink active={path.includes('/open-roles')} className={cn(navigationMenuTriggerStyle(), 'gap-3 font-light')}>
							<UserPlus size={16} />
							Open Roles
						</NavigationMenuLink>
					</NavLink>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavLink org={orgId} href={`/time-off`} legacyBehavior passHref>
						<NavigationMenuLink active={path.includes('/time-off')} className={cn(navigationMenuTriggerStyle(), 'gap-3 font-light')}>
							<CalendarPlus size={16} />
							Time Off
						</NavigationMenuLink>
					</NavLink>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavLink org={orgId} href={`/performance`} legacyBehavior passHref>
						<NavigationMenuLink active={path.includes('/performance')} className={cn(navigationMenuTriggerStyle(), 'gap-3 font-light')}>
							<ChartPie size={16} />
							Performance
						</NavigationMenuLink>
					</NavLink>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavLink org={orgId} href={`/settings`} legacyBehavior passHref>
						<NavigationMenuLink active={path.includes('/settings')} className={cn(navigationMenuTriggerStyle(), 'gap-3 font-light')}>
							<Bolt size={16} />
							Settings
						</NavigationMenuLink>
					</NavLink>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	);
}
