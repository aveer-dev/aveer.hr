import { useState, useEffect } from 'react';
import { ContractWithProfileAndTeam } from '@/dal';
import { getEmployeeProfileTeam } from './server';
import { createClient } from '@/utils/supabase/client';

interface UseUserProfileResult {
	data: ContractWithProfileAndTeam[] | null;
	error: string | null;
	loading: boolean;
}

const supabase = createClient();

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

				if (contract?.length == 0) {
					const {
						data: { session }
					} = await supabase.auth.getSession();
					const tempData = {
						profile: { first_name: session?.user.user_metadata.first_name, last_name: session?.user.user_metadata.last_name, email: session?.user.email as string }
					};
					setData([tempData as any]);
					return;
				}

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
