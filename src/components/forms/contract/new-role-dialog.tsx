import { AlertDialogHeader, AlertDialogFooter, AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription } from '@/components/ui/alert-dialog';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Dispatch, SetStateAction } from 'react';

interface props {
	isAlertOpen: boolean;
	toggleDialog: Dispatch<SetStateAction<boolean>>;
	roleId: number;
}
export const NewRoleDialog = ({ isAlertOpen, toggleDialog, roleId }: props) => {
	return (
		<AlertDialog open={isAlertOpen} onOpenChange={toggleDialog}>
			<AlertDialogContent className="gap-10">
				<AlertDialogHeader>
					<AlertDialogTitle>🎉 Yey!</AlertDialogTitle>

					<AlertDialogDescription className="grid gap-4 text-xs font-light leading-6 text-foreground">New role has been created successfully, you&apos;re set to start receiving applications to your new role.</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<Link href={`./new`} onClick={() => toggleDialog(false)} className={cn(buttonVariants({ variant: 'outline' }))}>
						Create another role
					</Link>

					<Link href={`./${roleId}`} onClick={() => toggleDialog(false)} className={cn(buttonVariants())}>
						View role
					</Link>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
