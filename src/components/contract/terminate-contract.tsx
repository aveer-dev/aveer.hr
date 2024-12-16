'use client';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { FileX2 } from 'lucide-react';
import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';

export const TerminateContract = ({ job_title, first_name, deleteContract, terminateContract, action }: { action: 'delete' | 'terminate'; job_title: string; first_name: string; deleteContract: () => Promise<string>; terminateContract: () => Promise<string> }) => {
	const [isOpen, toggleOpenState] = useState(false);
	const [state, formAction, pending] = useActionState(action == 'delete' ? deleteContract : terminateContract, '');

	useEffect(() => {
		if (state) {
			toast.error(state);
		}
	}, [state]);

	return (
		<AlertDialog open={isOpen} onOpenChange={toggleOpenState}>
			<AlertDialogTrigger asChild>
				<Button variant={'ghost'} className="w-full justify-start gap-2 capitalize focus:!ring-0">
					<FileX2 size={12} />
					{action} Contract
				</Button>
			</AlertDialogTrigger>

			<AlertDialogContent asChild>
				<form action={formAction} className="gap-6">
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription className="text-xs leading-6">
							Continuing with this action will immidiately {action} <strong className="text-muted-foreground">{first_name}&apos;s</strong> contract as a <strong className="text-muted-foreground">{job_title}</strong>, and will be notified immidiately
						</AlertDialogDescription>
					</AlertDialogHeader>

					<AlertDialogFooter>
						<AlertDialogCancel className="text-xs font-light">Cancel</AlertDialogCancel>

						<AlertDialogAction asChild>
							<Button type="submit" disabled={pending} variant={'destructive'} size={'sm'} className="px-8 text-xs font-light">
								{pending ? `${action == 'delete' ? 'Deleting' : 'Terminating'}...` : `${action == 'delete' ? 'Delete' : 'Terminate'}`}
							</Button>
						</AlertDialogAction>
					</AlertDialogFooter>
				</form>
			</AlertDialogContent>
		</AlertDialog>
	);
};
