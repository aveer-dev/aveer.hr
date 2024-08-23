import { Card } from '@/components/ui/card';
import { createClient } from '@/utils/supabase/server';

export const DashboardCharts = async ({ org }: { org: string }) => {
	const supabase = createClient();

	const { data } = await supabase.from('dashboard_stats').select().eq('org', org).single();

	return (
		<>
			<div className="grid gap-2">
				<h3 className="text-sm font-medium">People</h3>
				<p className="text-8xl font-bold">
					{data?.signed_contracts && data?.signed_contracts < 10 ? '0' : ''}
					{data?.signed_contracts || 0}
				</p>
			</div>

			<div className="grid gap-2">
				<h3 className="text-sm font-medium">Open roles</h3>
				<p className="text-8xl font-bold">
					{data?.contracts && data?.contracts < 10 ? '0' : ''}
					{data?.contracts || 0}
				</p>
			</div>
		</>
	);
};
