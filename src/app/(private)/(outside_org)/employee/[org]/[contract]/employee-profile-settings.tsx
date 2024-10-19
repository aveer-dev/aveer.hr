'use client';

import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { updatePassword } from '@/api/update-password';
import { ChangePasswordForm } from '@/app/(private)/[org]/settings/profile-security-form';
import { ProfileFormComponent } from '@/components/forms/profile-form';
import { Button } from '@/components/ui/button';
import { Cog, Command, Info, X } from 'lucide-react';
import { Tables } from '@/type/database.types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CommandShortcut } from '@/components/ui/command';
import { useState, useEffect } from 'react';

export const EmployeeProfileSettings = ({ profile }: { profile: Tables<'profiles'> }) => {
	const [open, setOpen] = useState(false);

	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen(open => !open);
			}
		};
		document.addEventListener('keydown', down);
		return () => document.removeEventListener('keydown', down);
	}, []);

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<AlertDialogTrigger asChild>
							<Button onClick={() => setOpen(open => !open)} className="h-8 w-8 rounded-2xl border p-0" variant={'secondary'}>
								<Cog size={12} />
							</Button>
						</AlertDialogTrigger>
					</TooltipTrigger>

					<TooltipContent align="center">
						<p>
							<CommandShortcut className="flex items-center gap-1">
								<Command size={12} /> S
							</CommandShortcut>
						</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>

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
						<ChangePasswordForm updatePassword={updatePassword} />
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
