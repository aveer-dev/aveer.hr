import { ContractForm } from '@/components/forms/contract/form';
import { getFormEntities, getOrgLevels, getTeams, getRoles, getEmployees, getOrgSettings } from '@/utils/form-data-init';
import { createClient } from '@/utils/supabase/server';

export const NewPersonPage = async ({ org, duplicate }: { org: string; duplicate: string }) => {
	const supabase = await createClient();

	const [contract, entities, levels, teams, roles, employees, data] = await Promise.all([
		duplicate ? await supabase.from('contracts').select().match({ id: duplicate, org }).single() : undefined,
		await getFormEntities({ org }),
		await getOrgLevels({ org }),
		await getTeams({ org }),
		await getRoles({ org }),
		await getEmployees({ org }),
		await getOrgSettings({ org })
	]);

	return <ContractForm employeesData={employees} orgBenefits={data?.data} contractData={contract?.data ? contract.data : undefined} entitiesData={entities as any} levels={levels} teamsData={teams} rolesData={roles} />;
};
