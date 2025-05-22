import { useCallback, useEffect, useState } from 'react';
import { getProfileById, getProfileByEmail, getProfilesByOrg } from './actions';
import { ProfileWithRelations } from '@/dal/interfaces/profile.repository.interface';

interface UseProfileOptions {
	id?: string;
	email?: string;
	org?: string;
	enabled?: boolean;
}

interface UseProfileReturn {
	profile: ProfileWithRelations | null;
	profiles: ProfileWithRelations[];
	isLoading: boolean;
	error: Error | null;
	refetch: () => Promise<void>;
}

export function useProfile({ id, email, org, enabled = true }: UseProfileOptions): UseProfileReturn {
	const [profile, setProfile] = useState<ProfileWithRelations | null>(null);
	const [profiles, setProfiles] = useState<ProfileWithRelations[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const fetchProfile = useCallback(async () => {
		if (!enabled || (!id && !email && !org)) return;

		setIsLoading(true);
		setError(null);

		try {
			if (id) {
				const result = await getProfileById(id);
				setProfile(result.data);
				setProfiles([]);
			} else if (email) {
				const result = await getProfileByEmail(email);
				setProfile(result);
				setProfiles([]);
			} else if (org) {
				const results = await getProfilesByOrg(org);
				setProfiles(results);
				setProfile(null);
			}
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Failed to fetch profile'));
		} finally {
			setIsLoading(false);
		}
	}, [id, email, org, enabled]);

	useEffect(() => {
		fetchProfile();
	}, [fetchProfile]);

	return {
		profile,
		profiles,
		isLoading,
		error,
		refetch: fetchProfile
	};
}
