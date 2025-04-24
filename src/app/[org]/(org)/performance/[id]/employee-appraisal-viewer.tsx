'use client';

import { Tables } from '@/type/database.types';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { AnswerDisplay } from '@/components/appraisal/assessment-indicators';
import { FileIcon, Link2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type ContractWithProfile = Tables<'contracts'> & {
	profile: Pick<Tables<'profiles'>, 'first_name' | 'last_name'>;
};

interface Goal {
	id: string;
	title: string;
	description: string;
	status: string;
}

interface Objective {
	id: string;
	title: string;
	description: string;
	goals: Goal[];
}

interface GoalScore {
	goal_id: string;
	score: number;
	comment: string;
	file_name?: string;
	file_path?: string;
}

interface Answer {
	question_id: number;
	answer: any;
}

interface Props {
	employees: ContractWithProfile[];
	answers: Tables<'appraisal_answers'>[];
	questions: Tables<'template_questions'>[];
	appraisalCycle: Tables<'appraisal_cycles'>;
}

export function EmployeeAppraisalViewer({ employees, answers, questions, appraisalCycle }: Props) {
	const [selectedEmployee, setSelectedEmployee] = useState<string>(employees[0]?.id.toString() || '');

	const currentEmployee = employees.find(e => e.id.toString() === selectedEmployee);
	const employeeAnswer = answers.find(a => a.contract_id === currentEmployee?.id);

	// Safely cast the answers to the correct type
	const selfAnswers = Array.isArray(employeeAnswer?.answers) ? (employeeAnswer.answers as unknown as Answer[]) : [];
	const managerAnswers = Array.isArray(employeeAnswer?.manager_answers) ? (employeeAnswer.manager_answers as unknown as Answer[]) : [];
	const objectives = Array.isArray(employeeAnswer?.objectives) ? (employeeAnswer.objectives as unknown as Objective[]) : [];
	const employeeGoalScores = Array.isArray(employeeAnswer?.employee_goal_score) ? (employeeAnswer.employee_goal_score as unknown as GoalScore[]) : [];
	const managerGoalScores = Array.isArray(employeeAnswer?.manager_goal_score) ? (employeeAnswer.manager_goal_score as unknown as GoalScore[]) : [];

	// Group questions by their type
	const groupedQuestions = questions.reduce(
		(acc, question) => {
			if (!acc[question.group]) {
				acc[question.group] = [];
			}
			acc[question.group].push(question);
			return acc;
		},
		{} as Record<string, Tables<'template_questions'>[]>
	);

	if (!currentEmployee) {
		return <div>No employees found</div>;
	}

	const renderGoalScore = (goalId: string, scores: GoalScore[], title: string) => {
		const score = scores.find(s => s.goal_id === goalId);
		if (!score) return null;

		return (
			<div className="space-y-2">
				<h5 className="text-xs font-medium text-muted-foreground">{title}</h5>

				<div className="space-y-2 rounded-lg border bg-accent/50 p-4">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium">Score: {score.score}/5</span>
						{score.file_path && (
							<Button variant="ghost" size="sm" className="h-6 gap-1" asChild>
								<a href={score.file_path} target="_blank" rel="noopener noreferrer">
									<FileIcon size={12} />
									{score.file_name}
								</a>
							</Button>
						)}
					</div>

					{score.comment && <p className="text-xs text-muted-foreground">{score.comment}</p>}
				</div>
			</div>
		);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold"></h2>

				<Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
					<SelectTrigger className="w-[250px]">
						<SelectValue placeholder="Select an employee" />
					</SelectTrigger>
					<SelectContent>
						{employees.map(employee => (
							<SelectItem key={employee.id} value={employee.id.toString()}>
								{employee.profile.first_name} {employee.profile.last_name} - {employee.job_title}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="rounded-lg border bg-card">
				<div className="p-4 text-sm text-muted-foreground">
					<div className="flex justify-between">
						<div className="space-y-4">
							<p>
								Employee: {currentEmployee.profile.first_name} {currentEmployee.profile.last_name}
							</p>
							<p>Position: {currentEmployee.job_title}</p>
						</div>

						{employeeAnswer && (
							<div className="space-y-4 text-right">
								<p>Self Review: {employeeAnswer.employee_submission_date ? format(new Date(employeeAnswer.employee_submission_date), 'MMM d, yyyy') : 'Not submitted'}</p>
								<p>Manager Review: {employeeAnswer.manager_submission_date ? format(new Date(employeeAnswer.manager_submission_date), 'MMM d, yyyy') : 'Not submitted'}</p>
							</div>
						)}
					</div>
				</div>
			</div>

			{objectives.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Objectives & Goals</CardTitle>
					</CardHeader>

					<CardContent className="space-y-8">
						{objectives.map((objective, index) => (
							<div key={objective.id} className="space-y-6">
								{index > 0 && <Separator />}
								<div className="mb-8">
									<h2 className="mb-1 text-xs font-light text-muted-foreground">objective:</h2>
									<h3 className="text-sm font-medium">{objective.title}</h3>
									<p className="mt-2 text-xs text-muted-foreground">{objective.description}</p>
								</div>

								<div className="space-y-8">
									{objective.goals.map(goal => (
										<div key={goal.id} className="ml-4 space-y-6">
											<div>
												<h3 className="mb-1 text-xs font-light text-muted-foreground">goal:</h3>

												<div className="flex items-center gap-2">
													<h4 className="text-sm font-medium">{goal.title}</h4>
													{goal.status && (
														<Badge variant="outline" className="text-[10px]">
															{goal.status}
														</Badge>
													)}
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
						))}
					</CardContent>
				</Card>
			)}

			<div className="space-y-8">
				{Object.entries(groupedQuestions).map(([group, groupQuestions]) => (
					<Card key={group}>
						<CardHeader>
							<CardTitle className="text-base capitalize">{group.replace(/_/g, ' ')}</CardTitle>
						</CardHeader>

						<CardContent className="space-y-6">
							{groupQuestions.map((question, index) => {
								const selfAnswer = selfAnswers.find(a => a.question_id === question.id)?.answer;
								const managerAnswer = managerAnswers.find(a => a.question_id === question.id)?.answer;

								return (
									<div key={question.id}>
										{index > 0 && <Separator className="my-6" />}
										<div className="space-y-6">
											{question.question && question.group !== 'private_manager_assessment' && (
												<div className="space-y-2">
													<h4 className="text-sm font-medium">Self Assessment</h4>
													<div className="space-y-4 rounded-lg border bg-accent/50 p-4">
														<p className="mb-2 text-xs font-medium">
															<span className="text-muted-foreground">Question:</span> {question.question}
														</p>

														<AnswerDisplay question={question} answer={selfAnswer} />
													</div>
												</div>
											)}

											{question.manager_question && (
												<div className="space-y-2">
													{question.group !== 'private_manager_assessment' && <h4 className="text-sm font-medium">Manager Assessment</h4>}
													<div className="space-y-4 rounded-lg border bg-accent/50 p-4">
														<p className="mb-2 text-xs font-medium">
															<span className="text-muted-foreground">Question:</span> {question.manager_question}
														</p>
														<AnswerDisplay question={question} answer={managerAnswer} />
													</div>
												</div>
											)}
										</div>
									</div>
								);
							})}
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
