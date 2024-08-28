import { LoginForm } from './form';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default function ResetPasswordPage() {
	const requestPasswordReset = async (email: string) => {
		'use server';
		const supabase = createClient();

		const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${process.env.NEXT_PUBLIC_URL}/forgot-password` });

		if (error) return error.message;
		return true;
	};

	const resetPassword = async (password: string) => {
		'use server';
		const supabase = createClient();

		const { error } = await supabase.auth.updateUser({ password });

		if (error) return error.message;
		return redirect(`/`);
	};

	return (
		<div className="mx-auto grid w-[350px] gap-9">
			<LoginForm resetPassword={resetPassword} requestPasswordReset={requestPasswordReset} />
		</div>
	);
}