'use client';

import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Bolt, Building2, CalendarDays, CalendarPlus, ChartPie, Files, FolderTree, UserPlus, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { Database } from '@/type/database.types';

export function NavMenu({ orgId, role }: { orgId: string; role: Database['public']['Enums']['app_role'] }) {
	const path = usePathname();

	const navItems = [
		{ label: 'People', href: '/', icon: Users, enabled: role == 'admin' },
		{ label: 'Calendar', href: '/calendar', icon: CalendarDays, enabled: role == 'admin' },
		{ label: 'Documents', href: '/documents', icon: Files, enabled: role == 'admin' },
		{ label: 'File Manager', href: '/files', icon: FolderTree, enabled: role == 'admin' },
		{ label: 'Open Roles', href: '/open-roles', icon: UserPlus, enabled: true },
		{ label: 'Time Off', href: '/time-off', icon: CalendarPlus, enabled: role == 'admin' },
		{ label: 'Performance', href: '/performance', icon: ChartPie, enabled: role == 'admin' },
		{ label: 'Org Chart', href: '/org-chart', icon: Building2, enabled: role == 'admin' },
		{ label: 'Settings', href: '/settings', icon: Bolt, enabled: role == 'admin' }
	];

	const getHref = (href: string) => {
		return process.env.NEXT_PUBLIC_ENABLE_SUBDOMAIN !== 'true' && orgId ? `/${orgId}${href}` : href;
	};

	return (
		<NavigationMenu>
			<NavigationMenuList className="group-hover:text-accent">
				{navItems.map(
					(item, index) =>
						item.enabled && (
							<NavigationMenuItem key={index}>
								<NavigationMenuLink href={getHref(item.href)} active={item.href == '/' ? path.includes('people') || path == '/' || path == `/${orgId}` : path.includes(item.href)} className={cn(navigationMenuTriggerStyle(), 'gap-3 font-light')}>
									<item.icon size={16} />
									{item.label}
								</NavigationMenuLink>
							</NavigationMenuItem>
						)
				)}
			</NavigationMenuList>
		</NavigationMenu>
	);
}
