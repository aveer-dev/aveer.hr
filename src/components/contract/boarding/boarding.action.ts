'use server';

import { TablesInsert } from '@/type/database.types';
import { LEVEL } from '@/type/roles.types';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export const updateEmployeeBoarding = async (items: TablesInsert<'contract_check_list'>, org: string) => {
	const supabase = await createClient();

	const {
		data: { user },
		error: authError
	} = await supabase.auth.getUser();
	if (!user || authError) return redirect('/login');

	const isAuthContract = await supabase.from('contracts').select('id').match({ profile: user?.id, org });
	if (!isAuthContract.data || !isAuthContract.data.length) return `You don't have the necessary permission to update checklist`;

	const { error, data } = await supabase
		.from('contract_check_list')
		.upsert({ ...items })
		.select();
	if (error) return error.message;

	return data[0];
};

export const approveBoarding = async ({ isAllApproved, levels, id }: { isAllApproved: boolean; levels: LEVEL[]; id: number }) => {
	const supabase = await createClient();

	const {
		data: { user },
		error: authError
	} = await supabase.auth.getUser();
	if (!user || authError) return redirect('/login');

	const { error, data } = await supabase
		.from('contract_check_list')
		.update({ levels: levels as any, state: isAllApproved ? 'approved' : 'pending' })
		.eq('id', id)
		.select()
		.single();

	if (error) return error.message;
	return data;
};
