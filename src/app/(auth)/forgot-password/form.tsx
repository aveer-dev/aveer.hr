'use client';

import Link from 'next/link';

import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loader';
import { useActionState, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import { PageLoader } from '@/components/ui/page-loader';

interface props {
	requestPasswordReset: (prevState: any, email: string) => Promise<string | true>;
	resetPassword: (prevState: any, email: string) => Promise<string>;
}

const supabase = createClient();

export const LoginForm = ({ requestPasswordReset, resetPassword }: props) => {
	const [showNewPasswordForm, setNewPasswordFormState] = useState(false);
	const [showEmailSuccess, setEmailSuccessState] = useState(false);
	const [showEmailForm, setEmailFormState] = useState(true);
	const [viewPassword, toggleViewPassword] = useState(false);
	const [isPageLoading, setPageLoadingState] = useState(false);

	const [requestResetState, requestResetAction, requestResetPending] = useActionState(requestPasswordReset, '');
	const [resetPasswordState, resetPasswordAction, resetPasswordPending] = useActionState(resetPassword, '');

	useEffect(() => {
		if (requestResetState) {
			if (typeof requestResetState == 'string') toast.error(requestResetState);

			setEmailFormState(false);
			setEmailSuccessState(true);

			return;
		}

		if (resetPasswordState) toast.error(resetPasswordState);
	}, [resetPasswordState, requestResetState]);

	useEffect(() => {
		supabase.auth.onAuthStateChange(async (event, session) => {
			if (event == 'PASSWORD_RECOVERY' && session) {
				setPageLoadingState(true);
				setEmailFormState(false);
				setEmailSuccessState(false);
				setNewPasswordFormState(false);
				const { error } = await supabase.auth.setSession(session);
				if (error) toast('🫤 Ooops', { description: error.message });
			}

			if (event == 'SIGNED_IN') {
				setPageLoadingState(false);
				setEmailFormState(false);
				setEmailSuccessState(false);
				setNewPasswordFormState(true);
			}
		});
	}, []);

	return (
		<>
			<div className="mb-4 grid gap-2">
				<h1 className="text-xl font-bold">Reset Password</h1>
				<p className="text-balance text-xs font-normal text-muted-foreground">
					{showEmailForm && 'Enter your email below to request a password reset'}
					{showNewPasswordForm && 'Enter your new password below'}
					{showEmailSuccess && 'Reset password request sent'}
				</p>
			</div>

			{isPageLoading && <PageLoader isLoading />}

			{showEmailForm && (
				<form className="grid gap-6" action={formData => requestResetAction(formData.get('email') as string)}>
					<div className="grid gap-3">
						<Label htmlFor="email">Email</Label>
						<Input id="email" type="email" name="email" placeholder="hello@aveer.hr" required />
					</div>

					<div className="flex w-full items-center justify-end gap-4">
						<Link href="/login" className="text-xs">
							Login
						</Link>

						<Button type="submit" disabled={requestResetPending} size={'sm'} className="gap-3 px-4 text-xs font-light">
							{requestResetPending && <LoadingSpinner />}
							{requestResetPending ? 'Requesting reset' : 'Request reset'}
						</Button>
					</div>
				</form>
			)}

			{showEmailSuccess && (
				<div className="grid gap-5">
					<p className="text-sm leading-5 text-muted-foreground">
						Recovery email with password recovery instructions has been sent to the email address provided <span className="text-xl">🍻</span>
					</p>

					<Link href={'/login'} className={cn(buttonVariants({ variant: 'secondary' }), 'w-fit')}>
						Login
					</Link>
				</div>
			)}

			{showNewPasswordForm && (
				<form className="grid gap-6" action={formData => resetPasswordAction(formData.get('password') as string)}>
					<div className="grid gap-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="password">Password</Label>
							<Button type="button" onClick={() => toggleViewPassword(!viewPassword)} size={'icon'} variant={'secondary'} className="h-8 w-8">
								{viewPassword ? <Eye size={12} /> : <EyeOff size={12} />}
							</Button>
						</div>
						<Input id="password" type={viewPassword ? 'text' : 'password'} name="password" required />
					</div>

					<div className="flex w-full items-center justify-end gap-4">
						<Link href="/login" className="text-xs">
							Login
						</Link>

						<Button type="submit" disabled={resetPasswordPending} size={'sm'} className="gap-3 px-4 text-xs font-light">
							{resetPasswordPending && <LoadingSpinner />}
							{resetPasswordPending ? 'Resetting password' : 'Reset password'}
						</Button>
					</div>
				</form>
			)}
		</>
	);
};
