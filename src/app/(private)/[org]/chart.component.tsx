'use client';

import { createClient } from '@/utils/supabase/client';
import NumberFlow from '@number-flow/react';
import { useEffect, useState } from 'react';

const supabase = createClient();

export const DashboardCharts = ({ org, contracts }: { org: string; contracts: number | null }) => {
	const [stats, setStats] = useState<{ label: string; number: number }[]>([
		{ label: 'People', number: 0 },
		{ label: 'Open roles', number: 0 }
	]);

	useEffect(() => {
		supabase
			.from('open_roles')
			.select('*', { count: 'exact', head: true })
			.eq('org', org)
			.then(roles => {
				setStats(() => {
					return [
						{ label: 'People', number: contracts || 0 },
						{ label: 'Open roles', number: roles.count || 0 }
					];
				});
			});
	}, [contracts, org]);

	return (
		<>
			{stats.map((stat, index) => (
				<div key={index} className="grid w-full max-w-80 gap-2">
					<h3 className="text-sm font-medium">{stat.label}</h3>
					<p className="text-8xl font-bold">
						<NumberFlow isolate value={Number(stat.number)} trend={0} />
					</p>
				</div>
			))}
		</>
	);
};
