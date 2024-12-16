'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loader';
import { useActionState, useEffect } from 'react';

interface props {
	loginAction: (prevState: any, payload: FormData) => Promise<string>;
}

export const LoginForm = ({ loginAction }: props) => {
	const [state, formAction, pending] = useActionState(loginAction, '');

	useEffect(() => {
		if (state) toast.error(state);
	}, [state]);

	return (
		<form className="grid gap-6" action={formAction}>
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

				<Button type="submit" disabled={pending} size={'sm'} className="gap-3 px-4 text-xs font-light">
					{pending && <LoadingSpinner />}
					{pending ? 'Logging in' : 'Login'}
				</Button>
			</div>
		</form>
	);
};
