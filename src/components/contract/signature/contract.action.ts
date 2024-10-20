'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export const employeeSignContract = async ({ payload, org, id }: { payload: FormData; org: string; id: number }): Promise<string> => {
	const supabase = createClient();

	const signatureString = payload.get('signature-string') as string;

	const { error: contractError } = await supabase
		.from('contracts')
		.update({ profile_signed: new Date() as any, profile_signature_string: signatureString })
		.match({ org, id });

	if (contractError) return contractError.message;
	return redirect(`./contract`);
};
