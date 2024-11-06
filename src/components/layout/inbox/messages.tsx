'use client';

import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Button, buttonVariants } from '@/components/ui/button';
import { MessageSquareDot, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { NewMessageSheet } from './new-message-sheet';
import { Tables } from '@/type/database.types';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Message } from './message';
import { updateNotification } from './messages.actions';
import { NavLink } from '@/components/ui/link';

const supabase = createClient();

export const Inbox = ({ org, sender, dbMessages }: { org: string; sender: string; dbMessages: Tables<'inbox'>[] }) => {
	const [messages, setMessages] = useState<Tables<'inbox'>[]>(dbMessages || []);
	const [notifications, updateNotifications] = useState<Tables<'notifications'>[]>([]);
	const [activeTab, setActiveTab] = useState<string>('messages');
	const [open, setOpen] = useState<boolean>();

	const getMessages = async () => {
		const { data, error } = await supabase
			.from('inbox')
			.select('*, sender_profile:profiles!inbox_sender_profile_fkey(id, first_name, last_name)')
			.or(`and(org.eq.${org},draft.eq.false),and(org.eq.${org},draft.eq.true,sender_profile.eq.${sender})`)
			.order('created_at', { ascending: false });
		if (error) return toast.error('Unable to fetch new message', { description: error.message });

		setMessages(data);
	};

	const getNotifications = useCallback(async () => {
		const { data, error } = await supabase.from('notifications').select('*, sender_profile:profiles!notifications_sender_profile_fkey(id, first_name, last_name)').match({ org });
		if (error) toast.error('Unable to fetch notifications', { description: error.message });
		if (data) updateNotifications(data);
	}, [org]);

	const isMessageRead = (notification: Tables<'notifications'>) => !!notification.read.find(msg => msg === sender);

	const onReadMessage = async ({ notification, index }: { notification: Tables<'notifications'>; index: number }) => {
		notification.read.push(sender);
		const payload = { read: notification.read };
		const response = await updateNotification({ id: notification.id, payload });

		if (typeof response === 'string') return toast.error('Unable to update message read state', { description: response });
		notifications[index] = response;
		updateNotifications([...notifications]);
	};

	useEffect(() => {
		getNotifications();
	}, [getNotifications]);

	return (
		<Drawer open={open} onOpenChange={setOpen} direction="right">
			<DrawerTrigger asChild>
				<Button variant={'ghost'} className="gap-3">
					<MessageSquareDot className="" size={16} />
					Inbox
				</Button>
			</DrawerTrigger>

			<DrawerContent
				overlayClassName="bg-white/70 backdrop-blur-md"
				className="p4 bottom-2 left-[unset] right-2 top-2 mt-0 w-[310px] rounded-none border-none bg-transparent outline-none [&>div]:hidden"
				style={{ '--initial-transform': 'calc(100% + 8px)' } as React.CSSProperties}>
				<section className="relative grow overflow-y-auto rounded-3xl border bg-background pb-16 pt-4">
					<Tabs defaultValue={activeTab} onValueChange={value => setActiveTab(value)} className="">
						<TabsList className="mx-4 flex w-fit">
							<TabsTrigger value="messages">Messages</TabsTrigger>
							<TabsTrigger value="notifications">Notifications</TabsTrigger>
						</TabsList>

						<DrawerClose className={cn(buttonVariants({ variant: 'outline' }), 'absolute right-4 top-4 h-8 w-8 rounded-full p-0')}>
							<X size={14} />
						</DrawerClose>

						<TabsContent value="messages" className="px-4">
							<DrawerHeader className="mb-4 px-0">
								<DrawerTitle className="text-base">Messages</DrawerTitle>
								<DrawerDescription className="text-xs">Inbox messages sent to employees</DrawerDescription>
							</DrawerHeader>

							{messages?.length > 0 && (
								<ul className="space-y-8">
									{messages?.map((message, index) => (
										<Fragment key={message.id}>
											<Message currentUserId={sender} getMessages={getMessages} org={org} sender={sender} message={message} />

											{messages.length - 1 !== index && <Separator />}
										</Fragment>
									))}
								</ul>
							)}

							{messages?.length === 0 && (
								<div className="px-4">
									<div className="flex h-48 w-full items-center justify-center rounded-md bg-muted text-center text-xs font-light text-muted-foreground">
										No messages yet. <br />
										<br /> Take your time, cook!.
									</div>
								</div>
							)}
						</TabsContent>

						<TabsContent value="notifications">
							<DrawerHeader className="mb-2 px-4">
								<DrawerTitle className="text-base">Notifications</DrawerTitle>
								<DrawerDescription className="text-xs">Notifications around the organisation</DrawerDescription>
							</DrawerHeader>

							{!!notifications.length &&
								notifications?.map((notification, index) => (
									<NavLink
										onClick={() => {
											isMessageRead(notification) ? null : onReadMessage({ notification, index });
											setOpen(false);
										}}
										org={org}
										href={`${notification.link}`}
										key={notification.id}
										className="flex flex-1 items-center justify-between rounded-md border-b px-4 py-4 transition-all duration-500 hover:bg-muted/80">
										{!isMessageRead(notification) && <div className="mb-auto mr-3 mt-1.5 h-2 w-2 rounded-full bg-blue-600"></div>}

										<div className="w-full text-sm">
											{notification.title}
											<p className="text-xs font-light text-support">From {(notification.sender_profile as any).first_name + ' ' + (notification.sender_profile as any).last_name}</p>
										</div>
									</NavLink>
								))}

							{!notifications.length && <div className="flex min-h-52 w-full items-center justify-center rounded-md bg-muted p-4 text-center text-xs font-light leading-6 text-muted-foreground">Nothing is going on yet, you&apos;re completely cought up</div>}
						</TabsContent>
					</Tabs>
				</section>

				{activeTab === 'messages' && <NewMessageSheet onMessageSent={getMessages} org={org} sender={sender} />}
			</DrawerContent>
		</Drawer>
	);
};
