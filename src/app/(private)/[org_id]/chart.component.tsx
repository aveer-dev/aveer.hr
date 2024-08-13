import { Chart } from '@/components/dashboard/chart';
import { createClient } from '@/utils/supabase/server';

export const DashboardCharts = async ({ orgId }: { orgId: string }) => {
	const supabase = createClient();

	const { data } = await supabase.from('dashboard_stats').select().eq('org', orgId).single();

	return (
		<>
			<div className="flex w-full max-w-72 flex-wrap items-start justify-between gap-6">
				<div className="grid gap-2">
					<h3 className="text-base font-medium">People</h3>
					<p className="text-5xl font-bold">{data?.signed_contracts || 0}</p>
				</div>

				<Chart />
			</div>

			<div className="flex w-full max-w-80 flex-wrap items-start justify-between gap-4">
				<div className="grid gap-2">
					<h3 className="text-base font-medium">Open roles</h3>
					<p className="text-5xl font-bold">{data?.contracts || 0}</p>
				</div>

				<Chart />
			</div>
		</>
	);
};
