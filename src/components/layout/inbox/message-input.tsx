'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Send, Timer } from 'lucide-react';
import { useRef, useState } from 'react';
import './styles.css';
import { TextMenu } from './components/menus';
import { ExtensionKit } from './extensions/extension-kit';
import { ContentItemMenu, LinkMenu } from './components/menus';
import { sendMessage, updateMessage } from './messages.actions';
import { Tables, TablesInsert, TablesUpdate } from '@/type/database.types';
import { toast } from 'sonner';
import { Icon } from './components/Icon';
import { DatePicker } from '@/components/ui/date-picker';
import { cn } from '@/lib/utils';
import { format, isPast } from 'date-fns';
import { LoadingSpinner } from '@/components/ui/loader';
import { DrawerClose } from '@/components/ui/drawer';
import { DeleteMessageDialog } from './delete-message-dialog';

const getTime = (dateString?: string) => {
	const date = dateString ? new Date(dateString) : new Date();
	const hour = date.getHours();
	const minute = date.getMinutes();

	if (minute < 10) {
		return `${hour}:0${minute}`;
	}

	if (hour < 10) {
		return `0${hour}:${minute}`;
	}

	return `${hour}:${minute}`;
};

export const MessageInput = ({ org, sender, message, onMessageSent }: { org: string; sender?: string; onMessageSent: () => void; message?: Tables<'inbox'> }) => {
	const menuContainerRef = useRef(null);
	const isScheduledDatePassed = message?.send_time ? isPast(new Date(message?.send_time)) : true;
	const [title, setTitle] = useState(message?.title || '');
	const [scheduleDate, setScheduleDate] = useState(message?.send_time && !isScheduledDatePassed ? new Date(message?.send_time) : new Date());
	const [scheduleTime, setScheduleTime] = useState(message?.send_time && !isScheduledDatePassed ? getTime(message?.send_time) : getTime());
	const [enableMessageSchedule, setMessageScheduleState] = useState(!isScheduledDatePassed);
	const [isSending, setSendingState] = useState(false);
	const [isScheduling, setSchedulingState] = useState(false);
	const editable = message ? sender == (message?.sender_profile as any).id : true;

	const editor = useEditor({
		extensions: ExtensionKit,
		immediatelyRender: false,
		content: message?.message ? JSON.parse(message.message) : null,
		editorProps: {
			attributes: {
				class: 'h-[60vh] w-full resize-none bg-transparent text-sm font-light leading-6 outline-none'
			},
			editable() {
				return editable;
			}
		}
	});

	const onSendMessage = async ({ draft, scheduled }: { draft?: boolean; scheduled?: boolean }) => {
		if (!editor || !title || !sender) return;

		const schedule = scheduled ? new Date(`${format(scheduleDate, 'yyyy-MM-dd')} ${scheduleTime}`).toISOString() : null;

		scheduled ? setSchedulingState(true) : setSendingState(true);
		const payload: TablesInsert<'inbox'> = { message: JSON.stringify(editor.getJSON()), org, sender_profile: sender, draft, title, send_time: schedule };
		const response = await sendMessage({ payload });
		scheduled ? setSchedulingState(false) : setSendingState(false);

		if (typeof response === 'string') return toast.error('Unable to send message', { description: response });

		onMessageSent();
		toast.success('🎉 Message sent to employees');
	};

	const onUpdateMessage = async ({ scheduled }: { scheduled?: boolean }) => {
		if (!editor || !title || !sender || !message) return;

		const send_time = scheduled ? new Date(`${format(scheduleDate, 'yyyy-MM-dd')} ${scheduleTime}`).toISOString() : null;

		scheduled ? setSchedulingState(true) : setSendingState(true);
		const payload: TablesUpdate<'inbox'> = { message: JSON.stringify(editor.getJSON()), title };
		if (send_time) payload.send_time = send_time;
		if (!message.draft && !message.send_time) payload.updated_at = new Date().toISOString();

		const response = await updateMessage({ payload, id: message?.id });
		scheduled ? setSchedulingState(false) : setSendingState(false);

		if (typeof response === 'string') return toast.error('Unable to send message', { description: response });

		onMessageSent();
		toast.success('Message updated');
	};

	return (
		<section className="space-y-4 p-6">
			<input disabled={!editable} className="w-full bg-transparent text-base font-semibold outline-none" value={title} onChange={event => setTitle(event.target.value)} placeholder="Message title" />

			{!!editor && (
				<div ref={menuContainerRef}>
					<EditorContent className="overflow-auto" editor={editor} />

					{editable && (
						<>
							<ContentItemMenu editor={editor} />
							<LinkMenu editor={editor} appendTo={menuContainerRef} />
						</>
					)}
				</div>
			)}

			<div className={cn('absolute bottom-6 left-6 right-6 space-y-6')}>
				{!!editor && editable && <TextMenu editor={editor} />}

				<Separator />

				<div className={cn('flex items-center justify-end gap-4 transition-all', enableMessageSchedule && 'flex-wrap rounded-md border border-dashed border-blue-300 p-2')}>
					{enableMessageSchedule && (
						<div className="flex w-full gap-2 rounded-md bg-blue-50 px-2 py-1.5">
							<Icon name="Timer" size={14} className="mt-1" />

							<div className="flex items-center gap-1 text-xs font-light">
								Send message on
								<DatePicker selected={scheduleDate} onSetDate={setScheduleDate}>
									<button className="rounded-sm bg-blue-100 px-1 py-px"> {format(scheduleDate, 'PPP')}</button>
								</DatePicker>
								by <input value={scheduleTime} onChange={event => setScheduleTime(event.target.value)} className="rounded-sm bg-blue-100 px-1 py-px" type="time" />
							</div>
						</div>
					)}

					{!enableMessageSchedule && (
						<div className="mr-auto flex items-center">
							{editable && (
								<>
									{message && (
										<DeleteMessageDialog title={message.title} id={message.id} onMessageDeleted={onMessageSent}>
											<Button tooltip="Delete" className="gap-3" variant={'ghost_destructive'}>
												<Icon name="Trash2" size={14} />
											</Button>
										</DeleteMessageDialog>
									)}

									{!message && (
										<DrawerClose asChild>
											<Button tooltip="Delete" className="gap-3" variant={'ghost_destructive'}>
												<Icon name="Trash2" size={14} />
											</Button>
										</DrawerClose>
									)}
								</>
							)}

							{(!message || message?.draft) && (
								<Button tooltip="Save as draft" className="gap-3" variant={'ghost'} onClick={() => onSendMessage({ draft: true })}>
									<Icon name="HardDriveDownload" size={14} />
								</Button>
							)}
						</div>
					)}

					{enableMessageSchedule && (
						<Button className="h-7 w-7 rounded-full p-0" variant={'outline'} onClick={() => setMessageScheduleState(false)}>
							<Icon name="X" size={14} />
						</Button>
					)}

					{(!message || message?.draft || !isScheduledDatePassed) && (
						<Button
							className="ml-auto gap-3"
							variant={enableMessageSchedule ? 'default' : 'outline'}
							disabled={!title || !editor || (enableMessageSchedule ? (!scheduleDate && !scheduleTime) || isScheduling || isSending : false)}
							onClick={() => {
								if (!enableMessageSchedule) return setMessageScheduleState(true);

								if (!message) return onSendMessage({ draft: false, scheduled: true });
								if (message) return onUpdateMessage({ scheduled: true });
							}}>
							{isScheduling ? <LoadingSpinner /> : <Timer size={12} />} Schedule Message
						</Button>
					)}

					{!enableMessageSchedule && (
						<Button className={cn('gap-3 px-8 transition-all')} disabled={!title || !editor || isSending} onClick={() => (message ? onUpdateMessage({}) : onSendMessage({ draft: false }))}>
							{isSending && <LoadingSpinner />}
							{message && !message.draft && isScheduledDatePassed ? 'Update' : 'Send'} {(!message || message.draft || !isScheduledDatePassed) && <Send size={12} />}
						</Button>
					)}
				</div>
			</div>
		</section>
	);
};
