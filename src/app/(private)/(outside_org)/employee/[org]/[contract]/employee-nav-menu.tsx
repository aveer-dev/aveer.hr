'use client';

import { cn } from '@/lib/utils';
import { CalendarClock, Command, FilePenLine, FileStack, FolderOpenDot, House, ListChecks, Signature, UserRoundCog, UsersRound } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CommandShortcut } from '@/components/ui/command';
import { Tables } from '@/type/database.types';

export const NavMenu = ({ contract }: { contract: Tables<'contracts'> }) => {
	const path = usePathname();
	const router = useRouter();

	const [navItems] = useState([
		{ label: 'Home', icon: House, page: 'home', shortcut: 'h', enabled: true },
		{ label: 'Time-off', icon: CalendarClock, page: 'leave', shortcut: 'l', enabled: contract.status == 'signed' },
		{ label: 'Profile', icon: UserRoundCog, page: 'profile', shortcut: 'p', enabled: true },
		{ label: 'Team', icon: UsersRound, page: 'team', shortcut: 't', enabled: contract.status == 'signed' },
		{ label: 'Requests', icon: FileStack, page: 'requests', shortcut: 'r', enabled: contract.status == 'signed' },
		{ label: 'Contract', icon: Signature, page: 'contract', shortcut: 'c', enabled: true },
		{ label: 'Appraisal', icon: FilePenLine, page: 'appraisal', shortcut: 'a', enabled: contract.status == 'signed' },
		{ label: 'Boarding', icon: ListChecks, page: 'boarding', shortcut: 'b', enabled: contract.status == 'signed' },
		{ label: 'Files', icon: FolderOpenDot, page: 'files', shortcut: 'f', enabled: contract.status == 'signed' }
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
		<ul className="no-scrollbar flex max-w-xs items-center gap-4 overflow-x-auto rounded-full border bg-background/30 px-2 py-2 shadow-md backdrop-blur transition-all duration-500 sm:max-w-[unset]">
			{navItems.map((item, index) => (
				<li key={index} className={cn('group rounded-3xl px-2 py-2 shadow-gray-400 transition-all duration-500', item.enabled && 'hover:bg-secondary hover:px-3 hover:shadow-md', isPageActive(item.page) && 'bg-foreground px-3 shadow-md hover:bg-foreground')}>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Link href={`./${(item.enabled && item.page) || '#'}`} className={cn('flex items-center', !item.enabled && 'pointer-events-none opacity-50')}>
									<item.icon size={16} className={cn('', isPageActive(item.page) && 'text-background')} />

									<div className={cn('w-0 overflow-hidden whitespace-nowrap text-sm font-light transition-all duration-500', item.enabled && 'group-hover:ml-4 group-hover:w-[4.2rem]', isPageActive(item.page) && 'ml-4 w-[4.2rem] text-background')}>
										{item.label}
									</div>
								</Link>
							</TooltipTrigger>

							<TooltipContent align="center">
								<CommandShortcut className={cn('capitlize flex items-center gap-1')}>
									<Command className="scale-50" /> Shift <span className="uppercase">{item.shortcut}</span>
								</CommandShortcut>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</li>
			))}
		</ul>
	);
};
