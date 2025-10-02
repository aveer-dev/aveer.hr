import { createClient } from '@/utils/supabase/server';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '../ui/button';
import { ReactNode } from 'react';
import { AppraisalCycleDialog } from './appraisal-cycle-dialog';
import { parseDateOnly } from '@/lib/utils';

interface Props {
	org: string;
}

interface AppraisalCycleCardDialogProps {
	org: string;
	cycle: any;
}

const AppraisalCycleCardDialog = ({ org, cycle }: AppraisalCycleCardDialogProps) => (
	<li className="flex items-center py-2">
		<AppraisalCycleDialog key={cycle.id} org={org} cycle={cycle}>
			<Button variant="ghost" className="h-14 w-full justify-between gap-2 focus:ring-border focus-visible:ring-border">
				<div className="max-w-[9rem] truncate px-0 text-sm font-medium md:max-w-md">
					{cycle.name}
					<Badge variant="secondary" className="ml-2 border-primary/5">
						{cycle.type
							.split('_')
							.map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
							.join(' ')}
					</Badge>
				</div>

				<div className="flex items-center gap-4">
					<div className="max-w-sm truncate">
						{format(parseDateOnly(cycle.start_date), 'MMM d, yyyy')} - {format(parseDateOnly(cycle.end_date), 'MMM d, yyyy')}
					</div>
				</div>
			</Button>
		</AppraisalCycleDialog>
	</li>
);

export const AppraisalCyclesList = async ({ org }: Props) => {
	const supabase = await createClient();
	const { data: cycles, error } = await supabase.from('appraisal_cycles').select('*, created_by(id, first_name, last_name)').match({ org }).order('start_date', { ascending: false });

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
		<div className="mt-12 space-y-12">
			{/* Future Appraisals Section */}

			{cycles.some(cycle => parseDateOnly(cycle.start_date) > new Date() && parseDateOnly(cycle.end_date) >= new Date()) && (
				<div className="space-y-2">
					<div className="flex items-center justify-between gap-2">
						<h3 className="w-fit whitespace-nowrap text-sm font-medium text-muted-foreground">Future Appraisals</h3>
						<Separator className="w-[calc(100%-8rem)]" />
					</div>

					<ul className="divide-y">
						{cycles
							.filter(cycle => parseDateOnly(cycle.start_date) > new Date() && parseDateOnly(cycle.end_date) >= new Date())
							.map(cycle => {
								const isActive = parseDateOnly(cycle.start_date) > new Date() && parseDateOnly(cycle.end_date) >= new Date();
								return <AppraisalCycleCardDialog key={cycle.id} org={org} cycle={cycle} />;
							})}
					</ul>
				</div>
			)}

			{/* Active Appraisals Section */}
			{cycles.some(cycle => parseDateOnly(cycle.start_date) <= new Date() && parseDateOnly(cycle.end_date) >= new Date()) && (
				<div className="space-y-2">
					<div className="flex items-center justify-between gap-2">
						<h3 className="w-fit whitespace-nowrap text-sm font-medium text-muted-foreground">Active Appraisals</h3>
						<Separator className="w-[calc(100%-8rem)]" />
					</div>

					<ul className="divide-y">
						{cycles
							.filter(cycle => parseDateOnly(cycle.start_date) <= new Date() && parseDateOnly(cycle.end_date) >= new Date())
							.map(cycle => {
								const isActive = parseDateOnly(cycle.start_date) <= new Date() && parseDateOnly(cycle.end_date) >= new Date();
								return <AppraisalCycleCardDialog key={cycle.id} org={org} cycle={cycle} />;
							})}
					</ul>
				</div>
			)}

			{/* Past Appraisals Section */}
			{cycles.some(cycle => parseDateOnly(cycle.end_date) < new Date()) && (
				<div className="space-y-2">
					<div className="flex items-center justify-between gap-2">
						<h3 className="w-fit text-sm font-medium text-muted-foreground">Past Appraisals</h3>
						<Separator className="w-[calc(100%-8rem)]" />
					</div>

					<ul className="divide-y">
						{cycles
							.filter(cycle => parseDateOnly(cycle.end_date) < new Date())
							.map(cycle => {
								const isPast = parseDateOnly(cycle.end_date) < new Date();
								return <AppraisalCycleCardDialog key={cycle.id} org={org} cycle={cycle} />;
							})}
					</ul>
				</div>
			)}
		</div>
	);
};
