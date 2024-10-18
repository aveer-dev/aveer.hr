import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { updatePassword } from '@/api/update-password';
import { ChangePasswordForm } from '@/app/(private)/[org]/settings/profile-security-form';
import { ProfileFormComponent } from '@/components/forms/profile-form';
import { Button } from '@/components/ui/button';
import { Cog, Info, X } from 'lucide-react';
import { Tables } from '@/type/database.types';

export const EmployeeProfileSettings = ({ profile }: { profile: Tables<'profiles'> }) => {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button className="h-8 w-8 rounded-2xl border p-0" variant={'secondary'}>
					<Cog size={12} />
				</Button>
			</AlertDialogTrigger>

			<AlertDialogContent className="block max-h-screen overflow-y-auto">
				<AlertDialogHeader className="text-left">
					<AlertDialogTitle>Auth settings</AlertDialogTitle>
					<AlertDialogDescription>Change account authentication details here.</AlertDialogDescription>
					<AlertDialogCancel className="absolute right-6 top-0 rounded-full">
						<X size={12} />
					</AlertDialogCancel>
				</AlertDialogHeader>

				<section className="mt-8 space-y-8">
					<Alert className="bg-muted/50 px-2 py-3">
						<Info size={12} />
						<AlertDescription className="text-xs text-support">We recommend using a personal email for your account, enabling you with total control over your account and personal data.</AlertDescription>
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
