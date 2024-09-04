import { createClient } from '@/utils/supabase/server';

export const DashboardCharts = async ({ org, contracts }: { org: string; contracts: number | null }) => {
	const supabase = createClient();

	const { count } = await supabase.from('open_roles').select('*', { count: 'exact', head: true }).eq('org', org);
	const stats = [
		{ label: 'People', number: `${contracts && contracts < 10 ? '0' : ''}${contracts || 0}` },
		{ label: 'Open roles', number: `${count && count < 10 ? '0' : ''}${count || 0}` }
	];

	return (
		<>
			{stats.map((stat, index) => (
				<div key={index} className="grid w-full max-w-80 gap-2">
					<h3 className="text-sm font-medium">{stat.label}</h3>
					<p className="text-8xl font-bold">{stat.number}</p>
				</div>
			))}
		</>
	);
};
