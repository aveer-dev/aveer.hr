import { createClient } from '@/utils/supabase/server';

export const DashboardCharts = async ({ org, contracts }: { org: string; contracts: number | null }) => {
	const supabase = createClient();

	const { count } = await supabase.from('open_roles').select('*', { count: 'exact', head: true }).eq('org', org);

	return (
		<>
			<div className="grid gap-2">
				<h3 className="text-sm font-medium">People</h3>
				<p className="text-8xl font-bold">
					{contracts && contracts < 10 ? '0' : ''}
					{contracts || 0}
				</p>
			</div>

			<div className="grid gap-2">
				<h3 className="text-sm font-medium">Open roles</h3>
				<p className="text-8xl font-bold">
					{count && count < 10 ? '0' : ''}
					{count || 0}
				</p>
			</div>
		</>
	);
};
