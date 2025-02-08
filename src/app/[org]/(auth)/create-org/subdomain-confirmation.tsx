import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dispatch, SetStateAction } from 'react';

interface props {
	isOpen?: boolean;
	toggle: Dispatch<SetStateAction<boolean>>;
	continueAction: () => void;
}

export const SubdomainChangeConfirmation = ({ isOpen, toggle, continueAction }: props) => {
	return (
		<AlertDialog open={isOpen} onOpenChange={toggle}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Just before we update this 😬 </AlertDialogTitle>
					<AlertDialogDescription>Updating your organisation url will result to the previous URL entirely disconnected from your account, everyone under this organisation will have to re-login to continue using their account.</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={continueAction}>Continue</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
