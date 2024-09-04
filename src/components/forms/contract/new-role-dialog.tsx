import { AlertDialogHeader, AlertDialogFooter, AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription } from '@/components/ui/alert-dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction } from 'react';

interface props {
	isAlertOpen: boolean;
	toggleDialog: Dispatch<SetStateAction<boolean>>;
	roleId: number;
	onClose?: (action?: string) => void;
}
export const NewRoleDialog = ({ isAlertOpen, toggleDialog, roleId, onClose }: props) => {
	const router = useRouter();

	return (
		<AlertDialog open={isAlertOpen} onOpenChange={toggleDialog}>
			<AlertDialogContent className="gap-10">
				<AlertDialogHeader>
					<AlertDialogTitle>🎉 Yey!</AlertDialogTitle>

					<AlertDialogDescription className="grid gap-4 text-xs font-light leading-6 text-foreground">New role has been created successfully, you&apos;re set to start receiving applications to your new role.</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<Button
						onClick={() => {
							toggleDialog(false);
							onClose && onClose();
						}}
						variant={'outline'}>
						Create another role
					</Button>

					<Link
						href={`./${roleId}`}
						onClick={() => {
							toggleDialog(false);
							router.refresh();
						}}
						className={cn(buttonVariants())}>
						View role
					</Link>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
