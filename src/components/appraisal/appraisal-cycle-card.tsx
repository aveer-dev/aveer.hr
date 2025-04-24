import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tables } from '@/type/database.types';
import { AppraisalReviewDialog } from './appraisal-review-dialog';
import { AppraisalFormDialog } from './appraisal-form-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Info } from 'lucide-react';
import { AppraisalScoreDialog } from './appraisal-score-dialog';
import { calculateAppraisalScore } from '@/lib/utils';

interface AppraisalCycleCardProps {
	org: string;
	cycle: Tables<'appraisal_cycles'>;
	answer?: Tables<'appraisal_answers'>;
	contract: Tables<'contracts'>;
	teams: Tables<'teams'>[];
	manager: Tables<'managers'> | null;
	teamMembers: any[];
	status?: 'active' | 'past';
}

export const AppraisalCycleCard = ({ org, cycle, answer, contract, teams, manager, teamMembers, status }: AppraisalCycleCardProps) => {
	const isSubmitted = !!answer?.employee_submission_date;
	const isManagerReviewed = !!answer?.manager_submission_date;
	const isActive = status === 'active';
	const isPast = status === 'past';

	// Weight distribution for final score calculation
	const managerPercentage = 70;
	const employeePercentage = 30;

	const score = calculateAppraisalScore({
		answer,
		isSubmitted,
		isManagerReviewed,
		employeePercentage,
		managerPercentage
	});

	return (
		<Card className="w-full">
			<CardHeader className="p-4">
				<div className="flex items-center justify-between">
					<div className="space-y-1">
						<CardTitle className="text-base font-medium">{cycle.name}</CardTitle>
						<CardDescription className="text-xs">
							{format(new Date(cycle.start_date), 'MMM d, yyyy')} - {format(new Date(cycle.end_date), 'MMM d, yyyy')}
						</CardDescription>
					</div>
					<div className="flex items-center gap-2">
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Info size={14} className="text-muted-foreground" />
								</TooltipTrigger>

								<TooltipContent>
									<p className="max-w-40">{isPast ? 'This appraisal cycle has ended. You can only view your previous answers, if you have any.' : 'You can update your answers until the self review due date.'}</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
						{isActive && <Badge variant="outline">Active</Badge>}
						{isPast && <Badge variant="secondary">Past</Badge>}
						{!isPast && <Badge variant={isManagerReviewed ? 'secondary-success' : isSubmitted ? 'secondary' : 'outline'}>{isManagerReviewed ? 'Reviewed' : isSubmitted ? 'Submitted' : 'In Progress'}</Badge>}
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-4 p-4 pt-0">
				<div className="flex items-center justify-between text-xs text-muted-foreground">
					<div className="space-y-1">
						<p>Self Review Due: {format(new Date(cycle.self_review_due_date), 'MMM d, yyyy')}</p>
						<p>Manager Review Due: {format(new Date(cycle.manager_review_due_date), 'MMM d, yyyy')}</p>
					</div>

					{isManagerReviewed && isPast ? (
						<div className="flex items-center gap-2">
							{score && (
								<AppraisalScoreDialog
									score={score}
									employeePercentage={employeePercentage}
									managerPercentage={managerPercentage}
									trigger={<div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary font-medium text-primary-foreground transition-colors hover:bg-primary/90">{score.finalScore.toFixed(0)}%</div>}
								/>
							)}
							<AppraisalReviewDialog org={org} contract={contract} appraisalCycle={cycle} answer={answer} />
						</div>
					) : (
						<div className="flex items-center gap-2">
							{score && <AppraisalScoreDialog score={score} employeePercentage={employeePercentage} managerPercentage={managerPercentage} />}
							<AppraisalFormDialog teams={teams} org={org} contract={contract} appraisalCycle={cycle} contractAnswer={answer} isManager={!!manager} teamMembers={teamMembers} manager={manager} />
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
};
