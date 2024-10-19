import { Tables } from '@/type/database.types';
import { LEVEL } from '@/type/roles.types';
import { createClient } from '@/utils/supabase/server';

export const getApplicants = async ({ manager, contract, org }: { manager?: Tables<'managers'> | null; contract: any; org: string }) => {
	const supabase = createClient();

	const { data, error } = await supabase
		.from('job_applications')
		.select(
			`*,
            country_location:countries!job_applications_country_location_fkey(name, country_code),
            org:organisations!job_applications_org_fkey(subdomain, name),
            role:open_roles!job_applications_role_fkey(job_title, direct_report, team, id, policy:approval_policies!open_roles_policy_fkey(levels))`
		)
		.match({ org, stage: 'interview' });

	if (error) return error.message;

	return data?.filter(applicant => {
		const levels: any[] = applicant.levels;

		return manager ? applicant.role.team == contract.team?.id || applicant.role.direct_report == contract.id || levels.find(level => level.id == contract.profile.id) : levels.find(level => level.id == contract.profile.id);
	});
};

export const getLeaveRequests = async ({ manager, contract, org }: { manager?: Tables<'managers'> | null; contract: any; org: string }) => {
	const supabase = createClient();

	const { data, error } = await supabase
		.from('time_off')
		.select(
			'*, hand_over:contracts!time_off_hand_over_fkey(id, job_title, profile:profiles!contracts_profile_fkey(first_name, last_name)), contract:contracts!time_off_contract_fkey(job_title, id, team, direct_report, unpaid_leave_used, sick_leave_used, paternity_leave_used, paid_leave_used, maternity_leave_used), profile:profiles!time_off_profile_fkey(*)'
		)
		.match({ org });

	if (error) return;

	/* if current user is a manager, check if it's current user own boarding,
	 * then check if it's for the team the current user is the manager of or the person is an independent reviewer
	 *
	 * else, just check if the person is an independent reviewer */
	return data?.filter(timeoff => {
		const levels = timeoff.levels as unknown as LEVEL[];

		return manager ? manager.person !== timeoff.contract.id && (timeoff.contract.team == contract.team || timeoff.contract.direct_report == contract.id || levels.find(level => level.id == String(contract.id))) : levels.find(level => level.id == String(contract.id));
	});
};

export const getBoardingRequests = async ({ manager, contract, org }: { manager?: Tables<'managers'> | null; contract: any; org: string }) => {
	const supabase = createClient();

	const { data, error } = await supabase.from('contract_check_list').select('*, contract:contracts!contract_check_list_contract_fkey(id, direct_report, job_title, team, profile:profiles!contracts_profile_fkey(first_name, last_name, id))').eq('org', org);

	if (error) return error.message;

	/* if current user is a manager, check if it's current user own boarding,
	 * then check if it's for the team the current user is the manager of or the person is an independent reviewer
	 *
	 * else, just check if the person is an independent reviewer */
	return data?.filter(boarding => {
		const levels: any[] = boarding.levels;

		return manager ? manager.person !== boarding.contract.id && (boarding.contract.team == contract.team || boarding.contract.direct_report == contract.id || levels.find(level => level.id == contract.id)) : levels.find(level => level.id == contract.id);
	});
};
