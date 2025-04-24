import { createClient } from '@/utils/supabase/server';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tables } from '@/type/database.types';
import { AppraisalReviewDialog } from './appraisal-review-dialog';
import { AppraisalFormDialog } from './appraisal-form-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Info } from 'lucide-react';
import { Separator } from '../ui/separator';
import { getTeamAppraisalAnswers } from './appraisal.actions';
interface Props {
	org: string;
	contract: Tables<'contracts'>;
}

export const EmployeeAppraisalList = async ({ org, contract }: Props) => {
	const supabase = await createClient();

	// Get appraisal cycles where employee's contract start date is before appraisal start date
	const { data: appraisalCycles } = await supabase
		.from('appraisal_cycles')
		.select('*')
		.eq('org', org)
		.gte('start_date', contract.start_date || new Date().toISOString())
		.order('start_date', { ascending: false });

	if (!appraisalCycles || appraisalCycles.length === 0) {
		return (
			<div className="flex h-56 items-center justify-center rounded-md bg-accent text-xs text-muted-foreground">
				<p>No appraisal cycles available.</p>
			</div>
		);
	}

	// Get appraisal answers for all cycles
	const [{ data: teamMembers }, { data: manager }, { data: appraisalAnswers }, { data: teams }] = await Promise.all([
		supabase
			.from('contracts')
			.select('*, profile:profiles!contracts_profile_fkey(first_name, last_name)')
			.match({
				org,
				team: (contract?.team as any)?.id || contract?.team,
				status: 'signed'
			}),
		supabase.from('managers').select('*').eq('org', org).eq('person', contract.id).single(),
		supabase
			.from('appraisal_answers')
			.select('*')
			.eq('org', org)
			.eq('contract_id', contract.id)
			.in(
				'appraisal_cycle_id',
				appraisalCycles.map(cycle => cycle.id)
			),
		supabase.from('teams').select('*').match({ org })
	]);

	return (
		<div className="space-y-12">
			{/* Active Appraisals Section */}
			{appraisalCycles.some(cycle => new Date(cycle.start_date) <= new Date() && new Date(cycle.end_date) >= new Date()) && (
				<div className="space-y-4">
					{appraisalCycles
						.filter(cycle => new Date(cycle.start_date) <= new Date() && new Date(cycle.end_date) >= new Date())
						.map(cycle => {
							const answer = appraisalAnswers?.find(a => a.appraisal_cycle_id === cycle.id);
							const isSubmitted = !!answer?.employee_submission_date;
							const isManagerReviewed = !!answer?.manager_submission_date;
							const isActive = new Date(cycle.start_date) <= new Date() && new Date(cycle.end_date) >= new Date();

							return (
								<Card key={cycle.id} className="w-full">
									<CardHeader className="p-4">
										<div className="flex items-center justify-between">
											<div className="space-y-1">
												<CardTitle className="text-base font-medium">{cycle.name}</CardTitle>
												<CardDescription className="text-xs">
													{format(new Date(cycle.start_date), 'MMM d, yyyy')} - {format(new Date(cycle.end_date), 'MMM d, yyyy')}
												</CardDescription>
											</div>
											<div className="flex items-center gap-2">
												{isActive && <Badge variant="outline">Active</Badge>}
												<Badge variant={isManagerReviewed ? 'default' : isSubmitted ? 'secondary' : 'outline'}>{isManagerReviewed ? 'Reviewed' : isSubmitted ? 'Submitted' : 'In Progress'}</Badge>
											</div>
										</div>
									</CardHeader>

									<CardContent className="p-4 pt-0">
										<div className="flex items-center justify-between text-xs text-muted-foreground">
											<div className="space-y-1">
												<p>Self Review Due: {format(new Date(cycle.self_review_due_date), 'MMM d, yyyy')}</p>
												<p>Manager Review Due: {format(new Date(cycle.manager_review_due_date), 'MMM d, yyyy')}</p>
											</div>

											{/* <AppraisalReviewDialog org={org} contract={contract} appraisalCycle={cycle} answer={answer} /> */}

											<div className="flex items-center gap-2">
												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger asChild>
															<Info size={14} className="text-muted-foreground" />
														</TooltipTrigger>

														<TooltipContent>
															<p className="max-w-40">You can update your answers until the self review due date.</p>
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>

												<AppraisalFormDialog teams={teams} org={org} contract={contract} appraisalCycle={cycle} contractAnswer={answer} isManager={!!manager} teamMembers={teamMembers} manager={manager} />
											</div>
										</div>
									</CardContent>
								</Card>
							);
						})}
				</div>
			)}

			{/* Past Appraisals Section */}
			{appraisalCycles.some(cycle => new Date(cycle.end_date) < new Date()) && (
				<div className="space-y-4">
					<div className="flex items-center justify-between gap-2">
						<h3 className="w-fit text-sm font-medium text-muted-foreground">Past Appraisals</h3>
						<Separator className="w-full max-w-xl" />
					</div>

					{appraisalCycles
						.filter(cycle => new Date(cycle.end_date) < new Date())
						.map(cycle => {
							const answer = appraisalAnswers?.find(a => a.appraisal_cycle_id === cycle.id);
							const isSubmitted = !!answer?.employee_submission_date;
							const isManagerReviewed = !!answer?.manager_submission_date;
							const isPast = new Date(cycle.end_date) < new Date();

							return (
								<Card key={cycle.id} className="w-full">
									<CardHeader className="p-4">
										<div className="flex items-center justify-between">
											<div>
												<CardTitle className="text-base font-medium">{cycle.name}</CardTitle>
												<CardDescription className="text-xs">
													{format(new Date(cycle.start_date), 'MMM d, yyyy')} - {format(new Date(cycle.end_date), 'MMM d, yyyy')}
												</CardDescription>
											</div>
											<div className="flex items-center gap-2">
												{isPast && <Badge variant="secondary">Past</Badge>}
												{!isPast && <Badge variant={isManagerReviewed ? 'default' : isSubmitted ? 'secondary' : 'outline'}>{isManagerReviewed ? 'Reviewed' : isSubmitted ? 'Submitted' : 'In Progress'}</Badge>}
											</div>
										</div>
									</CardHeader>

									<CardContent className="p-4 pt-0">
										<div className="flex items-center justify-between text-xs text-muted-foreground">
											<div>
												<p>Self Review Due: {format(new Date(cycle.self_review_due_date), 'MMM d, yyyy')}</p>
												<p>Manager Review Due: {format(new Date(cycle.manager_review_due_date), 'MMM d, yyyy')}</p>
											</div>

											{isManagerReviewed ? (
												<AppraisalReviewDialog org={org} contract={contract} appraisalCycle={cycle} answer={answer} />
											) : (
												<div className="flex items-center gap-2">
													<TooltipProvider>
														<Tooltip>
															<TooltipTrigger asChild>
																<Info size={14} className="text-muted-foreground" />
															</TooltipTrigger>

															<TooltipContent>
																<p className="max-w-40">This appraisal cycle has ended. You can only view your previous answers, if you have any.</p>
															</TooltipContent>
														</Tooltip>
													</TooltipProvider>

													<AppraisalFormDialog teams={teams} org={org} contract={contract} appraisalCycle={cycle} contractAnswer={answer} isManager={!!manager} teamMembers={teamMembers} manager={manager} />
												</div>
											)}
										</div>
									</CardContent>
								</Card>
							);
						})}
				</div>
			)}
		</div>
	);
};
