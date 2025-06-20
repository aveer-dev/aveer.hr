import { Tables, TablesInsert } from '@/type/database.types';
import { PostgrestError } from '@supabase/supabase-js';

export interface IUserUpdateViewRepository {
	getByUserAndContract({ userId, contractId, platform }: { userId?: string; contractId?: number; platform: 'employee' | 'admin' }): Promise<{ data: Tables<'user_update_views'> | null; error: PostgrestError | null }>;
	upsert(payload: TablesInsert<'user_update_views'>): Promise<{ data: Tables<'user_update_views'> | null; error: PostgrestError | null }>;
}
