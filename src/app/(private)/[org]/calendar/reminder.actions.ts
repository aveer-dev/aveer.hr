'use server';

import { TablesInsert, TablesUpdate } from '@/type/database.types';
import { createClient } from '@/utils/supabase/server';

export const createReminder = async ({ payload }: { payload: TablesInsert<'reminders'> }) => {
	const supabase = await createClient();

	const { data, error } = await supabase.from('reminders').insert(payload).select().single();
	if (error) return error.message;

	return data;
};

export const updateReminder = async ({ payload, id }: { payload: TablesUpdate<'reminders'>; id: number }) => {
	const supabase = await createClient();

	const { data, error } = await supabase.from('reminders').update(payload).match({ id, org: payload.org }).select().single();
	if (error) return error.message;

	return data;
};

export const deleteReminder = async ({ id, org }: { id: number; org: string }) => {
	const supabase = await createClient();

	const { data, error } = await supabase.from('reminders').delete().match({ id, org });
	if (error) return error.message;

	return data;
};
