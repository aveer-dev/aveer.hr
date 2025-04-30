import { ContractForm } from '@/components/forms/contract/form';
import { getFormEntities, getOrgLevels, getTeams, getRoles, getEmployees, getOrgSettings } from '@/utils/form-data-init';
import { createClient } from '@/utils/supabase/server';

export const NewPersonPage = async ({ param }: { param: { params: Promise<{ [key: string]: string }>; searchParams: Promise<{ [key: string]: string }> } }) => {
	const searchParams = await param.searchParams;
	const params = await param.params;

	const supabase = await createClient();

	const [contract, entities, levels, teams, roles, employees, data] = await Promise.all([
		searchParams.duplicate ? await supabase.from('contracts').select().match({ id: searchParams.duplicate, org: params.org }).single() : undefined,
		await getFormEntities({ org: params.org }),
		await getOrgLevels({ org: params.org }),
		await getTeams({ org: params.org }),
		await getRoles({ org: params.org }),
		await getEmployees({ org: params.org }),
		await getOrgSettings({ org: params.org })
	]);

	return <ContractForm employeesData={employees} orgBenefits={data?.data} contractData={contract?.data ? contract.data : undefined} entitiesData={entities as any} levels={levels} teamsData={teams} rolesData={roles} />;
};
