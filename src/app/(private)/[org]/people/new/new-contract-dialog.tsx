'use client';

import { AlertDialogHeader, AlertDialogFooter, AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription } from '@/components/ui/alert-dialog';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Dispatch, SetStateAction } from 'react';

interface props {
	isAlertOpen: boolean;
	toggleDialog: Dispatch<SetStateAction<boolean>>;
	contractId: number;
	isLevelCreated: boolean;
}
export const NewContractDialog = ({ isAlertOpen, toggleDialog, contractId, isLevelCreated }: props) => {
	return (
		<AlertDialog open={isAlertOpen} onOpenChange={toggleDialog}>
			<AlertDialogContent className="gap-10">
				<AlertDialogHeader>
					<AlertDialogTitle>🎉 Yey!</AlertDialogTitle>

					<AlertDialogDescription className="grid gap-4 text-xs font-light leading-6 text-foreground">New contract has been created successfully and we&apos;ve set the necessary contract details to your new employee.</AlertDialogDescription>
					{isLevelCreated && (
						<AlertDialogDescription className="grid gap-4 text-xs font-light leading-6 text-foreground">
							To help you keep things organised, we created a salary band from the details provided for this contract. You can always reuse it for for subsequent contracts.
						</AlertDialogDescription>
					)}
				</AlertDialogHeader>

				<AlertDialogFooter>
					<Link href={`./${contractId}`} className={cn(buttonVariants({ variant: isLevelCreated ? 'outline' : 'default' }))}>
						View contract
					</Link>

					{isLevelCreated && (
						<Link href={'../settings?type=org'} className={cn(buttonVariants())}>
							Manage salary bands
						</Link>
					)}
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

{
	/* <div className={cn(buttonVariants(), 'p-0')}>
						<DropdownMenu>
							<Button size={'sm'}>Add Person</Button>

							<DropdownMenuTrigger asChild>
								<Button size={'icon'} className="h-full !outline-none !ring-0 !ring-offset-0">
									<ChevronDown size={16} />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuGroup>
									<DropdownMenuItem className="p-0">
										<Button size={'sm'} variant={'ghost'} className="">
											Add person and reset form
										</Button>
									</DropdownMenuItem>
								</DropdownMenuGroup>
							</DropdownMenuContent>
						</DropdownMenu>
					</div> */
}
