'use server';

import { sendEmail } from '@/api/email';
import { TablesInsert } from '@/type/database.types';
import { doesUserHaveAdequatePermissions } from '@/utils/api';
import { createClient, createClientAdminServer } from '@/utils/supabase/server';
import { NewContractEmail } from '@/components/emails/new-contract-email';

const sendContractEmail = async (email: string) => {
	await sendEmail({
		from: 'Aveer.hr <contract@notification.aveer.hr>',
		to: [email],
		subject: `New contract on aveer`,
		react: NewContractEmail()
	});

	return;
};

const getExistingUserAccount = async (email: string) => {
	const supabase = createClient();

	const { data, error } = await supabase.from('profiles').select('id').eq('email', email).single();
	if (error) return;

	sendContractEmail(email);
	return data.id;
};

export const inviteUser = async (contract: string, profile: string, isManager: boolean) => {
	const supabase = createClient();
	const supabaseAdmin = createClientAdminServer();

	const parsedContract: TablesInsert<'contracts'> = JSON.parse(contract);
	const parsedProfile: TablesInsert<'profiles'> = JSON.parse(profile);

	const userHasPermission = await doesUserHaveAdequatePermissions({ orgId: parsedContract.org });
	if (userHasPermission !== true) return userHasPermission;

	const {
		error,
		data: { user }
	} = await supabaseAdmin.auth.admin.inviteUserByEmail(parsedProfile.email, { data: { first_name: parsedProfile.first_name, last_name: parsedProfile.last_name }, redirectTo: `${process.env.NEXT_PUBLIC_URL}/set-password?type=employee` });
	if (error && error.code !== 'email_exists') return error?.message;

	const userId = error && error.code == 'email_exists' ? await getExistingUserAccount(parsedProfile.email) : user?.id;

	const contractRes = await supabase
		.from('contracts')
		.insert({ ...parsedContract, profile: userId as string })
		.select('id')
		.single();

	if (contractRes.error) return contractRes.error.message;

	if (isManager) {
		const managerRes = await supabase.from('managers').insert({ profile: userId, person: contractRes.data?.id, role: 1, team: parsedContract.team as number, org: parsedContract.org });
		if (managerRes.error) return managerRes.error.message;
	}

	if (!contractRes.error) return contractRes.data.id;
};

export const updateContract = async (contract: string) => {
	const supabase = createClient();

	const parsedContract: TablesInsert<'contracts'> = JSON.parse(contract);

	const {
		data: { user }
	} = await supabase.auth.getUser();
	const role = await supabase.from('profiles_roles').select().match({ organisation: parsedContract.org, profile: user?.id });
	if (role.error) return role.error.message;
	if (role.data && !role.data.length) return `You do not have adequate org permission to sign contracts`;

	const { error } = await supabase
		.from('contracts')
		.update({ ...parsedContract })
		.match({ org: parsedContract.org, profile: parsedContract.profile });

	if (error) return error.message;
	return 'update';
};

export const createLevel = async (level: TablesInsert<'employee_levels'>) => {
	const supabase = createClient();

	const role = await doesUserHaveAdequatePermissions({ orgId: level.org });
	if (role !== true) return role;

	const { data, error } = await supabase.from('employee_levels').insert(level).select('id').single();

	if (error) return error.message;
	return data.id;
};

export const generateInvite = async ({ email, first_name, last_name, org }: { email: string; first_name: string; last_name: string; org: string }) => {
	const role = await doesUserHaveAdequatePermissions({ orgId: org });
	if (role !== true) return role;

	const supabaseAdmin = createClientAdminServer();

	const { error, data } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, { data: { first_name, last_name }, redirectTo: `${process.env.NEXT_PUBLIC_URL}/set-password?type=employee` });

	if (error) return error.message;

	return data;
};
