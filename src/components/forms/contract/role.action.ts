'use server';

import { Database, TablesInsert, TablesUpdate } from '@/type/database.types';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export const createOpenRole = async (role: TablesInsert<'open_roles'>, orgId: string) => {
	const supabase = createClient();

	const { data, error } = await supabase.from('open_roles').insert(role).select('id').single();

	if (error) return error.message;
	if (!error) return redirect(`/${orgId}/open-roles/${data.id}`);
};

export const updateRole = async (role: TablesUpdate<'open_roles'>, orgId: string, id: number) => {
	const supabase = createClient();

	const { error } = await supabase.from('open_roles').update(role).match({ org: orgId, id });

	if (error) return error.message;
	return 'update';
};

export const toggleRoleStatus = async (status: Database['public']['Enums']['is_open'], role: string, org: string) => {
	const supabase = createClient();

	await supabase.from('open_roles').update({ state: status }).match({ id: role, org: org }).select();
	return;
};
export const submitApplication = async (application: TablesInsert<'job_applications'>) => {
	'use server';

	const supabase = createClient();
	const { error, data } = await supabase.from('job_applications').insert(application).select('id').single();
	if (error) return error.message;
	return data.id;
};
