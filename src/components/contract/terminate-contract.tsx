'use client';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { FileX2 } from 'lucide-react';
import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from 'sonner';

export const TerminateContract = ({ job_title, first_name, deleteContract, terminateContract, action }: { action: 'delete' | 'terminate'; job_title: string; first_name: string; deleteContract: () => Promise<string>; terminateContract: () => Promise<string> }) => {
	const [isOpen, toggleOpenState] = useState(false);

	const submitForm = async () => {
		if (action == 'terminate') {
			const error = await terminateContract();
			if (error) return toast.error(error);
		}

		if (action == 'delete') {
			const error = await deleteContract();
			if (error) return toast.error(error);
		}
	};

	const SubmitButton = () => {
		const { pending } = useFormStatus();

		return (
			<Button type="submit" disabled={pending} variant={'destructive'} size={'sm'} className="px-8 text-xs font-light">
				{pending ? `${action == 'delete' ? 'Deleting' : 'Terminating'}...` : `${action == 'delete' ? 'Delete' : 'Terminate'}`}
			</Button>
		);
	};

	return (
		<AlertDialog open={isOpen} onOpenChange={toggleOpenState}>
			<AlertDialogTrigger asChild>
				<Button variant={'ghost'} className="w-full justify-start gap-2 capitalize focus:!ring-0">
					<FileX2 size={12} />
					{action} Contract
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent asChild>
				<form action={submitForm} className="gap-6">
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription className="text-xs leading-6">
							Continuing with this action will immidiately {action} <strong className="text-muted-foreground">{first_name}&apos;s</strong> contract as a <strong className="text-muted-foreground">{job_title}</strong>, and will be notified immidiately
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel className="text-xs font-light">Cancel</AlertDialogCancel>
						<AlertDialogAction asChild>
							<SubmitButton />
						</AlertDialogAction>
					</AlertDialogFooter>
				</form>
			</AlertDialogContent>
		</AlertDialog>
	);
};
