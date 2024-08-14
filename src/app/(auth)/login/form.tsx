'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormStatus } from 'react-dom';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loader';

interface props {
	formAction: (payload: FormData) => Promise<string>;
}

export const LoginForm = ({ formAction }: props) => {
	const SubmitButton = () => {
		const { pending } = useFormStatus();

		return (
			<Button type="submit" disabled={pending} size={'sm'} className="gap-3 px-8 text-xs font-light">
				{pending && <LoadingSpinner />}
				{pending ? 'Logging in' : 'Login'}
			</Button>
		);
	};

	const submitForm = async (formData: FormData) => {
		const error = await formAction(formData);
		if (error) return toast.error(error);
	};

	return (
		<form className="grid gap-6" action={submitForm}>
			<div className="grid gap-3">
				<Label htmlFor="email">Email</Label>
				<Input id="email" type="email" name="email" placeholder="m@example.com" required />
			</div>

			<div className="grid gap-3">
				<div className="flex items-center">
					<Label htmlFor="password">Password</Label>
					<Link href="/forgot-password" className="ml-auto inline-block text-xs underline">
						Forgot?
					</Link>
				</div>
				<Input id="password" type="password" name="password" required />
			</div>

			<div className="flex w-full items-center justify-end gap-4">
				<Link href="/signup" className="text-xs">
					Sign up
				</Link>

				<SubmitButton />
			</div>
		</form>
	);
};
