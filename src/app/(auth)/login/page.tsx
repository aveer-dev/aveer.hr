import { AuthError, SignInWithPasswordCredentials } from '@supabase/supabase-js';
import { LoginForm } from './form';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default function SigninPage() {
	const signin = async (payload: FormData): Promise<AuthError> => {
		'use server';
		const supabase = createClient();

		const signinData: SignInWithPasswordCredentials = {
			email: payload.get('email') as string,
			password: payload.get('password') as string
		};
		const { error } = await supabase.auth.signInWithPassword(signinData);

		if (error) return error;
		return redirect('/');
	};

	return (
		<div className="mx-auto grid w-[350px] gap-9">
			<div className="mb-4 grid gap-2">
				<h1 className="text-xl font-bold">Login</h1>
				<p className="text-balance text-xs font-normal text-muted-foreground">Enter your email below to login to your account</p>
			</div>

			<LoginForm formAction={signin} />
		</div>
	);
}
