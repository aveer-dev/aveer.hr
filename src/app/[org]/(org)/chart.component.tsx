'use client';

import NumberFlow from '@number-flow/react';
import { useEffect, useState } from 'react';

export const DashboardCharts = ({ contracts, openRoles }: { contracts: number | null; openRoles: number | null }) => {
	const [stats, setStats] = useState<{ label: string; number: number }[]>([
		{ label: 'People', number: 0 },
		{ label: 'Open roles', number: 0 }
	]);

	useEffect(() => {
		setStats(stats => {
			stats[0].number = contracts || 0;
			stats[1].number = openRoles || 0;
			return [...stats];
		});
	}, [contracts, openRoles]);

	return (
		<div className="mb-20 grid w-fit grid-cols-2 flex-wrap gap-x-20 gap-y-10">
			{stats.map((stat, index) => (
				<div key={index} className="grid w-full max-w-80 gap-2">
					<h3 className="text-sm font-medium">{stat.label}</h3>
					<p className="text-8xl font-bold">
						<NumberFlow isolate value={Number(stat.number)} trend={0} />
					</p>
				</div>
			))}
		</div>
	);
};
