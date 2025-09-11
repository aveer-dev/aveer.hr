import { Tables } from '@/type/database.types';
import { createClient } from '@/utils/supabase/server';

/**
 * Fetches the default approval policy for a specific type (role_application, time_off, or boarding)
 * @param org - Organization identifier
 * @param type - Type of approval policy to fetch
 */
const getDefaultApprovalPolicy = async (org: string, type: 'role_application' | 'time_off' | 'boarding') => {
	const supabase = await createClient();

	const { data, error } = await supabase.from('approval_policies').select().match({ org, type, is_default: true });

	return { data, error };
};

/**
 * Fetches and filters job applicants based on their approval levels and manager status
 * @param manager - Manager object if the current user is a manager
 * @param contract - Contract object containing team and profile information
 * @param org - Organization identifier
 */
export const getApplicants = async ({ manager, contract, org }: { manager?: Tables<'managers'>[] | null; contract: any; org: string }) => {
	const supabase = await createClient();

	// Fetch all job applications in interview stage for the organization
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

	// Cache for default levels to avoid multiple fetches
	let defaultLevels: any[] = [];

	// Process each applicant asynchronously
	const filteredApplicants = await Promise.all(
		data?.map(async applicant => {
			// If applicant has no levels, try to get default levels from policy
			if (!applicant.levels?.length) {
				// Only fetch default policy if we haven't already
				if (!defaultLevels.length) {
					const defaultPolicy = await getDefaultApprovalPolicy(org, 'role_application');
					defaultLevels = defaultPolicy.data?.[0]?.levels || [];
				}
			}

			// Use applicant's levels if they exist, otherwise use default levels
			const levels: any[] = applicant.levels?.length ? applicant.levels : defaultLevels;

			// Determine if applicant should be included based on manager status
			const shouldInclude =
				manager && manager.length > 0
					? // For managers: include if applicant is in their team OR they're the direct report OR they're in approval levels
						manager.some(manager => applicant.role.team == manager.team || applicant.role.direct_report == manager.person || levels.find(level => level.id == manager.profile))
					: // applicant.role.team == (contract.team?.id || contract.team) || applicant.role.direct_report == contract.id || levels.find(level => level.id == (contract.profile.id || contract.profile))
						// For non-managers: include if they're in approval levels
						levels.find(level => level.id == (contract.id || contract));

			return shouldInclude ? applicant : null;
		}) || []
	);

	// Filter out null values (applicants that didn't meet criteria)
	return filteredApplicants.filter(Boolean);
};

/**
 * Fetches and filters leave requests based on approval levels and manager status
 * @param manager - Manager object if the current user is a manager
 * @param contract - Contract object containing team and profile information
 * @param org - Organization identifier
 * @param status - Optional status filter for leave requests
 */
export const getLeaveRequests = async ({ managerialPositions, contract, org, status }: { status?: string; managerialPositions?: Tables<'managers'>[] | null; contract: any; org: string }) => {
	const supabase = await createClient();

	// Build query with optional status filter
	const query: { org: string; status?: string } = { org };
	if (status) query.status = status;

	// Fetch all leave requests matching the query
	const { data, error } = await supabase
		.from('time_off')
		.select(
			`*,
            hand_over:contracts!time_off_hand_over_fkey(id, job_title, profile:profiles!contracts_profile_fkey(first_name, last_name)),
            contract:contracts!time_off_contract_fkey(job_title, id, team, direct_report, unpaid_leave_used, sick_leave_used, paternity_leave_used, paid_leave_used, maternity_leave_used),
            profile:profiles!time_off_profile_fkey(*)`
		)
		.match({ ...query });

	if (error) return;

	// Cache for default levels to avoid multiple fetches
	let defaultLevels: any[] = [];

	// Process each leave request asynchronously
	const filteredRequests = await Promise.all(
		data?.map(async timeoff => {
			// If request has no levels, try to get default levels from policy
			if (!timeoff.levels?.length) {
				// Only fetch default policy if we haven't already
				if (!defaultLevels.length) {
					const defaultPolicy = await getDefaultApprovalPolicy(org, 'time_off');
					defaultLevels = defaultPolicy.data?.[0]?.levels || [];
				}
			}

			// Use request's levels if they exist, otherwise use default levels
			const levels = timeoff.levels?.length ? timeoff.levels : defaultLevels;

			// For managers: include if it's not their own request AND (they manage the team OR they're in approval levels)
			const isManager = managerialPositions && managerialPositions.length > 0 && managerialPositions.some(manager => manager.person !== timeoff.contract.id && (timeoff.contract.team == manager.team || levels.find(level => level.id == String(manager.profile))));
			const isDirectReport = timeoff.contract.direct_report == contract.id;

			// Determine if request should be included based on manager status
			const shouldInclude = isManager || isDirectReport || levels.find(level => level.id == String(contract.id));

			return shouldInclude ? timeoff : null;
		}) || []
	);

	// Filter out null values (requests that didn't meet criteria)
	return filteredRequests.filter(Boolean);
};

/**
 * Fetches and filters boarding requests based on approval levels and manager status
 * @param manager - Manager object if the current user is a manager
 * @param contract - Contract object containing team and profile information
 * @param org - Organization identifier
 */
export const getBoardingRequests = async ({ manager, contract, org }: { manager?: Tables<'managers'>[] | null; contract: any; org: string }) => {
	const supabase = await createClient();

	// Fetch all boarding requests for the organization
	const { data, error } = await supabase.from('contract_check_list').select('*, contract:contracts!contract_check_list_contract_fkey(id, direct_report, job_title, team, profile:profiles!contracts_profile_fkey(first_name, last_name, id))').eq('org', org);

	if (error) return error.message;

	// Cache for default levels to avoid multiple fetches
	let defaultLevels: any[] = [];

	// Process each boarding request asynchronously
	const filteredRequests = await Promise.all(
		data?.map(async boarding => {
			// If request has no levels, try to get default levels from policy
			if (!boarding.levels?.length) {
				// Only fetch default policy if we haven't already
				if (!defaultLevels.length) {
					const defaultPolicy = await getDefaultApprovalPolicy(org, 'boarding');
					defaultLevels = defaultPolicy.data?.[0]?.levels || [];
				}
			}

			// Use request's levels if they exist, otherwise use default levels
			const levels: any[] = boarding.levels?.length ? boarding.levels : defaultLevels;

			const isManager = manager && manager.length > 0 && manager.some(manager => manager.person !== boarding.contract.id && (boarding.contract.team == manager.team || levels.find(level => level.id == String(manager.profile))));
			const isDirectReport = boarding.contract.direct_report == contract.id;

			// Determine if request should be included based on manager status
			const shouldInclude = isManager || isDirectReport || levels.find(level => level.id == String(contract.id));

			return shouldInclude ? boarding : null;
		}) || []
	);

	// Filter out null values (requests that didn't meet criteria)
	return filteredRequests.filter(Boolean);
};
