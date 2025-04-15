import { createClient } from '@/utils/supabase/server';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tables } from '@/type/database.types';
import { AppraisalReviewDialog } from './appraisal-review-dialog';
import { AppraisalFormDialog } from './appraisal-form-dialog';

interface Props {
	org: string;
	contract: Tables<'contracts'>;
}

export const EmployeeAppraisalList = async ({ org, contract }: Props) => {
	const supabase = await createClient();

	// Get active appraisal cycles
	const { data: appraisalCycles } = await supabase.from('appraisal_cycles').select('*').eq('org', org).lte('start_date', new Date().toISOString()).gte('end_date', new Date().toISOString()).order('start_date', { ascending: false });

	if (!appraisalCycles || appraisalCycles.length === 0) {
		return (
			<div className="flex h-56 items-center justify-center rounded-md bg-accent text-xs text-muted-foreground">
				<p>No active appraisal cycles at the moment.</p>
			</div>
		);
	}

	// Get appraisal answers for all cycles
	const { data: appraisalAnswers } = await supabase
		.from('appraisal_answers')
		.select('*')
		.eq('org', org)
		.eq('contract', contract.id)
		.in(
			'appraisal',
			appraisalCycles.map(cycle => cycle.id)
		);

	return (
		<div className="space-y-4">
			{appraisalCycles.map(cycle => {
				const answer = appraisalAnswers?.find(a => a.appraisal === cycle.id);
				const isSubmitted = !!answer?.submission_date;
				const isManagerReviewed = !!answer?.manager_submission_date;

				console.log('🚀 ~ EmployeeAppraisalList ~ isManagerReviewed:', isManagerReviewed, answer?.manager_submission_date, isSubmitted, answer);

				return (
					<Card key={cycle.id} className="w-full">
						<CardHeader className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<CardTitle className="text-base">{cycle.name}</CardTitle>
									<CardDescription className="text-xs">
										{format(new Date(cycle.start_date), 'MMM d, yyyy')} - {format(new Date(cycle.end_date), 'MMM d, yyyy')}
									</CardDescription>
								</div>
								<Badge variant={isManagerReviewed ? 'default' : isSubmitted ? 'secondary' : 'outline'}>{isManagerReviewed ? 'Reviewed' : isSubmitted ? 'Submitted' : 'In Progress'}</Badge>
							</div>
						</CardHeader>

						<CardContent className="p-4 pt-0">
							<div className="flex items-center justify-between text-xs text-muted-foreground">
								<div>
									<p>Self Review Due: {format(new Date(cycle.self_review_due_date), 'MMM d, yyyy')}</p>
									<p>Manager Review Due: {format(new Date(cycle.manager_review_due_date), 'MMM d, yyyy')}</p>
								</div>

								{isManagerReviewed ? <AppraisalReviewDialog org={org} contract={contract} appraisalCycle={cycle} answer={answer} /> : <AppraisalFormDialog org={org} contract={contract} appraisalCycle={cycle} answer={answer} />}
							</div>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
};
