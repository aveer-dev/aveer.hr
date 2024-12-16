'use client';

import Link from 'next/link';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loader';
import { useActionState, useEffect } from 'react';

interface PROPS {
	signupAction: (prevState: any, payload: FormData) => Promise<string>;
}

export const SignupForm = ({ signupAction }: PROPS) => {
	const [state, formAction, pending] = useActionState(signupAction, '');

	useEffect(() => {
		if (state) toast.error(state);
	}, [state]);

	return (
		<form className="grid gap-6" action={formAction}>
			<div className="grid grid-cols-2 items-center gap-6">
				<div className="grid gap-3">
					<Label htmlFor="first-name">First name</Label>
					<Input id="first-name" type="text" name="first-name" placeholder="First name here" required />
				</div>

				<div className="grid gap-3">
					<Label htmlFor="last-name">Last name</Label>
					<Input id="last-name" type="text" name="last-name" placeholder="Last name here" required />
				</div>
			</div>

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
				<Input id="password" autoComplete="new-password" type="password" name="password" required />
			</div>

			<div className="flex w-full items-center justify-end gap-4">
				<Link href="/login" className="text-xs">
					Login
				</Link>

				<Button disabled={pending} type="submit" size={'sm'} className="gap-3 px-4 text-sm font-light">
					{pending && <LoadingSpinner />}
					{pending ? 'Signing up...' : 'Sign up'}
				</Button>
			</div>
		</form>
	);
};
