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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

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
			<AlertDialogContent>
				<form action={sendMessage} className="grid gap-8">
					<AlertDialogHeader>
						<AlertDialogTitle>{title || 'Send a message'}</AlertDialogTitle>
						<AlertDialogDescription>{description || `Fill form below to send mail to`}</AlertDialogDescription>
						<div className="flex flex-wrap gap-2">
							{recipients.map(recipient => (
								<Badge className="w-fit" variant={'secondary'} key={recipient}>
									{recipient}
								</Badge>
							))}
						</div>
					</AlertDialogHeader>

					<section className="grid gap-4">
						<div className="grid gap-2">
							<Label htmlFor="subject" className="flex gap-1">
								Cc
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<button>
												<Info className="text-label" size={12} />
											</button>
										</TooltipTrigger>
										<TooltipContent>
											<p>Comma separated emails</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</Label>
							<Input defaultValue={copyEmail} name="cc" id="cc" />
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
			</AlertDialogContent>
		</AlertDialog>
	);
};
