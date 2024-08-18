'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormStatus } from 'react-dom';
import { toast } from 'sonner';

export const SecurityForm = ({ updatePassword }: { updatePassword: (password: string) => Promise<string | undefined> }) => {
	const SubmitButton = () => {
		const { pending } = useFormStatus();

		return (
			<Button type="submit" disabled={pending} size={'sm'} className="px-8 text-xs font-light">
				{pending ? 'Updating password...' : 'Update password'}
			</Button>
		);
	};

	const onSubmit = async (formData: FormData) => {
		const error = await updatePassword(formData.get('name') as string);
		if (error) return toast(error);
	};

	return (
		<div className="grid w-full gap-6">
			{/* Security Settings */}
			<div className="grid grid-cols-2 border-t border-t-border py-10">
				<div>
					<h2 className="font-semibold">Security Settings</h2>
					<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">Update your personal account password</p>
				</div>

				<form className="grid gap-6" action={onSubmit}>
					<div className="grid gap-3">
						<Label htmlFor="password">New password</Label>
						<div className="flex items-center gap-2">
							<Input id="password" type="password" name="password" required />
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
			</div>
		</div>
	);
};