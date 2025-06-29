'use client';

import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Command, MessageSquare, MessageSquareDot, X } from 'lucide-react';
import { Tables } from '@/type/database.types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CommandShortcut } from '@/components/ui/command';
import { useState, useEffect } from 'react';
import { generateHTML } from '@tiptap/html';
import ExtensionKit from '@/components/tiptap/extensions/extension-kit';
import { updateMessage } from '@/components/layout/inbox/messages.actions';
import { toast } from 'sonner';
import Document from '@tiptap/extension-document';
import { useSearchParams } from 'next/navigation';

const getMessageBody = (json: string) => {
	const output = generateHTML(JSON.parse(json), [Document, ...ExtensionKit]);
	return output;
};

export const Notifications = ({ contractId, messages, open, setOpen }: { contractId?: number; messages: Tables<'inbox'>[] | null; open: boolean; setOpen: (open: boolean) => void }) => {
	const searchParams = useSearchParams();
	const activeMessageId = messages?.find(message => message.id == Number(searchParams.get('messages')))?.id;

	const [_messages, updateMessages] = useState(messages || []);

	if (messages && messages.length > 0) messages = messages.filter(message => !message.draft);

	useEffect(() => {
		setOpen(!!activeMessageId);
	}, [activeMessageId, setOpen]);

	const isMessageRead = (message: Tables<'inbox'>) => !!message.read.find(msg => msg === contractId);

	const onReadMessage = async (message: Tables<'inbox'>, index: number) => {
		if (!contractId) return;

		(message.read as number[]).push(contractId);
		const payload = { read: message.read };
		const response = await updateMessage({ id: message.id, payload });

		if (typeof response === 'string') return toast.error('Unable to update message read state', { description: response });
		_messages[index] = response;
		updateMessages([..._messages]);
	};

	return (
		<AlertDialog
			open={open}
			onOpenChange={state => {
				setOpen(state);

				if (state && activeMessageId) {
					const messageIndex = _messages.findIndex(message => message.id == activeMessageId);
					isMessageRead(_messages[messageIndex]) ? false : onReadMessage(_messages[messageIndex], messageIndex);
				}
			}}>
			{/* <TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<AlertDialogTrigger asChild>
							<Button onClick={() => setOpen(!open)} className="h-8 w-8 rounded-2xl border p-0" variant={'secondary'}>
								{_messages.filter(message => !isMessageRead(message)).length > 0 ? <MessageSquareDot size={12} /> : <MessageSquare size={12} />}
							</Button>
						</AlertDialogTrigger>
					</TooltipTrigger>

					<TooltipContent align="center">
						<p>
							<CommandShortcut className="flex items-center gap-1">
								<Command size={12} /> N | Messages
							</CommandShortcut>
						</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider> */}

			<AlertDialogContent onCloseAutoFocus={event => event.preventDefault()} onOpenAutoFocus={event => event.preventDefault()} className="block max-h-screen w-full max-w-xl overflow-y-auto">
				<AlertDialogHeader className="flex-row justify-between text-left">
					<div>
						<AlertDialogTitle>Messages</AlertDialogTitle>
						<AlertDialogDescription>Company wide messages</AlertDialogDescription>
					</div>

					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<AlertDialogCancel className="rounded-full">
									<X size={12} />
								</AlertDialogCancel>
							</TooltipTrigger>
							<TooltipContent align="start" side="left">
								<p>
									<CommandShortcut>esc</CommandShortcut>
								</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</AlertDialogHeader>

				<section className="mt-8 min-h-96 space-y-8 overflow-scroll">
					{!!_messages.length && (
						<Accordion type="single" collapsible className="w-full" defaultValue={String(activeMessageId)}>
							{_messages?.map((message, index) => (
								<AccordionItem key={message.id} value={String(message.id)}>
									<AccordionTrigger className="text-left" onClick={() => (isMessageRead(message) ? null : onReadMessage(message, index))}>
										{!isMessageRead(message) && <div className="mb-auto mr-3 mt-1.5 h-2 w-2 rounded-full bg-blue-600"></div>}

										<div className="w-full text-sm">
											{message.title}
											<p className="text-xs font-light text-support">
												From {(message.sender_profile as any).first_name + ' ' + (message.sender_profile as any).last_name} {message.updated_at ? <>• edited</> : null}
											</p>
										</div>
									</AccordionTrigger>

									<AccordionContent className="py-6">
										<div className="tiptap" dangerouslySetInnerHTML={{ __html: getMessageBody(message.message) }}></div>
									</AccordionContent>
								</AccordionItem>
							))}
						</Accordion>
					)}

					{!messages?.length && <div className="flex h-48 w-full items-center justify-center rounded-md bg-muted text-sm font-light text-muted-foreground">No messages yet, HR is still cooking.</div>}
				</section>
			</AlertDialogContent>
		</AlertDialog>
	);
};
