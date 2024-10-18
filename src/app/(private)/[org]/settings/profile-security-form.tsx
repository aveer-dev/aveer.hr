'use client';

import { FormSection, FormSectionDescription, InputsContainer } from '@/components/forms/form-section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loader';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from 'sonner';

export const SecurityForm = ({ updatePassword }: { updatePassword: (password: string) => Promise<string | undefined> }) => {
	return (
		<FormSection>
			<FormSectionDescription>
				<h2 className="font-semibold">Security Settings</h2>
				<p className="mt-3 text-xs font-thin text-muted-foreground sm:max-w-72">Update your personal account password</p>
			</FormSectionDescription>

			<InputsContainer>
				<ChangePasswordForm updatePassword={updatePassword} />
			</InputsContainer>
		</FormSection>
	);
};

export const ChangePasswordForm = ({ updatePassword, className }: { className?: string; updatePassword: (password: string) => Promise<string | undefined> }) => {
	const [viewPassword, toggleViewPasswordState] = useState(false);

	const SubmitButton = () => {
		const { pending } = useFormStatus();

		return (
			<Button type="submit" disabled={pending} size={'sm'} className="gap-3 px-5 text-xs font-light">
				{pending && <LoadingSpinner />}
				{pending ? 'Updating password' : 'Update password'}
			</Button>
		);
	};

	const onSubmit = async (formData: FormData) => {
		const error = await updatePassword(formData.get('name') as string);
		if (error) return toast(error);
	};

	return (
		<form className={cn('space-y-6', className)} action={onSubmit}>
			<div className="w-full space-y-3">
				<Label htmlFor="password">New password</Label>
				<div className="relative flex items-center gap-2">
					<Input id="password" type={viewPassword ? 'text' : 'password'} className="w-full" placeholder="Enter new password" name="password" required />
					<Button className="absolute right-3 top-1/2 h-6 w-6 -translate-y-1/2" variant={'ghost'} size={'icon'} type="button" onClick={() => toggleViewPasswordState(!viewPassword)}>
						{viewPassword && <Eye size={12} />}
						{!viewPassword && <EyeOff size={12} />}
					</Button>
					{/* <Button variant={'secondary'} size={'sm'}>
								Get OTP
							</Button> */}
				</div>
			</div>

			{/* <div className="grid gap-3">
						<div className="flex items-center">
							<Label htmlFor="password">OTP</Label>
						</div>
						<Input id="password" type="password" name="password" required />
					</div> */}

			<div className="flex w-full items-center justify-end gap-4">
				<SubmitButton />
			</div>
		</form>
	);
};
