'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Update } from '@/app/(website)/updates/update';
import { UPDATE } from '@/type/updates';
import { CompileMDXResult } from 'next-mdx-remote/rsc';
import { upsertUserUpdateView } from './actions';
import { Tables } from '@/type/database.types';
import { Button } from '@/components/ui/button';
import { Info, SquareArrowOutUpRight, X } from 'lucide-react';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface UpdatesAlertDialogProps {
	userId: string;
	contractId: number;
	userUpdateView: Tables<'user_update_views'> | null;
	updates: CompileMDXResult<UPDATE>[];
}

export const UpdatesAlertDialog = ({ userId, contractId, userUpdateView, updates }: UpdatesAlertDialogProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [recentUpdates, setRecentUpdates] = useState<CompileMDXResult<UPDATE>[]>([]);

	useEffect(() => {
		const checkAndLoadUpdates = async () => {
			// If there's no view record or there are updates newer than last_viewed_at
			if (!userUpdateView || updates.some(update => new Date(update.frontmatter.date) > new Date(userUpdateView.last_viewed_at))) {
				// Show the last 3 updates or all updates since last view
				const recentUpdates = userUpdateView ? updates.filter(update => new Date(update.frontmatter.date) > new Date(userUpdateView.last_viewed_at)) : updates.slice(0, 3);

				setRecentUpdates(recentUpdates);
				if (recentUpdates.length > 0) setTimeout(() => setIsOpen(true), 1000);
			}
		};

		checkAndLoadUpdates();
	}, [userId, contractId, userUpdateView, updates]);

	const handleClose = async () => {
		setIsOpen(false);

		await upsertUserUpdateView(userId, contractId);
	};

	return (
		<>
			{recentUpdates.length > 0 && (
				<TooltipProvider>
					<Tooltip delayDuration={0}>
						<TooltipTrigger asChild>
							<Button variant="secondary" className="fixed bottom-12 left-4 z-30 h-8 w-8" onClick={() => setIsOpen(true)}>
								<Info className="w-10 scale-150" />
							</Button>
						</TooltipTrigger>
						<TooltipContent side="right">
							<p>Platform updates</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			)}

			<Dialog open={isOpen} onOpenChange={handleClose}>
				<DialogContent className="no-scrollbar flex h-[calc(100vh-2rem)] w-[90%] max-w-[681px] flex-col gap-4 overflow-auto rounded-lg border bg-background px-0 pt-0 [&>button]:hidden" overlayClassName="bg-transparent backdrop-blur-sm">
					<DialogHeader className="sticky top-0 flex-row items-center justify-between space-y-0 border-b bg-muted px-4 py-0.5">
						<div className="flex items-center gap-2">
							<DialogClose asChild>
								<Button variant="ghost" size="icon" className="h-6 w-6">
									<X size={14} />
								</Button>
							</DialogClose>
							<DialogTitle className="text-xs font-medium">Updates</DialogTitle>
						</div>

						<Link href="/updates" className="group flex items-center gap-2 py-1 text-xs text-muted-foreground hover:text-foreground">
							<span>https://aveer.hr/updates</span>
							<SquareArrowOutUpRight size={12} className="transition-transform group-hover:scale-105" />
						</Link>
					</DialogHeader>

					<div className="flex-1 space-y-16 px-6 pt-10">
						{recentUpdates.map(update => (
							<Update key={update.frontmatter.slug} update={update} />
						))}
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
};
