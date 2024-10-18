'use client';

import { cn } from '@/lib/utils';
import { CalendarClock, FilePenLine, FolderOpenDot, House, ListChecks, Signature, UserRoundCog, UsersRound } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const NavMenu = () => {
	const path = usePathname();

	const navItems = [
		{ label: 'Home', icon: House, page: 'home', active: path.includes('/home') },
		{ label: 'Time-off', icon: CalendarClock, page: 'leave', active: path.includes('/leave') },
		{ label: 'Profile', icon: UserRoundCog, page: 'profile', active: path.includes('/profile') },
		{ label: 'Team', icon: UsersRound, page: 'team', active: path.includes('/team') },
		{ label: 'Contract', icon: Signature, page: 'contract', active: path.includes('/contract') },
		{ label: 'Appraisal', icon: FilePenLine, page: 'appraisal', active: path.includes('/appraisal') },
		{ label: 'Boarding', icon: ListChecks, page: 'boarding', active: path.includes('/boarding') },
		{ label: 'Files', icon: FolderOpenDot, page: 'files', active: path.includes('/files') }
	];

	return (
		<ul className="flex items-center gap-4 rounded-full border bg-background/30 px-2 py-2 shadow-md backdrop-blur transition-all duration-500">
			{navItems.map((item, index) => (
				<li key={index} className={cn('group rounded-3xl px-2 py-2 shadow-gray-400 transition-all duration-500 hover:bg-secondary hover:px-3 hover:shadow-md', item.active && 'bg-foreground px-3 shadow-md hover:bg-foreground')}>
					<Link href={`./${item.page || '#'}`} className="flex items-center">
						<item.icon size={16} className={cn('', item.active && 'text-background')} />
						<div className={cn('w-0 overflow-hidden whitespace-nowrap text-sm font-light transition-all duration-500 group-hover:ml-4 group-hover:w-[4.2rem]', item.active && 'ml-4 w-[4.2rem] text-background')}>{item.label}</div>
					</Link>
				</li>
			))}
		</ul>
	);
};
