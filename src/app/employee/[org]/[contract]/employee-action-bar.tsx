'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dock, House, CalendarClock, Signature, FilePenLine, ListChecks, File, FolderOpenDot, UserRoundCog, UsersRound, FileStack, MessageSquare, Settings, Search } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList, CommandShortcut } from '@/components/ui/command';
import Link from 'next/link';
import { ProgressiveBlur } from '@/components/ui/progressive-blur';
import { cn } from '@/lib/utils';
import { Magnetic } from '@/components/ui/magnetic';
import { usePathname, useRouter } from 'next/navigation';
import { Notifications } from './notifications';
import { EmployeeProfileSettings } from './employee-profile-settings';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { buttonVariants } from '@/components/ui/button';

const quickActionCommandItems = [{ label: 'Commads', icon: Dock, shortcut: 'K' }];

const CommandItemComponent = ({ item, onSelect }: { item: { label: string; icon: any; shortcut: string }; onSelect: (value: string) => void }) => {
	const className =
		'flex items-center justify-center rounded-sm bg-muted px-1.5 text-xs tracking-widest group-data-[selected=true]:bg-muted-foreground group-data-[selected=true]:text-muted transition-all group-focus:bg-muted-foreground group-focus:text-muted group-hover:bg-muted-foreground group-hover:text-muted';

	return (
		<CommandItem onSelect={onSelect} value={item.label} className="gap-4 px-3 py-3 transition-all">
			<item.icon size={14} className="stroke-[1.5] text-muted-foreground" />

			<span className="text-xs">{item.label}</span>
			<CommandShortcut className={cn('flex items-center gap-2 text-xs')}>
				<span className={className}>A</span> then
				<span className={className}>{item.shortcut}</span>
			</CommandShortcut>
		</CommandItem>
	);
};

export default function EmployeeActionBar({ contract, messages }: { contract: any; messages: any[] }) {
	const [showCommandBar, setShowCommandBar] = useState(false);
	const [search, setSearch] = useState('');
	const [commandMode, setCommandMode] = useState(false);
	const commandModeTimeout = useRef<NodeJS.Timeout | null>(null);
	const commandPaletteRef = useRef<HTMLDivElement>(null);
	const actionBarRef = useRef<HTMLDivElement>(null);
	const router = useRouter();
	const [notificationsOpen, setNotificationsOpen] = useState(false);
	const [showSettings, setShowSettings] = useState(false);

	const path = usePathname();

	const isPageActive = (page: string) => path.includes(`/${page}`);

	const commandItems = useMemo(
		() => [
			{ label: 'Home', icon: House, page: 'home', shortcut: 'H', enabled: true },
			{ label: 'Time-off / Leave', icon: CalendarClock, page: 'leave', shortcut: 'L', enabled: true },
			{ label: 'Profile', icon: UserRoundCog, page: 'profile', shortcut: 'P', enabled: true },
			{ label: 'Team', icon: UsersRound, page: 'team', shortcut: 'T', enabled: true },
			{ label: 'Requests', icon: FileStack, page: 'requests', shortcut: 'R', enabled: true },
			{ label: 'Contract', icon: Signature, page: 'contract', shortcut: 'C', enabled: true },
			{ label: 'Documents', icon: File, page: 'documents', shortcut: 'D', enabled: true },
			{ label: 'Appraisal', icon: FilePenLine, page: 'performance', shortcut: 'A', enabled: true },
			{ label: 'Boarding', icon: ListChecks, page: 'boarding', shortcut: 'B', enabled: true },
			{ label: 'File Manager', icon: FolderOpenDot, page: 'files', shortcut: 'F', enabled: true },
			{ label: 'Messages', icon: MessageSquare, page: 'messages', shortcut: 'M', enabled: true, function: () => setNotificationsOpen(true) },
			{ label: 'Settings', icon: UserRoundCog, page: 'settings', shortcut: 'S', enabled: true, function: () => setShowSettings(true) },
			{ label: 'Search', icon: Search, page: 'search', shortcut: 'K', enabled: true, function: () => setShowCommandBar(true), hidden: true }
		],
		[setNotificationsOpen, setShowSettings, setShowCommandBar]
	);

	const navItems = useMemo(
		() => [
			{ label: 'Home', icon: House, page: 'home', shortcut: 'H', enabled: true },
			{ label: 'Messages', icon: MessageSquare, page: 'messages', shortcut: 'M', enabled: true, function: () => setNotificationsOpen(true) },
			{ label: 'Settings', icon: Settings, page: 'settings', shortcut: 'S', enabled: true, function: () => setShowSettings(true) },
			{ label: 'Search', icon: Search, page: 'search', shortcut: 'K', enabled: true, function: () => setShowCommandBar(true) }
		],
		[setNotificationsOpen, setShowSettings, setShowCommandBar]
	);

	const _className =
		'flex items-center justify-center rounded-sm bg-primary/10 px-1.5 text-xs tracking-widest group-data-[selected=true]:bg-muted-foreground group-data-[selected=true]:text-muted transition-all group-focus:bg-muted-foreground group-focus:text-muted group-hover:bg-muted-foreground group-hover:text-muted';

	useEffect(() => {
		if (!showCommandBar) return;

		function handleClick(e: MouseEvent) {
			if (commandPaletteRef.current && !commandPaletteRef.current.contains(e.target as Node) && actionBarRef.current && !actionBarRef.current.contains(e.target as Node)) {
				setShowCommandBar(false);
				setSearch('');
			}
		}

		document.addEventListener('mousedown', handleClick);
		return () => document.removeEventListener('mousedown', handleClick);
	}, [showCommandBar]);

	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			// Ignore if input or textarea is focused
			if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

			if (!commandMode) {
				if (e.key.toLowerCase() === 'a') {
					setCommandMode(true);
					if (commandModeTimeout.current) clearTimeout(commandModeTimeout.current);
					commandModeTimeout.current = setTimeout(() => setCommandMode(false), 2000);
				}
			} else {
				const item = commandItems.find(i => i.shortcut.toLowerCase() === e.key.toLowerCase());
				if (item && item.enabled) {
					if (item.function) {
						item.function();
					} else {
						router.push(`./${item.page}`);
					}
				}
				setCommandMode(false);
				if (commandModeTimeout.current) clearTimeout(commandModeTimeout.current);
			}
		}

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			if (commandModeTimeout.current) clearTimeout(commandModeTimeout.current);
		};
	}, [commandMode, router, commandItems]);

	return (
		<nav className="fixed bottom-0 left-1 right-1 z-10 flex w-full flex-col items-center justify-center gap-3 pb-6 pt-4 sm:pb-12">
			<Notifications contractId={contract?.id} messages={messages} open={notificationsOpen} setOpen={setNotificationsOpen} />
			<EmployeeProfileSettings profile={contract?.profile as any} open={showSettings} setOpen={setShowSettings} />

			<ProgressiveBlur className="pointer-events-none absolute bottom-0 left-0 -z-10 h-32 w-full" blurIntensity={1} />

			{/* Command Mode Visual Indicator */}
			{commandMode && (
				<div className="fixed bottom-12 left-14 z-30 animate-pulse rounded-lg border bg-background p-2 text-xs text-muted-foreground shadow-lg">
					<span className="rounded-sm bg-muted px-1 py-0.5 font-bold text-primary">A</span> pressed, now press shortcut key
				</div>
			)}

			{/* Command Palette (floating) */}
			<AnimatePresence>
				{showCommandBar && (
					<motion.div
						ref={commandPaletteRef}
						initial={{ opacity: 0, scale: 0.8, transform: 'translateX(-50%) translateY(10%) scale(0.8)', filter: 'blur(4px)' }}
						animate={{ opacity: 1, scale: 1, transform: 'translateX(-50%) translateY(0%) scale(1)', filter: 'blur(0px)' }}
						exit={{ opacity: 0, scale: 0.8, transform: 'translateX(-50%) translateY(10%) scale(0.8)', filter: 'blur(4px)' }}
						transition={{ ease: 'easeInOut', delay: 0.1, duration: 0.2 }}
						className="absolute bottom-24 left-1/2 z-20 h-fit w-[90%] max-w-md rounded-lg border shadow-md backdrop-blur-xl sm:bottom-28 sm:w-full">
						<Command shouldFilter={false} className="bg-background/70">
							<CommandList className="max-h-80 [&>div]:space-y-4">
								<CommandEmpty>No results found.</CommandEmpty>
								<CommandGroup heading="Quick actions" className="px-2">
									{quickActionCommandItems
										.filter(item => item.label.toLowerCase().includes(search.toLowerCase()))
										.map((item, index) => (
											<CommandItemComponent onSelect={() => setShowCommandBar(false)} key={index} item={item} />
										))}
								</CommandGroup>

								<CommandGroup heading="Pages" className="px-2">
									{commandItems
										.filter(item => item.label.toLowerCase().includes(search.toLowerCase()))
										.map((item, index) =>
											item.hidden ? null : item.function ? (
												<button className="w-full" key={index} onClick={() => item.function()}>
													<CommandItemComponent onSelect={() => setShowCommandBar(false)} item={item} />
												</button>
											) : (
												<Link key={index} href={`./${item.page}`}>
													<CommandItemComponent onSelect={() => setShowCommandBar(false)} item={item} />
												</Link>
											)
										)}
								</CommandGroup>
							</CommandList>
						</Command>
					</motion.div>
				)}
			</AnimatePresence>

			{/* action bar (nav menu or command bar) */}
			<div className="absolute bottom-6 left-1/2 h-12 -translate-x-1/2 sm:bottom-12">
				<Magnetic intensity={0.2} range={80}>
					<motion.div
						ref={actionBarRef}
						className="flex h-12 max-w-[400px] items-center justify-center rounded-full border bg-background/80 px-1 drop-shadow-xl sm:max-w-full"
						style={{ width: showCommandBar ? '448px' : '189px' }}
						animate={{ width: showCommandBar ? '448px' : '189px' }}
						transition={{ type: 'spring', stiffness: 846, damping: 69.2, mass: 6.2 }}>
						<div className="w-[90%] sm:w-full">
							<AnimatePresence mode="wait" initial={false}>
								{showCommandBar ? (
									<motion.div
										key="command-bar"
										initial={{ opacity: 0, filter: 'blur(4px)' }}
										animate={{ opacity: 1, filter: 'blur(0px)' }}
										exit={{ opacity: 0, filter: 'blur(4px)' }}
										transition={{ type: 'spring', stiffness: 300, damping: 30 }}
										className="flex w-full items-center gap-2 bg-transparent">
										<input value={search} onChange={e => setSearch(e.target.value)} placeholder="Type a command or search..." className="w-full border-none bg-transparent px-4 text-sm font-light outline-none" autoFocus />
									</motion.div>
								) : (
									<motion.div key="nav-menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, filter: 'blur(4px)' }} className="w-full">
										<ul className="no-scrollbar flex w-full items-center justify-between gap-2 overflow-x-auto p-0.5 transition-all duration-500">
											{navItems.map((item, index) => (
												<TooltipProvider delayDuration={100} key={index}>
													<Tooltip>
														<TooltipTrigger asChild>
															<li className={cn('')}>
																{item.function ? (
																	<button type="button" className={cn(buttonVariants({ variant: isPageActive(item.page) ? 'default' : 'ghost', size: 'icon' }), 'h-9 w-9 rounded-full')} onClick={() => item.function()}>
																		<item.icon size={14} className={cn('', isPageActive(item.page) && 'text-background')} />
																	</button>
																) : (
																	<Link href={`./${(item.enabled && item.page) || '#'}`} className={cn(buttonVariants({ variant: isPageActive(item.page) ? 'default' : 'ghost', size: 'icon' }), 'h-9 w-9 rounded-full')}>
																		<item.icon size={14} className={cn('', isPageActive(item.page) && 'text-background')} />
																	</Link>
																)}
															</li>
														</TooltipTrigger>
														<TooltipContent className="flex items-center gap-2 px-2 shadow-none" sideOffset={14}>
															{item.label}
															<div className={cn('flex items-center gap-1 text-xs')}>
																<span className={_className}>A</span> then
																<span className={_className}>{item.shortcut}</span>
															</div>
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>
											))}
										</ul>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</motion.div>
				</Magnetic>
			</div>
		</nav>
	);
}
