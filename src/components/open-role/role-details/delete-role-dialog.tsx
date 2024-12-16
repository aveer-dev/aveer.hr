'use client';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loader';
import { FileX2 } from 'lucide-react';
import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';

export const TerminateOpening = ({ deleteRole }: { deleteRole: () => Promise<string> }) => {
	const [isOpen, toggleOpenState] = useState(false);
	const [state, formAction, pending] = useActionState(deleteRole, '');

	useEffect(() => {
		if (state) toast.error(state);
	}, [state]);

	return (
		<AlertDialog open={isOpen} onOpenChange={toggleOpenState}>
			<AlertDialogTrigger asChild>
				<Button variant={'ghost'} className="w-full justify-start gap-2 capitalize focus:!ring-0">
					<FileX2 size={12} />
					Delete Role
				</Button>
			</AlertDialogTrigger>

			<AlertDialogContent asChild>
				<form action={formAction} className="gap-6">
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription className="text-xs leading-6">Continuing with this action will immidiately delete this open role. This action can not be reversed</AlertDialogDescription>
					</AlertDialogHeader>

					<AlertDialogFooter>
						<AlertDialogCancel className="text-xs font-light">Cancel</AlertDialogCancel>

						<AlertDialogAction asChild>
							<Button type="submit" disabled={pending} variant={'destructive'} size={'sm'} className="gap-3 px-8 text-xs font-light">
								{pending && <LoadingSpinner />}
								{pending ? 'Deleting' : 'Delete'}
							</Button>
						</AlertDialogAction>
					</AlertDialogFooter>
				</form>
			</AlertDialogContent>
		</AlertDialog>
	);
};
