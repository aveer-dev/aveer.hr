'use client';

import { getGoalFileUrl } from '@/components/appraisal/appraisal.actions';
import { Button, buttonVariants } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { LoadingSpinner } from '@/components/ui/loader';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { calculateAppraisalScore } from '@/lib/utils/calculate-appraisal-score';
import { cn } from '@/lib/utils/cn';
import { Tables } from '@/type/database.types';
import { format } from 'date-fns';
import { ArrowUpRight, ChevronDown, FileIcon, Info, PanelRightOpen, Plus, Settings, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatText } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Link from 'next/link';

const directScoreLabels = [
	{
		score: 1,
		label: 'Poor',
		description: 'The employee has performed poorly and needs to improve.'
	},
	{
		score: 2,
		label: 'Fair',
		description: 'The employee has performed fairly and needs to improve.'
	},
	{
		score: 3,
		label: 'Good',
		description: 'The employee has performed well and needs to improve.'
	},
	{
		score: 4,
		label: 'Very Good',
		description: 'The employee has performed very well and needs to improve.'
	},
	{
		score: 5,
		label: 'Excellent',
		description: 'The employee has performed exceptionally well and needs to improve.'
	}
];

export const AppraisalsHome = ({
	org,
	employees,
	answers,
	cycles,
	teams,
	questions
}: {
	org: string;
	employees: (Tables<'contracts'> & { profile: Tables<'profiles'> })[];
	answers: Tables<'appraisal_answers'>[];
	cycles: Tables<'appraisal_cycles'>[];
	teams: Tables<'teams'>[];
	questions: Tables<'template_questions'>[];
}) => {
	const [view, setView] = useState<'employees' | 'teams'>('employees');
	// sort by start date, sets the first four cycles to compare and user can select more cycles to compare or switch cycles being compared
	const [comparedCycles, setComparedCycles] = useState<Tables<'appraisal_cycles'>[]>(cycles.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()).slice(0, 4));
	const [comparedEmployees, setComparedEmployees] = useState<(Tables<'contracts'> & { profile: Tables<'profiles'> })[]>(employees.slice(0, 4));
	const [selectedEmployee, setSelectedEmployee] = useState<Tables<'contracts'> | null>(null);
	const [selectedTeam, setSelectedTeam] = useState<Tables<'teams'> | null>(null);
	const [selectedAnswer, setSelectedAnswer] = useState<Tables<'appraisal_answers'> | null>(null);
	const [isAppraisalSheetOpen, toggleAppraisalSheet] = useState(false);
	const [isLoadingFile, setIsLoadingFile] = useState(false);
	const [byQuestionActiveCycle, setByQuestionActiveCycle] = useState<Tables<'appraisal_cycles'> | null>(cycles[0]);
	const questionsGroups = questions
		.filter(q => q.template_id === byQuestionActiveCycle?.question_template)
		.map(q => formatText(q.group || 'Ungrouped'))
		.filter((group, index, self) => self.indexOf(group) === index);

	const openAppraisalSheet = (employee: Tables<'contracts'>, answer: Tables<'appraisal_answers'> | undefined) => {
		setSelectedEmployee(employee);
		setSelectedTeam(null);
		setSelectedAnswer(answer || null);

		toggleAppraisalSheet(true);
	};

	const renderGoalScore = (goalId: string, scores: any[], title: string) => {
		const score = scores.find((s: any) => s.goal_id === goalId);
		if (!score) return null;
		return (
			<div className="space-y-2">
				<h5 className="text-xs font-medium text-muted-foreground">{title}</h5>
				<div className="space-y-2 rounded-lg border bg-accent/50 p-4">
					<h6 className="text-sm font-medium">Score: {score.score}/5</h6>
					<p className={cn('text-xs text-muted-foreground', !score.comment ? 'italic' : '')}>{!score.comment || score.comment === '' ? 'No comment' : score.comment}</p>
				</div>

				<Button
					variant={!score.filePath || !score.fileName ? 'outline' : 'default'}
					className="flex h-8 w-full justify-start gap-1 text-left"
					disabled={!score.filePath || !score.fileName}
					onClick={async () => {
						if (!score.filePath || !score.fileName) return;

						try {
							setIsLoadingFile(true);
							const url = await getGoalFileUrl({ filePath: score.filePath });
							window.open(url, '_blank');
						} catch (error) {
							toast.error('Error getting file URL:', { description: (error as Error).message });
						} finally {
							setIsLoadingFile(false);
						}
					}}>
					<div className="flex flex-1 items-center gap-1">
						{!score.filePath || !score.fileName ? <X size={12} className="text-destructive" /> : isLoadingFile ? <LoadingSpinner /> : <FileIcon size={12} />}
						<span className="truncate text-xs">{score.fileName || 'No file attached'}</span>
					</div>
					{(score.filePath || score.fileName) && <ArrowUpRight size={12} className="text-muted-foreground" />}
				</Button>
			</div>
		);
	};

	return (
		<>
			<div className="flex items-center justify-between gap-4">
				<h1 className="text-2xl font-medium">Appraisals</h1>
			</div>

			<Tabs defaultValue="by-scores" className="space-y-10">
				<div className="flex items-center justify-between gap-4">
					<TabsList className="px-1.5">
						<TabsTrigger value="by-scores">By scores</TabsTrigger>
						<TabsTrigger value="by-questions">By questions</TabsTrigger>
					</TabsList>

					<Link href="./performance/config" className="group">
						<Button className="gap-3">
							<Settings size={12} className="group-hover:animate-short-spin" /> Settings
						</Button>
					</Link>
				</div>

				<TabsContent value="by-scores">
					<div className="space-y-8">
						<section className="space-y-6">
							<div className="flex items-center justify-normal gap-4">
								<Select value={view} onValueChange={value => setView(value as 'employees' | 'teams')}>
									<SelectTrigger className="flex h-[unset] w-fit items-center justify-normal gap-1 rounded-full border-none bg-transparent p-0 text-xs [&>svg]:hidden">
										<div className="rounded-s-full border border-input bg-input-bg px-3 py-2 text-xs text-muted-foreground">View</div>
										<div className="w-fit max-w-md overflow-hidden text-ellipsis whitespace-nowrap rounded-e-full border border-input bg-input-bg px-3 py-2 text-xs">
											<SelectValue placeholder="Select a view" />
										</div>
									</SelectTrigger>

									<SelectContent>
										<SelectItem value="employees">Employees</SelectItem>
										<SelectItem value="teams">Teams</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="flex items-center justify-between gap-4">
								<div className="w-full max-w-lg">
									<p className="pl-2 text-sm font-light capitalize text-muted-foreground">{view}</p>
								</div>

								<div className="flex w-full items-center gap-2">
									{comparedCycles.map((c, i) => (
										<div key={c.id} className="flex w-full items-center justify-between">
											<Select
												value={comparedCycles.find(cc => cc.id === c.id)?.id.toString()}
												onValueChange={value => {
													// on change, update this cycle with the new value; then check if the selected cycle is already in the compared cycles. If it is, replace it with the old value from this selected cycle at the same index.
													const selectedCycle = cycles.find(c => c.id === Number(value));
													if (selectedCycle) {
														setComparedCycles(prev => {
															const isInComparedCyclesIndex = prev.findIndex(cc => cc.id === selectedCycle.id);
															const newCompared = prev.map((cc, index) => (index === isInComparedCyclesIndex ? prev[i] : cc));
															const newComparedCycles = newCompared.map((cc, index) => (index === i ? selectedCycle : cc));
															return newComparedCycles;
														});
													}
												}}>
												<SelectTrigger className="flex h-8 w-full items-center justify-between rounded-md border-none bg-transparent px-2">
													<HoverCard openDelay={100}>
														<HoverCardTrigger>
															<p className="text-center text-sm font-light text-muted-foreground underline decoration-muted-foreground/50 decoration-dashed underline-offset-4">{c.name}</p>
														</HoverCardTrigger>
														<HoverCardContent className="w-full min-w-[170px] bg-primary py-2 text-primary-foreground" alignOffset={-10} align="start">
															<p className="mb-2 text-sm">{c.name}</p>
															<p className="text-xs">From: {format(c.start_date, 'MMM d, yyyy')}</p>
															<p className="text-xs">To: {format(c.end_date, 'MMM d, yyyy')}</p>
														</HoverCardContent>
													</HoverCard>
												</SelectTrigger>

												<SelectContent align="end" side="bottom">
													{cycles.map(c => (
														<SelectItem key={c.id} value={c.id.toString()}>
															{c.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									))}
								</div>
							</div>

							<div className="space-y-4">
								{view === 'employees' &&
									employees.map(employee => (
										<div key={employee.id} className="flex items-stretch justify-between gap-4">
											<div className="flex min-h-20 w-full max-w-lg flex-col justify-center rounded-md bg-muted/70 p-2 pl-4">
												<p className="text-sm font-medium">
													{employee.profile?.first_name} {employee.profile?.last_name}
												</p>

												<p className="text-sm text-muted-foreground">{employee.job_title}</p>
											</div>

											<div className="flex w-full gap-2">
												{comparedCycles.map(cycle => {
													const answer = answers?.filter(a => a.appraisal_cycle_id === cycle.id).find(a => a.contract_id === employee.id);
													const directScoreLabel = directScoreLabels.find(label => (answer?.direct_score as unknown as { score: number })?.score === label.score);
													const score =
														cycle.type === 'direct_score'
															? directScoreLabels.find(label => (answer?.direct_score as unknown as { score: number })?.score === label.score)?.label
															: calculateAppraisalScore({
																	answer,
																	isSubmitted: !!answer?.employee_submission_date,
																	isManagerReviewed: !!answer?.manager_submission_date
																})?.finalScore;
													const managerScore =
														cycle.type === 'direct_score'
															? directScoreLabels.find(label => (answer?.manager_direct_score as unknown as { score: number })?.score === label.score)?.label
															: calculateAppraisalScore({
																	answer,
																	isSubmitted: !!answer?.employee_submission_date,
																	isManagerReviewed: !!answer?.manager_submission_date
																})?.finalScore;

													return (
														<div key={cycle.id} className="w-full min-w-24 rounded-xl bg-muted p-2 text-center">
															{score && (
																<div className="flex justify-end rounded-md bg-background p-2">
																	<button onClick={() => openAppraisalSheet(employee, answer)} className="bg-transparent text-primary transition-all">
																		<PanelRightOpen size={12} />
																	</button>
																</div>
															)}

															{cycle.type === 'objectives_goals_accessment' && (
																<div className="flex min-h-20 items-center justify-evenly">
																	<div className="text-sm text-support">{score || <span className="text-muted-foreground opacity-30">No score</span>}</div>
																</div>
															)}

															{cycle.type === 'direct_score' && (
																<div className="my-2 flex h-full w-full flex-col space-y-2">
																	{score ? (
																		<div className="w-full rounded-md py-1 text-center text-xs transition-all duration-300">
																			<span className="font-light text-muted-foreground">Self review: </span>
																			{score}
																		</div>
																	) : (
																		<span className="text-xs text-muted-foreground opacity-50">N/A</span>
																	)}

																	<Separator />

																	{managerScore ? (
																		<div className="w-full rounded-md py-1 text-center text-xs transition-all duration-300">
																			<span className="font-light text-muted-foreground">Manager review: </span>
																			{managerScore}
																		</div>
																	) : (
																		<span className="text-xs text-muted-foreground opacity-50">N/A</span>
																	)}
																</div>
															)}
														</div>
													);
												})}
											</div>
										</div>
									))}
								{view === 'teams' &&
									teams.map(team => (
										<div key={team.id} className="flex items-center justify-between gap-4">
											<div className="flex min-h-20 w-full max-w-lg flex-col justify-center rounded-md bg-muted/70 pl-4">
												<p className="text-sm font-medium">{team.name}</p>

												<p className="text-sm text-muted-foreground">{team.description}</p>
											</div>

											<div className="flex w-full gap-2">
												{comparedCycles.map(cycle => {
													const teamMembersMap: Record<number, typeof employees> = {};
													employees.forEach(employee => {
														if (employee.team) {
															if (!teamMembersMap[employee.team]) teamMembersMap[employee.team] = [];
															teamMembersMap[employee.team].push(employee);
														}
													});

													// Aggregate team score
													const members = teamMembersMap[team.id] || [];
													const memberScores = members
														.map(employee => {
															const answer = answers?.filter(a => a.appraisal_cycle_id === cycle.id).find(a => a.contract_id === employee.id);
															const score = calculateAppraisalScore({
																answer,
																isSubmitted: !!answer?.employee_submission_date,
																isManagerReviewed: !!answer?.manager_submission_date
															});
															return score?.finalScore;
														})
														.filter((score): score is number => typeof score === 'number');
													const aggregateScore = memberScores.length > 0 ? Math.round(memberScores.reduce((a, b) => a + b, 0) / memberScores.length) : undefined;
													const directScoreAggregate = members
														.map(employee => {
															const answer = answers?.filter(a => a.appraisal_cycle_id === cycle.id).find(a => a.contract_id === employee.id);
															const directScore = answer?.direct_score as unknown as { score: number };
															return directScore?.score;
														})
														.filter((score): score is number => typeof score === 'number');

													return (
														<div key={cycle.id} className="flex min-h-20 w-full min-w-24 items-center justify-evenly rounded-md bg-muted px-4 text-center text-sm">
															<div className="flex items-center justify-center">
																{cycle.type === 'objectives_goals_accessment' ? (
																	aggregateScore || <span className="text-muted-foreground opacity-30">No score</span>
																) : directScoreAggregate.length > 0 ? (
																	<div className="flex items-center justify-center gap-2">
																		{Math.round(directScoreAggregate.reduce((a, b) => a + b, 0) / directScoreAggregate.length)}
																		<span className="text-muted-foreground"> / {directScoreAggregate.length * 5}</span>
																	</div>
																) : (
																	<span className="text-muted-foreground opacity-30">No score</span>
																)}
															</div>
														</div>
													);
												})}
											</div>
										</div>
									))}
							</div>
						</section>

						<Sheet open={isAppraisalSheetOpen} onOpenChange={state => toggleAppraisalSheet(state)}>
							<SheetContent onOpenAutoFocus={e => e.preventDefault()} className={cn('w-full overflow-y-auto pb-16', cycles.find(cycle => cycle.id === selectedAnswer?.appraisal_cycle_id)?.type === 'direct_score' ? 'sm:max-w-lg' : 'sm:max-w-3xl')}>
								<SheetHeader>
									<SheetTitle>Employee Appraisal Details</SheetTitle>
									<SheetDescription>Appraisal details for the selected employee</SheetDescription>
								</SheetHeader>

								<div className="mt-10 space-y-16">
									{cycles.find(cycle => cycle.id === selectedAnswer?.appraisal_cycle_id)?.type === 'objectives_goals_accessment' && selectedAnswer && (
										<>
											{selectedAnswer?.objectives?.length === 0 && <div className="text-sm text-muted-foreground">No objectives found.</div>}
											{selectedAnswer?.objectives?.map((objective: any, index: number) => (
												<section key={objective.id}>
													<h2 className="mb-6 border-b pb-4 text-base font-medium">Objective {index + 1}</h2>

													<div className="space-y-8">
														<div className="space-y-6">
															<li className="flex gap-2 text-sm font-normal">
																<div className="min-w-28">Title:</div>
																<div className="text-sm leading-6 text-muted-foreground">{objective.title}</div>
															</li>

															{objective.description && (
																<li className="flex gap-2 text-sm">
																	<div className="min-w-28">Description:</div>
																	<div className="text-sm leading-relaxed text-muted-foreground">{objective.description}</div>
																</li>
															)}

															<li className="flex gap-2 text-sm">
																<div className="min-w-28">Goals:</div>

																<div>
																	{objective.goals.map((goal: any, index: number) => (
																		<div key={goal.id} className="space-y-6 border-b pb-8 pt-8 first:pt-0 last:border-b-0 last:pb-0">
																			<div>
																				<h4 className="text-sm font-normal">
																					{index + 1}: {goal.title}
																				</h4>
																				{goal.description && <p className="mt-2 text-xs text-muted-foreground">{goal.description}</p>}
																			</div>
																			<div className="grid grid-cols-2 gap-6">
																				{renderGoalScore(goal.id, selectedAnswer?.employee_goal_score || [], 'Self Assessment')}
																				{renderGoalScore(goal.id, selectedAnswer?.manager_goal_score || [], 'Manager Assessment')}
																			</div>
																		</div>
																	))}
																</div>
															</li>
														</div>
													</div>
												</section>
											))}
										</>
									)}

									{cycles.find(cycle => cycle.id === selectedAnswer?.appraisal_cycle_id)?.type === 'direct_score' && selectedAnswer && (
										<section className="space-y-6">
											{['direct_score', 'manager_direct_score'].map(type => (
												<div className="space-y-6 rounded-md bg-muted/70 p-4" key={type}>
													<div className="space-y-2">
														<h4 className="text-sm font-light text-muted-foreground">{type === 'direct_score' ? 'Self Assessment' : 'Manager Assessment'}</h4>

														<div className="flex min-h-20 w-full max-w-lg gap-4">
															{directScoreLabels.map(label => (
																<div key={label.score} className="flex flex-col items-center justify-center gap-2">
																	<div
																		className={cn(
																			buttonVariants({ variant: 'outline', size: 'icon' }),
																			'h-16 w-16 hover:bg-background',
																			(selectedAnswer[type as keyof typeof selectedAnswer] as unknown as { score: number })?.score === label.score ? 'border border-green-400 bg-green-100 hover:bg-green-100' : ''
																		)}>
																		{label.score}
																	</div>

																	<div className="flex items-center gap-2">
																		<div className="text-xs text-support">{label.label}</div>
																		{label.description && (
																			<Tooltip>
																				<TooltipTrigger>
																					<Info size={12} className="text-muted-foreground" />
																				</TooltipTrigger>
																				<TooltipContent>
																					<div className="max-w-64 text-xs">{label.description}</div>
																				</TooltipContent>
																			</Tooltip>
																		)}
																	</div>
																</div>
															))}
														</div>
													</div>

													<div className="space-y-2">
														<h4 className="text-sm font-light text-muted-foreground">Comment</h4>

														<div className="min-h-20 rounded-md border bg-background p-2 text-xs leading-relaxed text-muted-foreground">
															{(selectedAnswer[type as keyof typeof selectedAnswer] as unknown as { comment: string })?.comment || <span className="text-muted-foreground opacity-30">No comment</span>}
														</div>
													</div>
												</div>
											))}
										</section>
									)}
								</div>
							</SheetContent>
						</Sheet>
					</div>
				</TabsContent>

				<TabsContent value="by-questions">
					<div className="flex items-center justify-normal gap-4">
						<Select value={'employees'} onValueChange={value => setView(value as 'employees' | 'teams')}>
							<SelectTrigger className="flex h-[unset] w-fit items-center justify-normal gap-1 rounded-full border-none bg-transparent p-0 text-xs [&>svg]:hidden">
								<div className="rounded-s-full border border-input bg-input-bg px-3 py-2 text-xs text-muted-foreground">View</div>
								<div className="w-fit max-w-md overflow-hidden text-ellipsis whitespace-nowrap rounded-e-full border border-input bg-input-bg px-3 py-2 text-xs">
									<SelectValue placeholder="Select a view" />
								</div>
							</SelectTrigger>

							<SelectContent>
								<SelectItem value="employees">Employees</SelectItem>
								{/* <SelectItem value="teams">Teams</SelectItem> */}
							</SelectContent>
						</Select>

						<Separator orientation="vertical" className="h-6" />

						<Select value={byQuestionActiveCycle?.id.toString()} onValueChange={value => setByQuestionActiveCycle(cycles.find(c => c.id === Number(value)) || cycles[0])}>
							<SelectTrigger className="flex h-[unset] w-fit items-center justify-normal gap-1 rounded-full border-none bg-transparent p-0 text-xs [&>svg]:hidden">
								<div className="rounded-s-full border border-input bg-input-bg px-3 py-2 text-xs text-muted-foreground">Cycle</div>
								<div className="w-fit max-w-md overflow-hidden text-ellipsis whitespace-nowrap rounded-e-full border border-input bg-input-bg px-3 py-2 text-xs">
									<SelectValue placeholder="Select a view" />
								</div>
							</SelectTrigger>

							<SelectContent>
								{cycles.map(c => (
									<SelectItem key={c.id} value={c.id.toString()}>
										{c.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="mt-10 flex items-center justify-between gap-4">
						<div className="w-full max-w-lg"></div>

						<div className="flex w-full items-center gap-2">
							{comparedEmployees.map((c, i) => (
								<div key={c.id} className="flex w-full items-center justify-between">
									<Select
										value={comparedEmployees.find(cc => cc.id === c.id)?.id.toString()}
										onValueChange={value => {
											// on change, update this cycle with the new value; then check if the selected cycle is already in the compared cycles. If it is, replace it with the old value from this selected cycle at the same index.
											const selectedEmployee = employees.find(c => c.id === Number(value));
											if (selectedEmployee) {
												setComparedEmployees(prev => {
													const isInComparedEmployeesIndex = prev.findIndex(cc => cc.id === selectedEmployee.id);
													const newCompared = prev.map((cc, index) => (index === isInComparedEmployeesIndex ? prev[i] : cc));
													const newComparedEmployees = newCompared.map((cc, index) => (index === i ? selectedEmployee : cc));
													return newComparedEmployees;
												});
											}
										}}>
										<SelectTrigger className="flex h-8 w-full items-center justify-between rounded-md border-none bg-transparent px-2">
											<HoverCard openDelay={100}>
												<HoverCardTrigger className="max-w-[120px] overflow-hidden text-ellipsis text-nowrap text-center text-sm font-light text-muted-foreground underline decoration-muted-foreground/50 decoration-dashed underline-offset-4">
													{c.profile?.first_name} {c.profile?.last_name}
												</HoverCardTrigger>

												<HoverCardContent className="w-full min-w-[170px] bg-primary py-2 text-left text-primary-foreground" alignOffset={-10} align="start">
													<p className="mb-2 text-sm">
														{c.profile?.first_name} {c.profile?.last_name}
													</p>
													<p className="text-xs">{c.job_title}</p>
												</HoverCardContent>
											</HoverCard>
										</SelectTrigger>

										<SelectContent align="end" side="bottom">
											{employees.map(e => (
												<SelectItem key={e.id} value={e.id.toString()}>
													{e.profile?.first_name} {e.profile?.last_name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							))}
						</div>
					</div>

					<div className="mt-2">
						{questionsGroups.map(group => (
							<section key={group} className="mb-6 space-y-2">
								<h4 className="pl-2 text-xs font-light text-muted-foreground">{group}</h4>

								<div className="space-y-4">
									{questions
										.filter(q => q.template_id === byQuestionActiveCycle?.question_template && formatText(q.group) === group)
										.map(q => (
											<div key={q.id} className="flex items-stretch justify-between gap-4">
												<div className="flex min-h-16 w-full max-w-lg flex-col justify-center rounded-md bg-muted/70 px-4 py-4">
													<p className="text-sm leading-6 text-support">{q.question}</p>
												</div>

												<div className="flex w-full gap-2">
													{comparedEmployees.map(employee => {
														const answer = answers?.filter(a => a.appraisal_cycle_id === byQuestionActiveCycle?.id).find(a => a.contract_id === employee.id);
														const processedScore = (type: 'self' | 'manager' = 'self') => {
															const ans = answer?.[type === 'self' ? 'answers' : 'manager_answers'] as { question_id: number; answer: string }[];
															const score = ans?.find(a => a.question_id === q.id)?.answer;
															if (!score) return '';

															if (q.type === 'scale') {
																const scaleLabels = Array.isArray(q.scale_labels) ? q.scale_labels : [];
																const labelObj = scaleLabels[Number(score) - 1];
																const isObj = labelObj && typeof labelObj === 'object' && !Array.isArray(labelObj);
																const label = isObj && typeof labelObj.label === 'string' && labelObj.label;
																return label || score;
															}

															if (q.type === 'yesno') {
																return score === 'yes' ? 'Yes' : score === 'no' ? 'No' : score;
															}

															if (q.type === 'multiselect') {
																return (
																	score
																		.split(',')
																		.map(s => formatText(s))
																		.join(', ') || score
																);
															}

															return score;
														};
														const score = processedScore();
														const managerScore = processedScore('manager');

														return <ScoreCell key={employee.id} score={score} managerScore={managerScore} employee={employee} q={q} openAppraisalSheet={openAppraisalSheet} answer={answer} />;
													})}
												</div>
											</div>
										))}
								</div>
							</section>
						))}
					</div>
				</TabsContent>
			</Tabs>
		</>
	);
};

const ScoreCell = ({
	score,
	managerScore,
	employee,
	q,
	openAppraisalSheet,
	answer
}: {
	score: string;
	managerScore: string;
	employee: Tables<'contracts'> & { profile: Tables<'profiles'> };
	q: Tables<'template_questions'>;
	openAppraisalSheet: (employee: Tables<'contracts'>, answer: Tables<'appraisal_answers'> | undefined) => void;
	answer: Tables<'appraisal_answers'> | undefined;
}) => {
	return (
		<div key={employee.id} className="relative flex min-h-16 w-full min-w-24 flex-col items-center justify-between rounded-xl bg-muted p-1 text-center">
			{score && (
				<div className="flex w-full items-center justify-between rounded-md bg-background px-2 py-1">
					{/* div container added here to the space even if conditions of it children remains false */}
					<div>
						{(q.type === 'scale' || q.type === 'yesno') && (
							<Tooltip>
								<TooltipTrigger type="button" className="">
									<Info size={12} className="text-muted-foreground" />
								</TooltipTrigger>
								<TooltipContent className="text-left">
									{q.type === 'scale' && (
										<>
											<p className="text-xs">This is an answer to a scale of 1-5 question</p>
											<ul className="mt-2 flex gap-1">
												{(q.scale_labels as { label: string; description: string }[])?.map((label: any, index: number) => (
													<li key={index} className="rounded-sm bg-muted px-2 py-1 text-xs">
														{index + 1}. {label.label}
													</li>
												))}
											</ul>
										</>
									)}

									{q.type === 'yesno' && (
										<>
											<p className="text-xs">This is an answer to a yes/no question</p>
										</>
									)}
								</TooltipContent>
							</Tooltip>
						)}
					</div>

					<Button size={'icon'} onClick={() => openAppraisalSheet(employee, answer)} className="h-4 w-4 bg-transparent text-primary hover:bg-transparent">
						<PanelRightOpen size={12} />
					</Button>
				</div>
			)}

			<div className="my-2 flex h-full w-full flex-col justify-between space-y-2">
				{score ? (
					<HoverCard>
						<HoverCardTrigger>
							<div className="flex w-full flex-1 cursor-pointer items-center justify-center rounded-md py-1 transition-all duration-300 hover:bg-background">
								<div className="line-clamp-2 max-w-36 overflow-hidden text-ellipsis text-left text-xs">{score}</div>
							</div>
						</HoverCardTrigger>

						<HoverCardContent className="w-full max-w-xs py-2 text-left" alignOffset={-10} align="start">
							<h4 className="mb-2 text-sm font-normal">{employee.profile?.first_name}&apos;s Self Assessment</h4>
							<p className="text-xs text-support">{score}</p>
						</HoverCardContent>
					</HoverCard>
				) : (
					<span className="text-xs text-muted-foreground opacity-50">N/A</span>
				)}

				<Separator />

				{managerScore ? (
					<HoverCard>
						<HoverCardTrigger>
							<div className="flex w-full flex-1 cursor-pointer items-center justify-center rounded-md py-1 transition-all duration-300 hover:bg-background">
								<div className="line-clamp-2 max-w-36 overflow-hidden text-ellipsis text-left text-xs">{managerScore || <span className="text-muted-foreground opacity-50">N/A</span>}</div>
							</div>
						</HoverCardTrigger>

						<HoverCardContent className="w-full max-w-xs py-2 text-left" alignOffset={-10} align="start">
							<h4 className="mb-2 text-sm font-normal">{employee.profile?.first_name}&apos;s Manager Assessment</h4>
							<p className="text-xs text-support">{managerScore}</p>
						</HoverCardContent>
					</HoverCard>
				) : (
					<span className="text-xs text-muted-foreground opacity-50">N/A</span>
				)}
			</div>
		</div>
	);
};
