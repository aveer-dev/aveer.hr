import { IProfileRepository, ProfileWithRelations } from '../interfaces/profile.repository.interface';
import { Tables } from '@/type/database.types';
import { createClient } from '@/utils/supabase/server';

export class ProfileRepository implements IProfileRepository {
	private readonly profileSelect = '*, nationality:countries!profiles_nationality_fkey(*)';

	async getById(id: string, select?: string) {
		const supabase = await createClient();
		const { data, error } = await supabase
			.from('profiles')
			.select(select || this.profileSelect)
			.eq('id', id)
			.single();

		if (error) return { data: data as unknown as ProfileWithRelations, error: null };

		return { data: data as unknown as ProfileWithRelations, error: null };
	}

	async getByEmail(email: string): Promise<ProfileWithRelations | null> {
		const supabase = await createClient();
		const { data, error } = await supabase.from('profiles').select(this.profileSelect).eq('email', email).single();

		if (error) {
			console.error('Error fetching profile by email:', error);
			return null;
		}

		return data as unknown as ProfileWithRelations;
	}

	async getAllByOrg(org: string): Promise<ProfileWithRelations[]> {
		const supabase = await createClient();
		const { data, error } = await supabase.from('profiles').select(this.profileSelect).eq('org', org);

		if (error) {
			console.error('Error fetching profiles by org:', error);
			return [];
		}

		return (data || []) as unknown as ProfileWithRelations[];
	}

	async update(id: string, data: Partial<Tables<'profiles'>>): Promise<ProfileWithRelations | null> {
		const supabase = await createClient();
		const { data: updatedProfile, error } = await supabase.from('profiles').update(data).eq('id', id).select(this.profileSelect).single();

		if (error) {
			console.error('Error updating profile:', error);
			return null;
		}

		return updatedProfile as unknown as ProfileWithRelations;
	}
}
