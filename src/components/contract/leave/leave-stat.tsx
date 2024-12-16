import { cn } from '@/lib/utils';
import { Database } from '@/type/database.types';
import { createClient } from '@/utils/supabase/server';
import { differenceInBusinessDays } from 'date-fns';

export const LeaveStat = async ({ days, total, label, org, profile }: { days: number; total: number; label: Database['public']['Enums']['leave_type_enum']; org: string; profile: string }) => {
	const supabase = await createClient();

	const percentage = (days / total) * 100;
	const formatedPercentage = Number.isInteger(percentage) ? percentage : Number(percentage.toFixed(1));

	const { data: timeOffRequests, error } = await supabase.from('time_off').select().match({ org, profile, status: 'pending' });
	if (error) return 'Error';

	const pendingLeaveDays = (type: Database['public']['Enums']['leave_type_enum']) => {
		const requests = timeOffRequests.filter(request => request.leave_type == type);
		let days = 0;
		requests.forEach(request => (days = days + (differenceInBusinessDays(request.to, request.from) + 1)));
		return days;
	};

	const pendingPercentage = (pendingLeaveDays(label) / total) * 100;
	const formatedPendingPercentage = Number.isInteger(pendingPercentage) ? pendingPercentage : Number(pendingPercentage.toFixed(1));
	const pending = { days: pendingLeaveDays(label), percentage: formatedPendingPercentage };

	return (
		<div className="space-y-2">
			<div className="relative h-1 w-full rounded-md bg-accent">
				<div className="absolute bottom-0 left-0 top-0 z-10 rounded-md bg-foreground transition-all" style={{ width: formatedPercentage + '%' }}>
					{formatedPercentage > 0 && <div className="absolute -right-px bottom-0 h-8 border-r pr-2 text-xs text-muted-foreground">{formatedPercentage}%</div>}
				</div>

				<div className="absolute bottom-0 left-0 top-0 rounded-md bg-orange-300 transition-all" style={{ width: pending.percentage + percentage + '%' }}>
					{pending.percentage > 0 && (
						<div className={cn('absolute -right-px bottom-0 border-r pr-2 text-xs text-muted-foreground', percentage > 0 ? 'h-16' : 'h-12')}>
							<div>pending</div>
							{pending.percentage}%
						</div>
					)}
				</div>
			</div>

			<div className="flex items-center justify-between">
				<h3 className="mt-2 text-xs font-normal">
					<span className="capitalize">{label}</span> leave
				</h3>
				<div className="space-y-1 text-xs text-muted-foreground">
					<p>
						{days} days of {total} days
					</p>
				</div>
			</div>
		</div>
	);
};
