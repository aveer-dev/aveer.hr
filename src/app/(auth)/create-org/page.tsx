import { createClient } from '@/utils/supabase/server';
import { OrgForm } from './form';
import { redirect } from 'next/navigation';
import { TablesInsert } from '@/type/database.types';

export default function CreateOrgPage() {
	const createOrg = async (payload: FormData): Promise<string> => {
		'use server';
		const supabase = createClient();

		const orgData: TablesInsert<'organisations'> = {
			name: payload.get('org-name') as string,
			website: payload.get('website') as string,
			subdomain: payload.get('subdomain') as string
		};

		const { error, data } = await supabase.from('organisations').insert(orgData).select('id').single();
		if (error || !data) return error.message;

		await supabase.from('profiles_roles').insert({ organisation: data.id, role: 'admin' });
		return redirect(`/${data.id}`);
	};

	return (
		<div className="mx-auto grid w-[350px] gap-9">
			<div className="mb-4 grid gap-2">
				<h1 className="text-xl font-bold">Create Organisation</h1>
				<p className="text-xs font-light text-muted-foreground">You can provide your legal full name if you&apos;d like to get started as an individual</p>
			</div>

			<OrgForm formAction={createOrg} />
		</div>
	);
}
