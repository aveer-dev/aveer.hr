import { useState, useEffect } from 'react';
import { ContractWithProfileAndTeam } from '@/dal';
import { getEmployeeProfileTeam } from './server';

interface UseUserProfileResult {
	data: ContractWithProfileAndTeam[] | null;
	error: string | null;
	loading: boolean;
}

export const useEmployeeProfileTeam = (profileId: string, org: string): UseUserProfileResult => {
	const [data, setData] = useState<ContractWithProfileAndTeam[] | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		if (!profileId || !org) return;
		setLoading(true);

		(async () => {
			try {
				const contract = await getEmployeeProfileTeam(profileId, org);

				setData(contract);
				setError(null);
			} catch (err: any) {
				setError(err.message || 'Unknown error');
				setData(null);
			} finally {
				setLoading(false);
			}
		})();
	}, [profileId, org]);

	return { data, error, loading };
};
