import { createClient } from '@/utils/supabase/server';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { buttonVariants } from '../ui/button';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { AppraisalCycleOptions } from './appraisal-cycle-options';

interface Props {
	org: string;
}

interface AppraisalCycleCardDialogProps {
	org: string;
	cycle: any;
	badge?: ReactNode;
}

const AppraisalCycleCardDialog = ({ org, cycle }: AppraisalCycleCardDialogProps) => (
	<li className="flex items-center">
		<Link href={`./performance/${cycle.id}`} className={cn(buttonVariants({ variant: 'ghost' }), 'h-[unset] w-full justify-between gap-2')}>
			<div className="max-w-[9rem] truncate px-0 text-sm font-medium md:max-w-md">{cycle.name}</div>

			<div className="flex items-center gap-4">
				<div className="max-w-sm truncate">
					{format(new Date(cycle.start_date), 'MMM d, yyyy')} - {format(new Date(cycle.end_date), 'MMM d, yyyy')}
				</div>
			</div>
		</Link>

		<AppraisalCycleOptions cycle={cycle} org={org} />
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
			{/* Active Appraisals Section */}

			{cycles.some(cycle => new Date(cycle.start_date) <= new Date() && new Date(cycle.end_date) >= new Date()) && (
				<div className="space-y-4">
					<div className="flex items-center justify-between gap-2">
						<h3 className="w-fit whitespace-nowrap text-sm font-medium text-muted-foreground">Active Appraisals</h3>
						<Separator className="w-[calc(100%-8rem)]" />
					</div>

					<ul className="divide-y">
						{cycles
							.filter(cycle => new Date(cycle.start_date) <= new Date() && new Date(cycle.end_date) >= new Date())
							.map(cycle => {
								const isActive = new Date(cycle.start_date) <= new Date() && new Date(cycle.end_date) >= new Date();
								return <AppraisalCycleCardDialog key={cycle.id} org={org} cycle={cycle} badge={isActive ? <Badge variant="outline">Active</Badge> : null} />;
							})}
					</ul>
				</div>
			)}

			{/* Past Appraisals Section */}
			{cycles.some(cycle => new Date(cycle.end_date) < new Date()) && (
				<div className="space-y-4">
					<div className="flex items-center justify-between gap-2">
						<h3 className="w-fit text-sm font-medium text-muted-foreground">Past Appraisals</h3>
						<Separator className="w-full max-w-3xl" />
					</div>

					<ul className="divide-y">
						{cycles
							.filter(cycle => new Date(cycle.end_date) < new Date())
							.map(cycle => {
								const isPast = new Date(cycle.end_date) < new Date();
								return <AppraisalCycleCardDialog key={cycle.id} org={org} cycle={cycle} badge={isPast ? <Badge variant="secondary">Past</Badge> : null} />;
							})}
					</ul>
				</div>
			)}
		</div>
	);
};
