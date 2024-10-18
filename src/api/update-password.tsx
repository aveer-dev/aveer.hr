import { createClient } from '@/utils/supabase/server';

export const updatePassword = async (password: string) => {
	'use server';
	const supabase = createClient();

	const { error, data } = await supabase.auth.updateUser({ password });

	if (error) return error?.message;
	if (data.user) return 'Password updated successfully';
};
