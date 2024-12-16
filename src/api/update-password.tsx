'use server';

import { createClient } from '@/utils/supabase/server';

export const updatePassword = async (_prev: any, password: string) => {
	const supabase = await createClient();

	const { error, data } = await supabase.auth.updateUser({ password });

	if (error) return error?.message;
	if (data.user) return 'Password updated successfully';
};
