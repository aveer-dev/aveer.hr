import { createClient } from '@/utils/supabase/server';
import { Tables } from '@/type/database.types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { AppraisalCycleDialog } from './appraisal-cycle-dialog';
import { DeleteAppraisalCycle } from './delete-appraisal-cycle';

interface Props {
	org: string;
}

export const AppraisalCyclesList = async ({ org }: Props) => {
	const supabase = await createClient();
	const { data: cycles, error } = await supabase.from('appraisal_cycles').select('*, created_by(first_name, last_name)').match({ org });

	if (error) {
		return (
			<div className="flex h-56 items-center justify-center rounded-md bg-accent text-xs text-muted-foreground">
				<p>Error loading appraisal cycles</p>
			</div>
		);
	}

	if (!cycles || cycles.length === 0) {
		return (
			<div className="flex h-56 items-center justify-center rounded-md bg-accent text-xs text-muted-foreground">
				<p>No appraisal cycles yet. Create one to get started.</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{cycles.map(cycle => (
				<AppraisalCycleDialog key={cycle.id} org={org} cycle={cycle}>
					<div className="flex cursor-pointer items-center justify-between rounded-lg border p-4">
						<div className="space-y-1">
							<div className="flex items-center justify-between gap-2">
								<h3 className="text-sm font-medium">{cycle.name}</h3>
							</div>

							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<span>
									Created by: {cycle.created_by.first_name} {cycle.created_by.last_name}
								</span>
							</div>

							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<span>Start Date: {format(new Date(cycle.start_date), 'MMM d, yyyy')}</span>
								<Separator orientation="vertical" className="h-4" />
								<span>End Date: {format(new Date(cycle.end_date), 'MMM d, yyyy')}</span>
							</div>
						</div>
					</div>
				</AppraisalCycleDialog>
			))}
		</div>
	);
};
