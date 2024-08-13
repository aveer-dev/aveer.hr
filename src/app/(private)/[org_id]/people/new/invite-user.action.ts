'use server';

import { TablesInsert } from '@/type/database.types';
import { createClient, createClientAdminServer } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export const inviteUser = async (contract: string, profile: string) => {
	const supabase = createClient();
	const supabaseAdmin = createClientAdminServer();

	const parsedContract: TablesInsert<'contracts'> = JSON.parse(contract);
	const parsedProfile: TablesInsert<'profiles'> = JSON.parse(profile);

	const {
		error,
		data: { user }
	} = await supabaseAdmin.auth.admin.inviteUserByEmail(parsedProfile.email, { data: { first_name: parsedProfile.first_name, last_name: parsedProfile.last_name }, redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/set-password` });
	if (error && error.code !== 'email_exists') return error?.message;

	const userId = error && error.code == 'email_exists' ? (await supabase.from('profiles').select('id').eq('email', parsedProfile.email).single()).data?.id : user?.id;

	const [_profileRes, contractRes] = await Promise.all([
		error?.code == 'email_exists'
			? false
			: supabase
					.from('profiles')
					.update({ nationality: parsedProfile.nationality })
					.eq('id', userId as string),
		await supabase
			.from('contracts')
			.insert({ ...parsedContract, profile: userId as string })
			.select('id')
			.single()
	]);

	if (contractRes.error) return contractRes.error.message;
	if (!contractRes.error) return redirect(`/${parsedContract.org}/people/${contractRes.data.id}`);
};

export const updateContract = async (contract: string) => {
	const supabase = createClient();

	const parsedContract: TablesInsert<'contracts'> = JSON.parse(contract);

	const role = await supabase.from('profiles_roles').select().match({ organisation: parsedContract.org, profile: parsedContract.profile });
	if (role.error) return role.error.message;

	const { error } = await supabase
		.from('contracts')
		.update({ ...parsedContract })
		.match({ org: parsedContract.org, profile: parsedContract.profile });

	if (error) return error.message;
	return 'update';
};
