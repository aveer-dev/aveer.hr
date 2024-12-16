'use client';

import { FormSection, FormSectionDescription, InputsContainer } from '@/components/forms/form-section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loader';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { updatePassword } from '@/api/update-password';

export const SecurityForm = () => {
	return (
		<FormSection>
			<FormSectionDescription>
				<h2 className="font-semibold">Security Settings</h2>
				<p className="mt-3 text-xs font-thin text-muted-foreground sm:max-w-72">Update your personal account password</p>
			</FormSectionDescription>

			<InputsContainer>
				<ChangePasswordForm />
			</InputsContainer>
		</FormSection>
	);
};

export const ChangePasswordForm = ({ className }: { className?: string }) => {
	const [state, formAction, pending] = useActionState(updatePassword, '');
	const [viewPassword, toggleViewPasswordState] = useState(false);

	useEffect(() => {
		if (state) toast.error(state);
	}, [state]);

	return (
		<form className={cn('space-y-6', className)} action={formData => formAction(formData.get('name') as string)}>
			<div className="w-full space-y-3">
				<Label htmlFor="password">New password</Label>
				<div className="relative flex items-center gap-2">
					<Input id="password" type={viewPassword ? 'text' : 'password'} className="w-full" placeholder="Enter new password" name="password" required />
					<Button className="absolute right-3 top-1/2 h-6 w-6 -translate-y-1/2" variant={'ghost'} size={'icon'} type="button" onClick={() => toggleViewPasswordState(!viewPassword)}>
						{viewPassword && <Eye size={12} />}
						{!viewPassword && <EyeOff size={12} />}
					</Button>
				</div>
			</div>

			<div className="flex w-full items-center justify-end gap-4">
				<Button type="submit" disabled={pending} size={'sm'} className="gap-3 px-5 text-xs font-light">
					{pending && <LoadingSpinner />}
					{pending ? 'Updating password' : 'Update password'}
				</Button>
			</div>
		</form>
	);
};
