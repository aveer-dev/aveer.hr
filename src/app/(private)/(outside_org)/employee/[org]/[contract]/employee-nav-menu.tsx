'use client';

import { cn } from '@/lib/utils';
import { CalendarClock, Command, FilePenLine, FileStack, FolderOpenDot, House, ListChecks, Signature, UserRoundCog, UsersRound } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CommandShortcut } from '@/components/ui/command';

export const NavMenu = () => {
	const path = usePathname();
	const router = useRouter();

	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === 'h' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
				e.preventDefault();
				router.push('./home');
			}

			if (e.key === 'l' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
				e.preventDefault();
				router.push('./leave');
			}

			if (e.key === 'p' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
				e.preventDefault();
				router.push('./profile');
			}

			if (e.key === 'd' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
				e.preventDefault();
				router.push('./team');
			}

			if (e.key === 'r' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
				e.preventDefault();
				router.push('./requests');
			}

			if (e.key === 'c' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
				e.preventDefault();
				router.push('./contract');
			}

			if (e.key === 'a' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
				e.preventDefault();
				router.push('./appraisal');
			}

			if (e.key === 'b' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
				e.preventDefault();
				router.push('./boarding');
			}

			if (e.key === 'f' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
				e.preventDefault();
				router.push('./files');
			}
		};
		document.addEventListener('keydown', down);
		return () => document.removeEventListener('keydown', down);
	}, [router]);

	const navItems = [
		{ label: 'Home', icon: House, page: 'home', active: path.includes('/home'), shortcut: 'H' },
		{ label: 'Time-off', icon: CalendarClock, page: 'leave', active: path.includes('/leave'), shortcut: 'L' },
		{ label: 'Profile', icon: UserRoundCog, page: 'profile', active: path.includes('/profile'), shortcut: 'P' },
		{ label: 'Team', icon: UsersRound, page: 'team', active: path.includes('/team'), shortcut: 'T' },
		{ label: 'Requests', icon: FileStack, page: 'requests', active: path.includes('/requests'), shortcut: 'R' },
		{ label: 'Contract', icon: Signature, page: 'contract', active: path.includes('/contract'), shortcut: 'C' },
		{ label: 'Appraisal', icon: FilePenLine, page: 'appraisal', active: path.includes('/appraisal'), shortcut: 'A' },
		{ label: 'Boarding', icon: ListChecks, page: 'boarding', active: path.includes('/boarding'), shortcut: 'B' },
		{ label: 'Files', icon: FolderOpenDot, page: 'files', active: path.includes('/files'), shortcut: 'F' }
	];

	return (
		<ul className="flex items-center gap-4 rounded-full border bg-background/30 px-2 py-2 shadow-md backdrop-blur transition-all duration-500">
			{navItems.map((item, index) => (
				<li key={index} className={cn('group rounded-3xl px-2 py-2 shadow-gray-400 transition-all duration-500 hover:bg-secondary hover:px-3 hover:shadow-md', item.active && 'bg-foreground px-3 shadow-md hover:bg-foreground')}>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Link href={`./${item.page || '#'}`} className="flex items-center">
									<item.icon size={16} className={cn('', item.active && 'text-background')} />
									<div className={cn('w-0 overflow-hidden whitespace-nowrap text-sm font-light transition-all duration-500 group-hover:ml-4 group-hover:w-[4.2rem]', item.active && 'ml-4 w-[4.2rem] text-background')}>{item.label}</div>
								</Link>
							</TooltipTrigger>

							<TooltipContent align="center">
								<CommandShortcut className={cn('capitlize flex items-center gap-1')}>
									<Command className="scale-50" /> Shift <span>{item.shortcut}</span>
								</CommandShortcut>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</li>
			))}
		</ul>
	);
};
