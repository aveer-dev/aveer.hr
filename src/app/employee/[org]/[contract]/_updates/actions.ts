'use server';

import { UserUpdateViewRepository } from '@/dal/repositories/user-update-view.repository';
import { TablesInsert } from '@/type/database.types';

const repo = new UserUpdateViewRepository();

export async function upsertUserUpdateView(userId: string, contractId: number) {
	const payload: TablesInsert<'user_update_views'> = {
		profile: userId,
		contract: contractId,
		platform: 'employee' as const,
		last_viewed_at: new Date().toISOString()
	};
	return repo.upsert(payload);
}
