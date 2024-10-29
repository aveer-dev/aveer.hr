'use server';

import { TablesInsert, TablesUpdate } from '@/type/database.types';
import { createClient } from '@/utils/supabase/server';

export const sendMessage = async ({ payload }: { payload: TablesInsert<'inbox'> }) => {
	const supabase = createClient();

	const { error } = await supabase.from('inbox').insert(payload);

	if (error) return error.message;

	return true;
};

export const updateMessage = async ({ payload, id }: { payload: TablesUpdate<'inbox'>; id: number }) => {
	const supabase = createClient();

	const { error } = await supabase.from('inbox').update(payload).eq('id', id);

	if (error) return error.message;

	return true;
};

export const deleteMessage = async ({ id }: { id: number }) => {
	const supabase = createClient();

	const { error } = await supabase.from('inbox').delete().eq('id', id);

	if (error) return error.message;

	return true;
};
