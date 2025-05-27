'use client';

import React, { useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tables } from '@/type/database.types';
import { FileIcon, PanelLeftClose, X } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loader';
import { getGoalFileUrl } from '@/components/appraisal/appraisal.actions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface Props {
	employees: (Tables<'contracts'> & { profile: { first_name: string; last_name: string } })[];
	answers: Tables<'appraisal_answers'>[];
}

export const EmployeeObjectivesList: React.FC<Props> = ({ employees, answers }) => {
	const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
	const [isSheetOpen, setIsSheetOpen] = useState(false);
	const [isLoadingFile, setIsLoadingFile] = useState(false);

	const openSheet = (employeeId: string) => {
		setSelectedEmployeeId(employeeId);
		setIsSheetOpen(true);
	};

	const closeSheet = () => {
		setIsSheetOpen(false);
		setSelectedEmployeeId(null);
	};

	const getObjectiveStats = (answer: Tables<'appraisal_answers'> | undefined) => {
		const objectives = Array.isArray(answer?.objectives) ? (answer?.objectives as any[]) : [];
		const numObjectives = objectives.length;
		const numGoals = objectives.reduce((sum, obj) => sum + (Array.isArray(obj.goals) ? obj.goals.length : 0), 0);
		return { numObjectives, numGoals };
	};

	const getGoalProgress = (goals: any[], scores: any[]) => {
		if (!goals.length) return 0;

		const completed = goals.filter(goal => {
			const score = scores.find((s: any) => s.goal_id === goal.id);
			return !!score;
		}).length;

		return Math.round((completed / goals.length) * 100);
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
					variant="outline"
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
					{!score.filePath || !score.fileName ? <X size={12} className="text-destructive" /> : isLoadingFile ? <LoadingSpinner /> : <FileIcon size={12} />}
					<span className="text-xs">{score.fileName || 'No file attached'}</span>
				</Button>
			</div>
		);
	};

	return (
		<div className="mt-12 divide-y">
			{employees.map(employee => {
				const answer = answers.find(a => a.contract_id === employee.id);
				const { numObjectives, numGoals } = getObjectiveStats(answer);
				const objectives = Array.isArray(answer?.objectives) ? (answer?.objectives as any[]) : [];
				const allGoals = objectives.flatMap(obj => (Array.isArray(obj.goals) ? obj.goals : []));
				const employeeGoalScores = Array.isArray(answer?.employee_goal_score) ? (answer.employee_goal_score as any[]) : [];
				const managerGoalScores = Array.isArray(answer?.manager_goal_score) ? (answer.manager_goal_score as any[]) : [];
				const employeeProgress = getGoalProgress(allGoals, employeeGoalScores);
				const managerProgress = getGoalProgress(allGoals, managerGoalScores);

				return (
					<div key={employee.id} className="flex items-center justify-between">
						<div className="w-full px-2 py-6">
							<div className="text-sm font-medium">
								{employee.profile.first_name} {employee.profile.last_name}
							</div>
							<div className="text-xs text-muted-foreground">{employee.job_title}</div>
						</div>

						<div className="flex items-center justify-between gap-4">
							<div className="flex items-center gap-2 px-4">
								<span className="whitespace-nowrap text-xs text-muted-foreground">Employee {employeeProgress}%</span>
								<Progress value={employeeProgress} className="h-2 w-24" />
							</div>

							<div className="flex items-center gap-2 px-4">
								<span className="whitespace-nowrap text-xs text-muted-foreground">Manager {managerProgress}%</span>
								<Progress value={managerProgress} className="h-2 w-24" />
							</div>

							<div className="w-28 px-4 py-2 text-center text-sm">
								<span className="pr-1 text-xs text-muted-foreground">Objectives:</span> {numObjectives}
							</div>
							<div className="w-28 px-4 py-2 text-center text-sm">
								<span className="pr-1 text-xs text-muted-foreground">Goals:</span> {numGoals}
							</div>

							<div className="w-28 px-4 py-2">
								<Sheet open={isSheetOpen && selectedEmployeeId === employee.id.toString()} onOpenChange={open => (open ? openSheet(employee.id.toString()) : closeSheet())}>
									<SheetTrigger asChild>
										<Button variant="outline" size="sm">
											Review
											<PanelLeftClose size={14} className="ml-2" />
										</Button>
									</SheetTrigger>

									<SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
										<SheetHeader className="border-b pb-4">
											<SheetTitle>
												{employee.profile.first_name} {employee.profile.last_name}
											</SheetTitle>
											<SheetDescription>{employee.job_title}</SheetDescription>
										</SheetHeader>

										<div className="mt-10 space-y-8">
											{objectives.length === 0 && <div className="text-sm text-muted-foreground">No objectives found.</div>}
											{objectives.map((objective: any, index: number) => (
												<>
													<section key={objective.id}>
														<div className="space-y-8">
															<div className="mb-8">
																<h2 className="mb-1 text-xs font-light text-muted-foreground">objective {index + 1}:</h2>
																<h3 className="text-sm font-medium">{objective.title}</h3>
																<p className="mt-2 text-xs text-muted-foreground">{objective.description}</p>
															</div>

															<div className="space-y-8">
																{objective.goals.map((goal: any, index: number) => (
																	<div key={goal.id} className="space-y-6">
																		<div>
																			<h3 className="mb-1 text-xs font-light text-muted-foreground">goal {index + 1}:</h3>
																			<div className="flex items-center gap-2">
																				<h4 className="text-sm font-medium">{goal.title}</h4>
																			</div>
																			<p className="mt-2 text-xs text-muted-foreground">{goal.description}</p>
																		</div>
																		<div className="grid grid-cols-2 gap-6">
																			{renderGoalScore(goal.id, employeeGoalScores, 'Self Assessment')}
																			{renderGoalScore(goal.id, managerGoalScores, 'Manager Assessment')}
																		</div>
																	</div>
																))}
															</div>
														</div>
													</section>

													{index !== objectives.length - 1 && <Separator />}
												</>
											))}
										</div>
									</SheetContent>
								</Sheet>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
};
