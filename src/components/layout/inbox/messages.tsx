'use client';

import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Button, buttonVariants } from '@/components/ui/button';
import { MessageSquareDot, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn, getTimeDifference } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import { Fragment, useState } from 'react';
import { NewMessageSheet } from './new-message-sheet';
import { Tables } from '@/type/database.types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Icon } from './components/Icon';
import { DeleteMessageDialog } from './delete-message-dialog';

const DateTime = ({ date }: { date: Date }) => {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<p className="text-xs underline decoration-dashed">{getTimeDifference(new Date(date))}</p>
				</TooltipTrigger>

				<TooltipContent align="end">
					<p>{format(new Date(date), 'PPP')}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};

const Message = ({ message, currentUserId, getMessages, org, sender }: { message: Tables<'inbox'>; currentUserId?: string; getMessages: () => void; org: string; sender: string }) => {
	return (
		<li className="space-y-2">
			<div className="space-y-1">
				<div className="space-y-2">
					<div className={cn('space-y-3 rounded-md p-2', !message.draft && !message.send_time && 'bg-secondary', (message.draft || message.send_time) && 'border border-dashed', message.send_time && 'border-blue-300 bg-blue-50')}>
						<p className="text-sm font-medium leading-6">{message.title}</p>

						<div className="flex items-center justify-between font-light text-muted-foreground">
							<p className="text-xs">
								From: {(message.sender_profile as any).first_name} {(message.sender_profile as any).last_name}
							</p>

							<DateTime date={new Date(message.created_at)} />
						</div>
					</div>
				</div>

				<div className="flex justify-between text-[10px] font-thin italic text-muted-foreground">
					{message.updated_at && (
						<>
							edited
							<DateTime date={new Date(message.updated_at)} />
						</>
					)}

					{message.send_time && (
						<>
							scheduled
							<DateTime date={new Date(message.send_time)} />
						</>
					)}

					{message.draft && 'draft'}
				</div>
			</div>

			<div className="flex items-center justify-between gap-2">
				<DeleteMessageDialog title={message.title} id={message.id} onMessageDeleted={getMessages}>
					<Button className="h-fit w-full justify-between gap-2 py-2" variant={'secondary_destructive'} disabled={currentUserId !== (message.sender_profile as any).id}>
						<Icon name="Trash2" />
						<span>Delete</span>
						<Icon name="ChevronRight" className="ml-auto" />
					</Button>
				</DeleteMessageDialog>

				<NewMessageSheet onMessageSent={getMessages} org={org} message={message} sender={sender}>
					<Button className="h-fit w-full justify-between gap-2 py-2" variant={'secondary'}>
						<Icon name="BookOpenText" />
						<span>Open</span>
						<Icon name="ChevronRight" className="ml-auto" />
					</Button>
				</NewMessageSheet>
			</div>
		</li>
	);
};

const supabase = createClient();

export const Inbox = ({ org, sender, dbMessages }: { org: string; sender: string; dbMessages: Tables<'inbox'>[] }) => {
	const [messages, setMessages] = useState<Tables<'inbox'>[]>(dbMessages || []);

	const getMessages = async () => {
		const { data, error } = await supabase
			.from('inbox')
			.select('*, sender_profile:profiles!inbox_sender_profile_fkey(id, first_name, last_name)')
			.or(`and(org.eq.${org},draft.eq.false),and(org.eq.${org},draft.eq.true,sender_profile.eq.${sender})`)
			.order('created_at', { ascending: false });
		if (error) return toast.error('Unable to fetch new message', { description: error.message });

		setMessages(data);
	};

	return (
		<Drawer direction="right" modal={false}>
			<DrawerTrigger asChild>
				<Button variant={'ghost'} className="gap-3">
					<MessageSquareDot className="" size={16} />
					Inbox
				</Button>
			</DrawerTrigger>

			<DrawerContent className="p4 bottom-2 left-[unset] right-2 top-2 mt-0 w-[310px] rounded-none border-none bg-transparent outline-none [&>div]:hidden" style={{ '--initial-transform': 'calc(100% + 8px)' } as React.CSSProperties}>
				<section className="relative grow space-y-4 overflow-y-auto rounded-3xl border bg-background/90 pb-16 backdrop-blur-lg">
					<DrawerHeader className="p-6 pb-0">
						<DrawerTitle className="text-base">Inbox</DrawerTitle>
						<DrawerDescription className="text-xs">Inbox messages send to employees</DrawerDescription>

						<DrawerClose className={cn(buttonVariants({ variant: 'outline' }), 'absolute right-4 top-4 h-8 w-8 rounded-full p-0')}>
							<X size={14} />
						</DrawerClose>
					</DrawerHeader>

					<Separator />

					{messages?.length > 0 && (
						<ul className="space-y-6 px-4 pt-4">
							{messages?.map((message, index) => (
								<Fragment key={message.id}>
									<Message currentUserId={sender} getMessages={getMessages} org={org} sender={sender} message={message} />

									{messages.length - 1 !== index && <Separator />}
								</Fragment>
							))}
						</ul>
					)}
				</section>

				<NewMessageSheet onMessageSent={getMessages} org={org} sender={sender} />
			</DrawerContent>
		</Drawer>
	);
};
