'use server';

import { Tables, TablesUpdate } from '@/type/database.types';
import { APPLICANT } from '@/type/roles.types';
import { doesUserHaveAdequatePermissions } from '@/utils/api';
import { createClient } from '@/utils/supabase/server';

export const updateApplication = async (id: number, payload: TablesUpdate<'job_applications'>, org: string) => {
	const supabase = await createClient();

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

const getDefaultApprovalPolicy = async (org: string) => {
	const supabase = await createClient();

	const { data, error } = await supabase.from('approval_policies').select().match({ org, type: 'role_application', is_default: true });

	return { data, error };
};

export const updateApplicant = async ({ applicant, stage }: { applicant: APPLICANT; stage: string }) => {
	const applicationLevels = applicant.levels?.length ? applicant.levels : (await getDefaultApprovalPolicy(applicant.org.subdomain))?.data![0]?.levels || [];

	const payload: TablesUpdate<'job_applications'> = { stage };
	if (stage == 'interview' && applicationLevels) payload.levels = applicationLevels as any;

	const response = await updateApplication(applicant.id, payload, applicant.org.subdomain);

	return response;
};
