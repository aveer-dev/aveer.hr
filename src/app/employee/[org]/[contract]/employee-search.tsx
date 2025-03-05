'use client';

import { Button } from '@/components/ui/button';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from '@/components/ui/command';
import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
import { ArrowRightLeft, CalendarClock, Command, Dock, FilePenLine, FileStack, FolderOpenDot, House, ListChecks, Search, Signature, UserRoundCog, UsersRound } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export const EmployeePageSearch = () => {
	const [open, setOpen] = useState(false);

	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen(open => !open);
			}
		};

		document.addEventListener('keydown', down);
		return () => document.removeEventListener('keydown', down);
	}, []);

	const quickActionCommandItems = [
		{ label: 'Commads', icon: Dock, shortcut: 'K' },
		{ label: 'Switch orgs', icon: ArrowRightLeft, shortcut: 'J' }
	];

	const commandItems = [
		{ label: 'Home', icon: House, page: 'home', shortcut: 'H' },
		{ label: 'Time-off', icon: CalendarClock, page: 'leave', shortcut: 'L' },
		{ label: 'Profile', icon: UserRoundCog, page: 'profile', shortcut: 'P' },
		{ label: 'Team', icon: UsersRound, page: 'team', shortcut: 'T' },
		{ label: 'Requests', icon: FileStack, page: 'requests', shortcut: 'R' },
		{ label: 'Contract', icon: Signature, page: 'contract', shortcut: 'C' },
		{ label: 'Appraisal', icon: FilePenLine, page: 'appraisal', shortcut: 'A' },
		{ label: 'Boarding', icon: ListChecks, page: 'boarding', shortcut: 'B' },
		{ label: 'Files', icon: FolderOpenDot, page: 'files', shortcut: 'F' },
		{ label: 'Settings', icon: UserRoundCog, page: 'settings', shortcut: 'S' }
	];

	return (
		<>
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button onClick={() => setOpen(open => !open)} className="h-8 w-8 rounded-2xl border p-0" variant={'secondary'}>
							<Search size={12} />
						</Button>
					</TooltipTrigger>

					<TooltipContent align="center">
						<CommandShortcut className="flex items-center gap-1">
							<Command size={12} />K | Search
						</CommandShortcut>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>

			<CommandDialog open={open} onOpenChange={setOpen}>
				<DialogTitle className="hidden">Search</DialogTitle>
				<DialogDescription className="hidden">Search available commands</DialogDescription>

				<CommandInput placeholder="Type a command or search..." />
				<CommandList>
					<CommandEmpty>No results found.</CommandEmpty>

					<CommandGroup heading="Quick actions">
						{quickActionCommandItems.map((item, index) => (
							<CommandItem key={index} value={item.label} className="gap-2 px-3 transition-all duration-500">
								<div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted p-1">
									<item.icon className="scale-75 stroke-[1.5] text-accent-foreground" />
								</div>
								<span className="text-sm">{item.label}</span>
								<CommandShortcut className={cn('flex items-center justify-center')}>
									<Command className="scale-50" /> {item.shortcut}
								</CommandShortcut>
							</CommandItem>
						))}
					</CommandGroup>

					<CommandGroup heading="Pages">
						{commandItems.map((item, index) => (
							<Link key={index} href={`./${item.page}`}>
								<CommandItem value={item.label} className="gap-2 px-3 transition-all duration-500">
									<div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted p-1">
										<item.icon className="scale-75 stroke-[1.5] text-accent-foreground" />
									</div>
									<span className="text-sm">{item.label}</span>
									<CommandShortcut className={cn('capitlize flex items-center gap-2')}>
										<Command className="scale-50" /> Shift <span>{item.shortcut}</span>
									</CommandShortcut>
								</CommandItem>
							</Link>
						))}
					</CommandGroup>
				</CommandList>
			</CommandDialog>
		</>
	);
};
