'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthError } from '@supabase/supabase-js';
import { useFormStatus } from 'react-dom';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { PageLoader } from '@/components/ui/page-loader';

interface props {
	formAction: (payload: FormData) => Promise<AuthError>;
}

const supabase = createClient();

export const PasswordForm = ({ formAction }: props) => {
	const [viewPassword, toggleViewPassword] = useState(false);
	const [userId, setUserId] = useState('');
	const [isLoading, toggleLoadingState] = useState(false);
	const [isFormEnabled, enableForm] = useState(false);

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

	const SubmitButton = () => {
		const { pending } = useFormStatus();

		return (
			<Button type="submit" size={'sm'} className="px-6 text-xs font-light" disabled={pending || isLoading || !isFormEnabled}>
				{pending ? 'Setting password...' : 'Set password'}
			</Button>
		);
	};

	const submitForm = async (formData: FormData) => {
		const error = await formAction(formData);
		if (error) return toast.error(error.message);
	};

	return (
		<form className="grid gap-6" action={submitForm}>
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
				<Link href="/login" className="text-xs">
					Login
				</Link>

				<SubmitButton />
			</div>

			<PageLoader isLoading={isLoading} />
		</form>
	);
};
