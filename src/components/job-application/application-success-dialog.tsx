import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Dispatch, SetStateAction } from 'react';

interface props {
	isOpen?: boolean;
	toggle: Dispatch<SetStateAction<boolean>>;
	applicationId?: number;
}

export const ApplicationSuccessDialog = ({ isOpen, toggle, applicationId }: props) => {
	return (
		<AlertDialog open={isOpen} onOpenChange={toggle}>
			<AlertDialogContent className="gap-10">
				<AlertDialogHeader>
					<AlertDialogTitle>🎉 Well done and goodluck</AlertDialogTitle>
					<AlertDialogDescription className="mt-1 text-balance text-xs font-light leading-5">Application has been submitted successfully</AlertDialogDescription>
					<AlertDialogDescription className="mt-1 text-balance text-xs font-light leading-5">
						We&lsquo;ve also forwarded a link to your email for you to follow up and track your application progress. You can use the link to track all your job applications from aveer.hr 😉
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<Link href={`/tracking/${applicationId}`} className={cn(buttonVariants())}>
						Track application
					</Link>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
