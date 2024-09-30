'use server';

import { TablesInsert } from '@/type/database.types';
import { doesUserHaveAdequatePermissions } from '@/utils/api';
import { createClient } from '@/utils/supabase/server';

export const deleteOKR = async (query: { id: number; org: string }) => {
	const canUser = await doesUserHaveAdequatePermissions({ orgId: query.org });
	if (canUser !== true) return canUser;

	const supabase = createClient();
	const { error } = await supabase.from('okrs').delete().match(query);

	if (error) return error.message;
	return true;
};

export const deleteResult = async (query: { id: number; okr: number; org: string }) => {
	const canUser = await doesUserHaveAdequatePermissions({ orgId: query.org });
	if (canUser !== true) return canUser;

	const supabase = createClient();
	const { error } = await supabase.from('okr_results').delete().match(query);

	if (error) return error.message;
	return true;
};

export const deleteObjective = async (query: { id: number; okr: number; org: string }) => {
	const canUser = await doesUserHaveAdequatePermissions({ orgId: query.org });
	if (canUser !== true) return canUser;

	const supabase = createClient();
	const { error } = await supabase.from('okr_objectives').delete().match(query);

	if (error) return error.message;
	return true;
};

export const createOKR = async (payload: TablesInsert<'okrs'>) => {
	const canUser = await doesUserHaveAdequatePermissions({ orgId: payload.org });
	if (canUser !== true) return canUser;

	const supabase = createClient();
	const { data, error } = await supabase.from('okrs').upsert(payload).select();
	if (error) return error.message;
	return data;
};

export const createObjective = async (payload: TablesInsert<'okr_objectives'>[]) => {
	const canUser = await doesUserHaveAdequatePermissions({ orgId: payload[0].org });
	if (canUser !== true) return canUser;

	const payloadWithId = payload.filter(item => !!item.id);
	const payloadWithoutId = payload.filter(item => !item.id);

	const supabase = createClient();
	const [updateRes, inserRes] = await Promise.all([await supabase.from('okr_objectives').upsert(payloadWithId).select(), await supabase.from('okr_objectives').insert(payloadWithoutId).select()]);

	if (updateRes.error || inserRes.error) {
		if (inserRes.error) return inserRes.error.message;
		if (updateRes.error) return updateRes.error.message;
	}

	return [...updateRes.data, ...inserRes.data];
};

export const createResults = async (payload: TablesInsert<'okr_results'>[]) => {
	const canUser = await doesUserHaveAdequatePermissions({ orgId: payload[0].org });
	if (canUser !== true) return canUser;

	const payloadWithId = payload.filter(item => !!item.id);
	const payloadWithoutId = payload.filter(item => !item.id);

	const supabase = createClient();
	const [updateRes, inserRes] = await Promise.all([await supabase.from('okr_results').upsert(payloadWithId).select(), await supabase.from('okr_results').insert(payloadWithoutId).select()]);

	if (updateRes.error || inserRes.error) {
		if (inserRes.error) return inserRes.error.message;
		if (updateRes.error) return updateRes.error.message;
	}

	return [...updateRes.data, ...inserRes.data];
};
