import { cn, getTimeDifference } from '@/lib/utils';
import { Tables } from '@/type/database.types';
import { DeleteMessageDialog } from './delete-message-dialog';
import { NewMessageSheet } from './new-message-sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Icon } from './components/Icon';

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

export const Message = ({ message, currentUserId, getMessages, org, sender }: { message: Tables<'inbox'>; currentUserId?: string; getMessages: () => void; org: string; sender: string }) => {
	return (
		<li className="space-y-2">
			<div className="space-y-1">
				<div className="space-y-2">
					<div className={cn('space-y-3 rounded-md p-2', !message.draft && !message.send_time && 'bg-secondary', (message.draft || message.send_time) && 'border border-dashed', message.send_time && 'border-blue-300')}>
						<p className="text-sm font-normal leading-6">{message.title}</p>

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
