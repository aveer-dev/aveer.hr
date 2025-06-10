import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Tables } from '@/type/database.types';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { buttonVariants } from '../ui/button';
import { Separator } from '../ui/separator';

interface AppraisalCycleCardProps {
	org: string;
	cycle: Tables<'appraisal_cycles'>;
	answer?: Tables<'appraisal_answers'>;
	status?: 'active' | 'past';
}

export const AppraisalCycleCard = ({ cycle, answer, status }: AppraisalCycleCardProps) => {
	const isSubmitted = !!answer?.employee_submission_date;
	const isManagerReviewed = !!answer?.manager_submission_date;
	const isActive = status === 'active';
	const isPast = status === 'past';

	return (
		<Link href={`./performance/${cycle.id}`} className={cn(buttonVariants({ variant: 'ghost' }), 'h-[unset] w-full justify-between gap-2 p-3')}>
			<div className="flex items-center gap-3">
				<div className={cn('max-w-md truncate text-sm font-medium')}>{cycle.name}</div>

				<div className="flex items-center gap-3">
					{isActive && <Badge variant="outline">Active</Badge>}
					{isPast && <Badge variant="secondary">Past</Badge>}
					{!isPast && <Badge variant={isManagerReviewed ? 'secondary-success' : isSubmitted ? 'secondary' : 'outline'}>{isManagerReviewed ? 'Reviewed' : isSubmitted ? 'Submitted' : 'In Progress'}</Badge>}
				</div>
			</div>

			<div className="flex items-center gap-4">
				<div>Self Review Due: {format(new Date(cycle.self_review_due_date), 'MMM d, yyyy')}</div>

				<Separator orientation="vertical" className="h-4" />

				<div className="max-w-sm truncate">
					{format(new Date(cycle.start_date), 'MMM d, yyyy')} - {format(new Date(cycle.end_date), 'MMM d, yyyy')}
				</div>
			</div>
		</Link>
	);
};
