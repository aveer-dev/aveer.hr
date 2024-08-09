import { AuthError } from '@supabase/supabase-js';
import { PasswordForm } from './form';
import { createClientAdminServer } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default function SigninPage() {
	const setPassword = async (payload: FormData): Promise<AuthError> => {
		'use server';
		const supabase = createClientAdminServer();

		const userId = payload.get('id') as string;
		const password = payload.get('password') as string;

		const { error } = await supabase.auth.admin.updateUserById(userId, { password });
		if (error) return error;

		return redirect('/');
	};

	return (
		<div className="mx-auto grid w-[350px] gap-9">
			<div className="mb-4 grid gap-2">
				<h1 className="text-xl font-bold">Welcome</h1>
				<p className="text-balance text-xs font-normal text-muted-foreground">Set your preferred password to get started.</p>
			</div>

			<PasswordForm formAction={setPassword} />
		</div>
	);
}
