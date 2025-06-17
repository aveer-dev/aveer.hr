'use client';

import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProfileFormComponent } from '@/components/forms/profile-form';
import { Info, X } from 'lucide-react';
import { Tables } from '@/type/database.types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CommandShortcut } from '@/components/ui/command';
import { ChangePasswordForm } from '@/app/[org]/(org)/settings/profile-security-form';

export const EmployeeProfileSettings = ({ profile, open, setOpen }: { profile: Tables<'profiles'>; open: boolean; setOpen: (open: boolean) => void }) => {
	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogContent onCloseAutoFocus={event => event.preventDefault()} onOpenAutoFocus={event => event.preventDefault()} className="block max-h-screen overflow-y-auto">
				<AlertDialogHeader className="flex-row justify-between text-left">
					<div>
						<AlertDialogTitle>Auth settings</AlertDialogTitle>
						<AlertDialogDescription>Change account authentication details here.</AlertDialogDescription>
					</div>

					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<AlertDialogCancel className="rounded-full">
									<X size={12} />
								</AlertDialogCancel>
							</TooltipTrigger>
							<TooltipContent align="start" side="left">
								<p>
									<CommandShortcut>esc</CommandShortcut>
								</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</AlertDialogHeader>

				<section className="mt-8 space-y-8">
					<Alert className="bg-muted/50 px-2 py-3">
						<Info size={12} />
						<AlertDescription className="text-xs text-support">We recommend using a personal email for your account. This will give you total control over your account and personal data.</AlertDescription>
					</Alert>

					<div className="space-y-4">
						<h3 className="text-sm font-semibold text-support">Change password</h3>
						<ChangePasswordForm />
					</div>

					<div className="space-y-4">
						<h3 className="text-sm font-semibold text-support">Personal details</h3>

						{profile && <ProfileFormComponent data={profile as any} />}
					</div>
				</section>
			</AlertDialogContent>
		</AlertDialog>
	);
};
