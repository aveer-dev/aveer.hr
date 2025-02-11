import { SignInWithPasswordCredentials } from '@supabase/supabase-js';
import { LoginForm } from './form';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default function SigninPage() {
	const signin = async (_prevState: any, payload: FormData) => {
		'use server';
		const supabase = await createClient();

		const signinData: SignInWithPasswordCredentials = {
			email: payload.get('email') as string,
			password: payload.get('password') as string
		};
		const { error } = await supabase.auth.signInWithPassword(signinData);

		if (error) return error.message;
		return redirect('/app');
	};

	return (
		<div className="mx-auto grid w-[350px] gap-9">
			<div className="mb-2 grid gap-2">
				<h1 className="text-xl font-bold">Login</h1>
				<p className="text-balance text-xs font-normal text-muted-foreground">Enter your email below to login to your account</p>
			</div>

			<LoginForm loginAction={signin} />

			<div className="space-y-3">
				<Link href="./signup" className="mx-auto block w-fit text-sm underline">
					Don&apos;t have an account? Sign up
				</Link>

				<Link href="https://aveer.hr/privacy-policy" className="mx-auto block w-fit text-sm underline">
					Privacy Policy
				</Link>
			</div>
		</div>
	);
}
