'use server';

import { TablesInsert, TablesUpdate } from '@/type/database.types';
import { createClient } from '@/utils/supabase/server';

export const sendMessage = async ({ payload }: { payload: TablesInsert<'inbox'> }) => {
	const supabase = await createClient();

	const { error } = await supabase.from('inbox').insert(payload);

	if (error) return error.message;

	return true;
};

export const updateMessage = async ({ payload, id }: { payload: TablesUpdate<'inbox'>; id: number }) => {
	const supabase = await createClient();

	const { error, data } = await supabase.from('inbox').update(payload).eq('id', id).select('*, sender_profile:profiles!inbox_sender_profile_fkey(id, first_name, last_name)');

	if (error) return error.message;

	return data[0];
};

export const updateNotification = async ({ payload, id }: { payload: TablesUpdate<'notifications'>; id: number }) => {
	const supabase = await createClient();

	const { error, data } = await supabase.from('notifications').update(payload).eq('id', id).select('*, sender_profile:profiles!notifications_sender_profile_fkey(id, first_name, last_name)');

	if (error) return error.message;

	return data[0];
};

export const deleteMessage = async ({ id }: { id: number }) => {
	const supabase = await createClient();

	const { error } = await supabase.from('inbox').delete().eq('id', id);

	if (error) return error.message;

	return true;
};
