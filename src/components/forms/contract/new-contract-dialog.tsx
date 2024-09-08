'use client';

import { AlertDialogHeader, AlertDialogFooter, AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription } from '@/components/ui/alert-dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Dispatch, SetStateAction } from 'react';

interface props {
	isAlertOpen: boolean;
	toggleDialog: Dispatch<SetStateAction<boolean>>;
	contractId: number;
	onClose?: (action?: string) => void;
}
export const NewContractDialog = ({ isAlertOpen, toggleDialog, contractId, onClose }: props) => {
	return (
		<AlertDialog open={isAlertOpen} onOpenChange={toggleDialog}>
			<AlertDialogContent className="gap-10">
				<AlertDialogHeader>
					<AlertDialogTitle>🎉 Yey!</AlertDialogTitle>

					<AlertDialogDescription className="grid gap-4 text-xs font-light leading-6 text-foreground">New contract has been created successfully and we&apos;ve set the necessary contract details to your new employee.</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<Button
						onClick={() => {
							toggleDialog(false);
							onClose && onClose();
						}}
						variant={'outline'}>
						Add another person
					</Button>

					<Link href={`./${contractId}`} className={cn(buttonVariants())}>
						View contract
					</Link>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
