'use client';

import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Bolt, Building2, CalendarDays, CalendarPlus, ChartPie, UserPlus, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NavLink } from './link';
import { usePathname } from 'next/navigation';

export function NavMenu({ orgId }: { orgId: string }) {
	const path = usePathname();

	const navItems = [
		{ label: 'People', href: '/', icon: Users },
		{ label: 'Calendar', href: '/calendar', icon: CalendarDays },
		{ label: 'Open Roles', href: '/open-roles', icon: UserPlus },
		{ label: 'Time Off', href: '/time-off', icon: CalendarPlus },
		{ label: 'Performance', href: '/performance', icon: ChartPie },
		{ label: 'Org Chart', href: '/org-chart', icon: Building2 },
		{ label: 'Settings', href: '/settings', icon: Bolt }
	];

	return (
		<NavigationMenu>
			<NavigationMenuList className="group-hover:text-accent">
				{navItems.map((item, index) => (
					<NavigationMenuItem key={index}>
						<NavLink org={orgId} href={item.href} legacyBehavior passHref>
							<NavigationMenuLink active={item.href == '/' ? path.includes('people') || path == '/' || path == `/${orgId}` : path.includes(item.href)} className={cn(navigationMenuTriggerStyle(), 'gap-3 font-light')}>
								<item.icon size={16} />
								{item.label}
							</NavigationMenuLink>
						</NavLink>
					</NavigationMenuItem>
				))}
			</NavigationMenuList>
		</NavigationMenu>
	);
}
