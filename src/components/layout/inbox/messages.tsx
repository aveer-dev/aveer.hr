import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerNested, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Button, buttonVariants } from '@/components/ui/button';
import { MessageSquareDot, Send, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { MessageInput } from './message-input';

const Message = () => {
	return (
		<li className="space-y-2">
			<h2 className="truncate text-xs font-medium">
				<span className="font-light text-support">Emma Aina</span> - Human Resource
			</h2>

			<p className="rounded-md bg-muted p-2 text-xs font-light leading-6">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Officiis iusto et laboriosam.</p>

			<div className="flex items-center justify-between font-light text-muted-foreground">
				<p className="text-xs">2hrs ago</p>

				<p className="text-xs">Seen by 2/10</p>
			</div>
		</li>
	);
};

const NewMessage = () => {
	return (
		<DrawerNested direction="right" modal={false}>
			<DrawerTrigger asChild>
				<Button name="new message" title="new message" className="absolute bottom-2 right-2 rounded-full">
					<Send size={12} />
				</Button>
			</DrawerTrigger>

			<DrawerContent className="p4 bottom-2 left-[unset] right-2 top-2 mt-0 w-full max-w-md rounded-none border-none bg-transparent outline-none [&>div]:hidden" style={{ '--initial-transform': 'calc(100% + 8px)' } as React.CSSProperties}>
				<section className="grow space-y-4 overflow-y-auto rounded-3xl border bg-background/80 backdrop-blur-lg">
					<DrawerHeader className="p-6 pb-0">
						<DrawerTitle className="text-base">Draft</DrawerTitle>
						<DrawerDescription className="text-xs">New message to employees</DrawerDescription>

						<DrawerClose className={cn(buttonVariants({ variant: 'outline' }), 'absolute right-4 top-4 h-8 w-8 rounded-full p-0')}>
							<X size={14} />
						</DrawerClose>
					</DrawerHeader>

					<Separator />

					<div className="space-y-4 p-6 pt-0">
						<input className="bg-transparent text-base font-semibold outline-none" placeholder="Message title" />

						<MessageInput />
					</div>
				</section>
			</DrawerContent>
		</DrawerNested>
	);
};

export const Inbox = () => {
	return (
		<Drawer direction="right" modal={false}>
			<DrawerTrigger asChild>
				<Button variant={'ghost'} className="gap-3">
					<MessageSquareDot className="" size={16} />
					Inbox
				</Button>
			</DrawerTrigger>

			<DrawerContent className="p4 bottom-2 left-[unset] right-2 top-2 mt-0 w-[310px] rounded-none border-none bg-transparent outline-none [&>div]:hidden" style={{ '--initial-transform': 'calc(100% + 8px)' } as React.CSSProperties}>
				<section className="grow space-y-4 overflow-y-auto rounded-3xl border bg-background/80 backdrop-blur-lg">
					<DrawerHeader className="p-6 pb-0">
						<DrawerTitle className="text-base">Inbox</DrawerTitle>
						<DrawerDescription className="text-xs">Inbox messages send to employees</DrawerDescription>

						<DrawerClose className={cn(buttonVariants({ variant: 'outline' }), 'absolute right-4 top-4 h-8 w-8 rounded-full p-0')}>
							<X size={14} />
						</DrawerClose>
					</DrawerHeader>

					<Separator />

					<ul className="space-y-4 p-6 pt-4">
						<Message />

						<Separator />

						<Message />

						<NewMessage />
					</ul>
				</section>
			</DrawerContent>
		</Drawer>
	);
};
