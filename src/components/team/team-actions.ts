'use server';

import { TablesInsert } from '@/type/database.types';
import { doesUserHaveAdequatePermissions } from '@/utils/api';
import { createClient } from '@/utils/supabase/server';

export const createTeam = async (org: string, team: TablesInsert<'teams'>, managers: TablesInsert<'managers'>[]) => {
	const supabase = await createClient();

	const canUpdate = await doesUserHaveAdequatePermissions({ orgId: org });
	if (canUpdate !== true) return canUpdate;

	const { error, data } = await supabase.from('teams').insert(team).select().single();
	if (error) return error.message;

	managers = managers.map(manager => ({ ...manager, team: data.id }));
	const { error: managerError } = await supabase.from('managers').insert(managers);
	if (managerError) return managerError.message;

	return data;
};

export const updateTeam = async (org: string, teamId: number, team: TablesInsert<'teams'>, managers: TablesInsert<'managers'>[]) => {
	const supabase = await createClient();

	const canUpdate = await doesUserHaveAdequatePermissions({ orgId: org });
	if (canUpdate !== true) return canUpdate;

	const { error, data } = await supabase.from('teams').update(team).eq('id', teamId).select('id').single();
	if (error) return error.message;

	managers = managers.map(manager => ({ ...manager, team: data.id }));
	const newManagers = managers.filter(manager => !manager.id);
	const oldManagers = managers.filter(manager => manager.id);

	const [oldManagersResult, newManagersResult] = await Promise.all([supabase.from('managers').upsert(oldManagers), supabase.from('managers').insert(newManagers)]);

	if (oldManagersResult.error) {
		return oldManagersResult.error.message;
	}

	if (newManagersResult.error) {
		return newManagersResult.error.message;
	}

	return true;
};

export const deleteManager = async (org: string, managers: number[]) => {
	const supabase = await createClient();

	const canUpdate = await doesUserHaveAdequatePermissions({ orgId: org });
	if (canUpdate !== true) return canUpdate;

	const { error } = await supabase.from('managers').delete().in('id', managers);
	if (error) return error.message;

	return true;
};

export const deleteTeam = async (org: string, id: number) => {
	const supabase = await createClient();

	const canUpdate = await doesUserHaveAdequatePermissions({ orgId: org });
	if (canUpdate !== true) return canUpdate;

	const { error } = await supabase.from('teams').delete().eq('id', id);
	if (error) return error.message;

	return true;
};
