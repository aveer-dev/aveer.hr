'use server';

import { ContractRepository } from '@/dal';
import { ContractWithProfileAndTeam } from '@/dal/interfaces/contract.repository.interface';

export async function getEmployeeProfileTeam(profileId: string, org: string) {
	const repo = new ContractRepository();
	return await repo.getByProfileWithProfileAndTeam({ id: profileId, org });
}
