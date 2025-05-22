import { Tables } from '@/type/database.types';
import { PostgrestError } from '@supabase/supabase-js';

export type ProfileWithRelations = Tables<'profiles'> & {
	nationality?: Tables<'countries'>;
};

export interface IProfileRepository {
	/**
	 * Get a profile by its ID
	 * @param id The profile ID
	 * @returns The profile with its relations or null if not found
	 */
	getById(id: string, select?: string): Promise<{ data: ProfileWithRelations | null; error: PostgrestError | null }>;

	/**
	 * Get a profile by email
	 * @param email The profile's email address
	 * @returns The profile with its relations or null if not found
	 */
	getByEmail(email: string): Promise<ProfileWithRelations | null>;

	/**
	 * Get all profiles for an organization
	 * @param org The organization subdomain
	 * @returns Array of profiles with their relations
	 */
	getAllByOrg(org: string): Promise<ProfileWithRelations[]>;

	/**
	 * Update a profile
	 * @param id The profile ID
	 * @param data The profile data to update
	 * @returns The updated profile or null if update failed
	 */
	update(id: string, data: Partial<Tables<'profiles'>>): Promise<ProfileWithRelations | null>;
}
