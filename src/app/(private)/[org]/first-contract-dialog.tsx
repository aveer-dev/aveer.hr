import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { NavLink } from '@/components/ui/link';
import { Dispatch, SetStateAction } from 'react';

interface props {
	isOpen?: boolean;
	toggle: Dispatch<SetStateAction<boolean>>;
	org: string;
}

export const FirstContractDialog = ({ isOpen, toggle, org }: props) => {
	return (
		<AlertDialog open={isOpen} onOpenChange={toggle}>
			<AlertDialogContent className="gap-8">
				<AlertDialogHeader className="gap-3">
					<AlertDialogTitle>👋🏾 Hi there</AlertDialogTitle>
					<AlertDialogDescription>For the purpose of saving you some time when adding people and creating contracts, we&apos;ve enabled you to setup some organisation wide configurations.</AlertDialogDescription>
					<AlertDialogDescription>All you&apos;ll need to do is set them once, breeze through forms and never worry about them again, unless your company policies change.</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<AlertDialogCancel asChild>
						<NavLink org={org} href={'/people/new'}>
							Add person
						</NavLink>
					</AlertDialogCancel>

					<AlertDialogAction>
						<NavLink org={org} href={'/settings?type=org#employee-policies'}>
							Configure settings
						</NavLink>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
