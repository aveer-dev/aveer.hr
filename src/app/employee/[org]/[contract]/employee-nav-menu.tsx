'use client';

import { cn } from '@/lib/utils';
import { CalendarClock, FilePenLine, Files, FileStack, FolderOpenDot, House, ListChecks, Signature, UserRoundCog, UsersRound } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Tables } from '@/type/database.types';

export const NavMenu = ({ contract }: { contract: Tables<'contracts'> }) => {
	const path = usePathname();
	const router = useRouter();

	const [navItems] = useState([
		{ label: 'Home', icon: House, page: 'home', shortcut: 'h', enabled: true },
		{ label: 'Time-off', icon: CalendarClock, page: 'leave', shortcut: 'l', enabled: contract?.status == 'signed' },
		{ label: 'Profile', icon: UserRoundCog, page: 'profile', shortcut: 'p', enabled: true },
		{ label: 'Team', icon: UsersRound, page: 'team', shortcut: 't', enabled: contract?.status == 'signed' },
		{ label: 'Requests', icon: FileStack, page: 'requests', shortcut: 'r', enabled: contract?.status == 'signed' },
		{ label: 'Contract', icon: Signature, page: 'contract', shortcut: 'c', enabled: true },
		{ label: 'Appraisal', icon: FilePenLine, page: 'performance', shortcut: 'a', enabled: contract?.status == 'signed' },
		{ label: 'Boarding', icon: ListChecks, page: 'boarding', shortcut: 'b', enabled: contract?.status == 'signed' || contract?.status == 'scheduled termination' },
		{ label: 'Documents', icon: Files, page: 'documents', shortcut: 'd', enabled: contract?.status == 'signed' },
		{ label: 'Files', icon: FolderOpenDot, page: 'files', shortcut: 'f', enabled: contract?.status == 'signed' }
	]);

	const isPageActive = (page: string) => path.includes(`/${page}`);

	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			for (const item of navItems) {
				if (e.key === item.shortcut && (e.metaKey || e.ctrlKey) && e.shiftKey && item.enabled) {
					e.preventDefault();
					router.push(`./${item.page}`);
				}
			}
		};

		document.addEventListener('keydown', down);
		return () => document.removeEventListener('keydown', down);
	}, [navItems, router]);

	return (
		<ul className="no-scrollbar flex max-w-full items-center gap-4 overflow-x-auto bg-background/30 px-2 py-2 transition-all duration-500 sm:max-w-fit">
			{navItems.map((item, index) => (
				<li
					key={index}
					className={cn('group rounded-3xl px-3 py-2 shadow-gray-400 transition-all duration-500 sm:px-2', item.enabled && 'sm:hover:bg-secondary sm:hover:px-3 sm:hover:shadow-md', isPageActive(item.page) && '!bg-foreground shadow-md hover:bg-foreground sm:px-3')}>
					<Link href={`./${(item.enabled && item.page) || '#'}`} className={cn('flex items-center', !item.enabled && 'pointer-events-none opacity-50')}>
						<item.icon size={16} className={cn('', isPageActive(item.page) && 'text-background')} />

						<div
							className={cn(
								'ml-4 w-fit overflow-hidden whitespace-nowrap text-sm font-light transition-all duration-500 sm:ml-0 sm:w-0',
								item.enabled && 'group-hover:sm:ml-4 group-hover:sm:w-[4.2rem]',
								isPageActive(item.page) && '!ml-4 text-background sm:w-[4.2rem]'
							)}>
							{item.label}
						</div>
					</Link>
				</li>
			))}
		</ul>
	);
};
