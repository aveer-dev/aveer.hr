'use server';

import { TablesUpdate } from '@/type/database.types';
import { doesUserHaveAdequatePermissions } from '@/utils/api';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export const employeeSignContract = async (_prev: any, payload: FormData): Promise<string> => {
	const supabase = await createClient();

	const signatureString = payload.get('signature-string') as string;
	const org = payload.get('org') as string;
	const id = payload.get('id') as string;

	const { error: contractError } = await supabase
		.from('contracts')
		.update({ profile_signed: new Date() as any, profile_signature_string: signatureString })
		.match({ org, id });

	if (contractError) return contractError.message;
	return redirect(`./contract`);
};

export const signContractAction = async (_prev: any, payload: FormData): Promise<string> => {
	'use server';

	const supabase = await createClient();

	const {
		data: { user },
		error: authError
	} = await supabase.auth.getUser();
	if (authError) return authError.message;
	if (!user) return 'User auth not found';

	const signatureString = payload.get('signature-string') as string;
	const org = payload.get('org') as string;
	const id = payload.get('id') as string;
	const signatureType = payload.get('signature-type') as string;

	let signatureDetails: TablesUpdate<'contracts'>;
	if (signatureType === 'org') {
		const hasPermission = await doesUserHaveAdequatePermissions({ orgId: org });
		if (hasPermission !== true) return hasPermission;

		signatureDetails = { org_signed: new Date() as any, signed_by: user.id, org_signature_string: signatureString };
		const { error: contractError } = await supabase.from('contracts').update(signatureDetails).match({ org, id });

		if (contractError) return contractError.message;
		return redirect(`/${org}/people/${id}`);
	}

	const { data, error } = await supabase.from('contracts').select().match({ org, profile: user.id, id });
	if (error || !data.length) return `You do not have adequate permission to execute contracts`;

	signatureDetails = { profile_signed: new Date() as any, profile_signature_string: signatureString };
	const { error: contractError } = await supabase.from('contracts').update(signatureDetails).match({ org, id });

	if (contractError) return contractError.message;
	return redirect(`/employee/${org}/${id}`);
};
