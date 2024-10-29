'use client';

import { MessageInput } from './message-input';
import { Button, buttonVariants } from '@/components/ui/button';
import { Send, X } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerNested, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Tables } from '@/type/database.types';

export const NewMessageSheet = ({ org, message, onMessageSent, sender, children }: { children?: ReactNode; org: string; message?: Tables<'inbox'>; sender?: string; onMessageSent: () => void }) => {
	const [isOpen, toggleOpenState] = useState(false);

	return (
		<DrawerNested open={isOpen} onOpenChange={toggleOpenState} dismissible={false} direction="right" modal={false}>
			{!children && (
				<DrawerTrigger asChild>
					<Button name="new message" title="new message" className="fixed bottom-2 right-2 rounded-full">
						<Send size={12} />
					</Button>
				</DrawerTrigger>
			)}

			{children && <DrawerTrigger asChild>{children}</DrawerTrigger>}

			<DrawerContent className="p4 bottom-2 left-[unset] right-2 top-2 mt-0 w-full max-w-md rounded-none border-none bg-transparent outline-none [&>div]:hidden" style={{ '--initial-transform': 'calc(100% + 8px)' } as React.CSSProperties}>
				<section className="grow space-y-4 overflow-y-auto rounded-3xl border bg-background/80 backdrop-blur-lg">
					<DrawerHeader className="p-6 pb-0">
						<DrawerTitle className="text-base">{message?.title || 'Draft'}</DrawerTitle>
						<DrawerDescription className="text-xs">New message to employees</DrawerDescription>

						<DrawerClose className={cn(buttonVariants({ variant: 'outline' }), 'absolute right-4 top-4 h-8 w-8 rounded-full p-0')}>
							<X size={14} />
						</DrawerClose>
					</DrawerHeader>

					<Separator />

					<MessageInput
						org={org}
						sender={sender}
						message={message}
						onMessageSent={() => {
							onMessageSent();
							toggleOpenState(false);
						}}
					/>
				</section>
			</DrawerContent>
		</DrawerNested>
	);
};
