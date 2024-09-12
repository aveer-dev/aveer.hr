'use server';

import { TablesUpdate } from '@/type/database.types';
import { doesUserHaveAdequatePermissions } from '@/utils/api';
import { createClient } from '@/utils/supabase/server';

export const updateApplication = async (id: number, payload: TablesUpdate<'job_applications'>, org: string) => {
	const supabase = createClient();

	const canUser = await doesUserHaveAdequatePermissions({ orgId: org });
	if (canUser !== true) return canUser;

	const { error, data } = await supabase
		.from('job_applications')
		.update(payload)
		.match({ org, id })
		.select(
			'*, country_location:countries!job_applications_country_location_fkey(name, country_code), org:organisations!job_applications_org_fkey(subdomain, name), role:open_roles!job_applications_role_fkey(job_title, id, policy:approval_policies!open_roles_policy_fkey(levels))'
		)
		.single();
	if (error) return error.message;

	return data;
};
