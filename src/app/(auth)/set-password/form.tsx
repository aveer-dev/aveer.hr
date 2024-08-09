'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthError } from '@supabase/supabase-js';
import { useFormStatus } from 'react-dom';
import { toast } from 'sonner';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface props {
	formAction: (payload: FormData) => Promise<AuthError>;
}

export const PasswordForm = ({ formAction }: props) => {
	const [viewPassword, toggleViewPassword] = useState(false);

	const SubmitButton = () => {
		const { pending } = useFormStatus();

		return (
			<Button type="submit" size={'sm'} className="px-6 text-sm font-light">
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
			<div className="grid gap-3">
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

				<SubmitButton />
			</div>
		</form>
	);
};
