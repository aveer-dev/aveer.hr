import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { sendEmail } from '@/api/email';
import { useFormStatus } from 'react-dom';
import { LoadingSpinner } from '@/components/ui/loader';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Input } from './input';
import { ReactNode } from 'react';

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

export const ComposeMailDialog = ({ isOpen, toggleDialog, message, subject, recipients, onClose, name, title, description, children, replyTo }: props) => {
	const sendMessage = (form: FormData) => {
		const mailMessage = form.get('message') as string;
		const mailSubject = subject || (form.get('subject') as string);
		if (!mailMessage || !mailSubject) return;

		sendEmail({
			from: `${name} <contracts@notification.aveer.hr>`,
			to: recipients,
			subject: mailSubject,
			text: mailMessage,
			replyTo
		}).then(error => {
			if (error) return toast.error((error as any).message);
			onClose && onClose('success');
			toggleDialog && toggleDialog(false);
		});
	};

	const SendButton = () => {
		const { pending } = useFormStatus();

		return (
			<Button type="submit" disabled={pending} size={'sm'} className="gap-3 px-4 text-xs font-light">
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
						<AlertDialogDescription>{description || 'Fill form below to send mail'}</AlertDialogDescription>
					</AlertDialogHeader>

					<section className="grid gap-4">
						{!subject && (
							<div className="grid gap-2">
								<Label htmlFor="subject">Subject</Label>
								<Input required name="subject" placeholder="Mail subject" id="subject" />
							</div>
						)}

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
