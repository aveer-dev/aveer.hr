import { IUserUpdateViewRepository } from '../interfaces/user-update-view.repository.interface';
import { TablesInsert } from '@/type/database.types';
import { createClient } from '@/utils/supabase/server';

export class UserUpdateViewRepository implements IUserUpdateViewRepository {
	async getByUserAndContract({ userId, contractId, platform }: { userId?: string; contractId?: number; platform: 'employee' | 'admin' }) {
		if (!userId || !contractId) return { data: null, error: { message: 'User profile or contract id required' } } as any;

		const supabase = await createClient();
		const request = supabase.from('user_update_views').select('*');
		if (userId) request.eq('profile', userId);
		if (contractId) request.eq('contract', contractId);
		if (platform) request.eq('platform', platform);

		const { data, error } = await request.single();
		return { data, error };
	}

	async upsert(payload: TablesInsert<'user_update_views'>) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('user_update_views').upsert(payload, { onConflict: 'profile,contract,platform' }).select().single();
		return { data, error };
	}
}
