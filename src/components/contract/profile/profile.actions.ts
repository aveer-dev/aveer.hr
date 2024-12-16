'use server';

import { TablesUpdate } from '@/type/database.types';
import { createClient } from '@/utils/supabase/server';

export const updateProfile = async ({ payload, id }: { payload: TablesUpdate<'profiles'>; id: string }) => {
	const supabase = await createClient();

	const { error } = await supabase.from('profiles').update(payload).eq('id', id);

	if (error) return error.message;

	return true;
};
