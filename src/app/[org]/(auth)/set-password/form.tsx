'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useActionState, useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { PageLoader } from '@/components/ui/page-loader';
import { LoadingSpinner } from '@/components/ui/loader';

interface props {
	passwordAction: (prev: any, payload: FormData) => Promise<String>;
}

const supabase = createClient();

export const PasswordForm = ({ passwordAction }: props) => {
	const [viewPassword, toggleViewPassword] = useState(false);
	const [userId, setUserId] = useState('');
	const [isLoading, toggleLoadingState] = useState(false);
	const [isFormEnabled, enableForm] = useState(false);
	const [state, formAction, pending] = useActionState(passwordAction, '');

	useEffect(() => {
		const queryString = location.hash.split('#')[1];
		const queryURL = new URLSearchParams(queryString);
		const token = {
			access_token: queryURL.get('access_token') as string,
			refresh_token: queryURL.get('refresh_token') as string
		};

		if (!token.access_token || !token.refresh_token) return;
		const verifyToken = async () => {
			toggleLoadingState(true);
			const { data, error } = await supabase.auth.setSession(token);
			toggleLoadingState(false);
			if (error) return toast.error(error.message);
			if (data.user) {
				enableForm(true);
				setUserId(data.user?.id);
			}
		};
		verifyToken();
	}, []);

	useEffect(() => {
		if (state) toast.error(state);
	}, [state]);

	return (
		<form className="grid gap-6" action={formAction}>
			<input type="text" name="id" id="id" hidden defaultValue={userId} />

			<div className="grid gap-3">
				<div className="flex items-center justify-between">
					<Label htmlFor="password">Password</Label>
					<Button type="button" onClick={() => toggleViewPassword(!viewPassword)} size={'icon'} variant={'secondary'} className="h-8 w-8">
						{viewPassword ? <Eye size={12} /> : <EyeOff size={12} />}
					</Button>
				</div>
				<Input disabled={!isFormEnabled || isLoading} id="password" type={viewPassword ? 'text' : 'password'} name="password" required />
			</div>

			<div className="flex w-full items-center justify-end gap-4">
				<Link href="/app/login" className="text-xs">
					Login
				</Link>

				<Button type="submit" size={'sm'} className="gap-3 px-4 text-xs font-light" disabled={pending || isLoading || !isFormEnabled}>
					{pending && <LoadingSpinner />}
					{pending ? 'Setting password' : 'Set password'}
				</Button>
			</div>

			<PageLoader isLoading={isLoading} />
		</form>
	);
};
