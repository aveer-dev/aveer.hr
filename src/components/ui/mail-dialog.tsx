import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { sendEmail } from '@/api/email';
import { useFormStatus } from 'react-dom';
import { LoadingSpinner } from '@/components/ui/loader';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Input } from './input';
import { ReactNode, useEffect, useState } from 'react';
import { Badge } from './badge';
import { createClient } from '@/utils/supabase/client';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from './scroll-area';

interface props {
	message?: string;
	subject?: string;
	name: string;
	isOpen?: boolean;
	recipients: string[];
	toggleDialog?: (state: boolean) => void;
	onClose?: (state?: 'success' | 'error') => void;
	title?: string;
	description?: string;
	children?: ReactNode;
	replyTo?: string;
}

const supabase = createClient();

export const ComposeMailDialog = ({ isOpen, toggleDialog, message, subject, recipients, onClose, name, title, description, children, replyTo }: props) => {
	const [copyEmail, setCopyEmail] = useState('');
	const [showMoreRecipients, setShowMoreRecipients] = useState(false);

	useEffect(() => {
		const getEmail = async () => {
			const email = (await supabase.auth.getSession()).data.session?.user.email;
			if (email) setCopyEmail(email);
		};

		getEmail();
	}, []);

	const sendMessage = async (form: FormData) => {
		const mailMessage = form.get('message') as string;
		const mailSubject = form.get('subject') as string;
		const cc = (form.get('cc') as string).split(',');

		if (!mailMessage || !mailSubject) return;

		sendEmail({
			from: `${name} <contracts@notification.aveer.hr>`,
			to: recipients,
			subject: mailSubject,
			text: mailMessage,
			cc,
			replyTo
		}).then(response => {
			if (response.error) return toast.error(response.error?.message);
			toast.success('Email sent to applicants');
			onClose && onClose('success');
			toggleDialog && toggleDialog(false);
		});
	};

	const SendButton = () => {
		const { pending } = useFormStatus();

		return (
			<Button type="submit" disabled={pending} size={'sm'} className="gap-3 px-12 text-xs font-light">
				{pending && <LoadingSpinner />}
				{pending ? 'Sending' : 'Send'}
			</Button>
		);
	};

	return (
		<AlertDialog open={isOpen} onOpenChange={state => toggleDialog && toggleDialog(state)}>
			<AlertDialogTrigger asChild>{children}</AlertDialogTrigger>

			<AlertDialogContent className="h-screen w-screen max-w-none overflow-y-auto">
				<div className="flex h-full w-full items-center justify-center">
					<form action={sendMessage} className="grid w-full max-w-lg gap-8">
						<AlertDialogHeader>
							<AlertDialogTitle>{title || 'Send a message'}</AlertDialogTitle>
							<AlertDialogDescription>{description || `Fill form below to send mail to`}</AlertDialogDescription>

							<div className="flex flex-wrap gap-2">
								{recipients.slice(0, 4).map(recipient => (
									<Badge className="w-fit" variant={'secondary'} key={recipient}>
										{recipient}
									</Badge>
								))}
								{recipients.length > 4 && (
									<Popover open={showMoreRecipients} modal={true} onOpenChange={setShowMoreRecipients}>
										<PopoverTrigger asChild>
											<Badge className="w-fit cursor-pointer" variant={'secondary'}>
												+{recipients.length - 4} more
											</Badge>
										</PopoverTrigger>

										<PopoverContent className="w-48 overflow-y-auto p-2">
											<ScrollArea className="h-72">
												<div className="flex flex-col gap-2">
													{recipients.slice(4).map(recipient => (
														<Badge className="w-fit" variant={'secondary'} key={recipient}>
															{recipient}
														</Badge>
													))}
												</div>
											</ScrollArea>
										</PopoverContent>
									</Popover>
								)}
							</div>
						</AlertDialogHeader>

						<section className="grid gap-6">
							<div className="grid gap-2">
								<Label htmlFor="cc" className="flex gap-1">
									Cc
								</Label>
								<Input defaultValue={copyEmail} name="cc" id="cc" />
								<p className="text-xs font-light text-muted-foreground">Separate emails with commas</p>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="subject">Subject</Label>
								<Input required defaultValue={subject} name="subject" placeholder="Mail subject" id="subject" />
							</div>

							<div className="grid gap-2">
								<Label htmlFor="message">Message</Label>
								<Textarea required id="message" name="message" defaultValue={message} className="min-h-52 resize-none" />
							</div>
						</section>

						<AlertDialogFooter className="mt-2">
							<AlertDialogCancel onClick={() => onClose && onClose()}>Cancel</AlertDialogCancel>
							<SendButton />
						</AlertDialogFooter>
					</form>
				</div>
			</AlertDialogContent>
		</AlertDialog>
	);
};
