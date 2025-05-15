'use client';

import { Tables } from '@/type/database.types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { AnswerDisplay } from '@/components/appraisal/assessment-indicators';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

type AppraisalAnswer = Tables<'appraisal_answers'>;
type Contract = Tables<'contracts'>;
type TemplateQuestion = Tables<'template_questions'>;

interface ManagerAssessmentAggregateProps {
	employees: (Contract & { profile: { first_name: string; last_name: string } })[];
	answers: AppraisalAnswer[];
	questions: TemplateQuestion[];
}

interface ScaleDistribution {
	scale: number;
	count: number;
	percentage: number;
}

interface YesNoDistribution {
	answer: 'yes' | 'no';
	count: number;
	percentage: number;
}

interface QuestionDistribution {
	question: TemplateQuestion;
	type: 'scale' | 'yesno';
	distribution: ScaleDistribution[] | YesNoDistribution[];
}

type ScaleQuestionDistribution = {
	question: TemplateQuestion;
	type: 'scale';
	distribution: ScaleDistribution[];
};

type YesNoQuestionDistribution = {
	question: TemplateQuestion;
	type: 'yesno';
	distribution: YesNoDistribution[];
};

function MultiScaleProgressBar({ distribution, scaleLabels }: { distribution: ScaleDistribution[]; scaleLabels?: { label?: string; description?: string }[] }) {
	return (
		<div className="relative h-4 w-full overflow-hidden rounded-full bg-secondary">
			{distribution.map(({ scale, percentage }) => (
				<div
					key={scale}
					className={cn('absolute h-full', scale === 1 && 'bg-gray-300', scale === 2 && 'bg-gray-400', scale === 3 && 'bg-gray-500', scale === 4 && 'bg-gray-600', scale === 5 && 'bg-gray-700')}
					style={{
						left: `${distribution.filter(d => d.scale < scale).reduce((acc, curr) => acc + curr.percentage, 0)}%`,
						width: `${percentage}%`
					}}
				/>
			))}
			<div className="absolute inset-0 flex items-center justify-between px-2 text-xs text-white">
				{distribution.map(({ scale, percentage }) => {
					const labelObj = scaleLabels?.[scale - 1];
					const label = labelObj && typeof labelObj.label === 'string' ? labelObj.label : scale;
					const description = labelObj && typeof labelObj.description === 'string' ? labelObj.description : undefined;
					return percentage > 0 ? (
						description ? (
							<TooltipProvider key={scale}>
								<Tooltip>
									<TooltipTrigger asChild>
										<span className="cursor-help font-medium underline">
											{label} ({percentage.toFixed(0)}%)
										</span>
									</TooltipTrigger>
									<TooltipContent>{description}</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						) : (
							<span key={scale} className="font-medium">
								{label} ({percentage.toFixed(0)}%)
							</span>
						)
					) : null;
				})}
			</div>
		</div>
	);
}

function YesNoProgressBar({ distribution }: { distribution: YesNoDistribution[] }) {
	return (
		<div className="relative h-4 w-full overflow-hidden rounded-full bg-secondary">
			{distribution.map(({ answer, percentage }) => (
				<div
					key={answer}
					className={cn('absolute h-full', answer === 'yes' ? 'bg-gray-600' : 'bg-gray-300')}
					style={{
						left: `${distribution.filter(d => d.answer === 'no' && answer === 'yes').reduce((acc, curr) => acc + curr.percentage, 0)}%`,
						width: `${percentage}%`
					}}
				/>
			))}
			<div className="absolute inset-0 flex items-center justify-between px-2 text-xs text-white">
				{distribution.map(({ answer, percentage }) => (
					<span key={answer} className="font-medium">
						{percentage > 0 && `${answer === 'yes' ? 'Yes' : 'No'} (${percentage.toFixed(0)}%)`}
					</span>
				))}
			</div>
		</div>
	);
}

function ScaleIndicator({ value, max = 5 }: { value: number; max?: number }) {
	return (
		<div className="flex items-center gap-1">
			<div className="flex h-2 w-full gap-0.5">
				{Array.from({ length: max }).map((_, i) => (
					<div key={i} className={cn('h-full flex-1 rounded-sm', i < value ? 'bg-primary' : 'bg-secondary')} />
				))}
			</div>
			<span className="text-sm text-muted-foreground">
				{value}/{max}
			</span>
		</div>
	);
}

function YesNoIndicator({ value }: { value: 'yes' | 'no' }) {
	return (
		<div className="flex items-center gap-1">
			<div className="flex h-2 w-full gap-0.5">
				<div className={cn('h-full flex-1 rounded-sm', value === 'yes' ? 'bg-primary' : 'bg-secondary')} />
				<div className={cn('h-full flex-1 rounded-sm', value === 'no' ? 'bg-primary' : 'bg-secondary')} />
			</div>
			<span className="text-sm capitalize text-muted-foreground">{value}</span>
		</div>
	);
}

export function ManagerAssessmentAggregate({ employees, answers, questions }: ManagerAssessmentAggregateProps) {
	const [activeFilter, setActiveFilter] = useState<'individual' | 'aggregate'>('individual');

	// Filter for private manager assessment questions
	const managerAssessmentQuestions = questions.filter(q => q.group === 'private_manager_assessment');

	// Group answers by employee
	const employeeAnswers = employees.map(employee => {
		const employeeAnswer = answers.find(a => a.contract_id === employee.id);
		const managerAnswers = employeeAnswer?.manager_answers as { question_id: number; answer: any }[] | undefined;

		return {
			employee,
			hasAnswer: !!employeeAnswer,
			submissionDate: employeeAnswer?.manager_submission_date,
			answers:
				managerAnswers?.reduce(
					(acc, curr) => {
						const question = managerAssessmentQuestions.find(q => q.id === curr.question_id);
						if (question) {
							acc[question.question] = curr.answer;
						}
						return acc;
					},
					{} as Record<string, any>
				) || {}
		};
	});

	// Calculate distribution for each question
	const questionDistributions = managerAssessmentQuestions
		.map(question => {
			if (question.type !== 'scale' && question.type !== 'yesno') return null;

			if (question.type === 'scale') {
				const scaleCounts = Array(5).fill(0);
				let totalAnswers = 0;

				employeeAnswers.forEach(({ answers }) => {
					const answer = answers[question.question];
					if (typeof answer === 'number' && answer >= 1 && answer <= 5) {
						scaleCounts[answer - 1]++;
						totalAnswers++;
					}
				});

				return {
					question,
					type: 'scale' as const,
					distribution: scaleCounts.map((count, index) => ({
						scale: index + 1,
						count,
						percentage: totalAnswers > 0 ? (count / totalAnswers) * 100 : 0
					}))
				} as ScaleQuestionDistribution;
			} else {
				// Handle yes/no questions
				const yesCount = employeeAnswers.filter(({ answers }) => answers[question.question] === 'yes').length;
				const noCount = employeeAnswers.filter(({ answers }) => answers[question.question] === 'no').length;
				const totalAnswers = yesCount + noCount;

				return {
					question,
					type: 'yesno' as const,
					distribution: [
						{ answer: 'yes' as const, count: yesCount, percentage: totalAnswers > 0 ? (yesCount / totalAnswers) * 100 : 0 },
						{ answer: 'no' as const, count: noCount, percentage: totalAnswers > 0 ? (noCount / totalAnswers) * 100 : 0 }
					]
				} as YesNoQuestionDistribution;
			}
		})
		.filter((dist): dist is ScaleQuestionDistribution | YesNoQuestionDistribution => dist !== null);

	return (
		<section>
			<div className="mb-7 flex items-center justify-between">
				<h2 className="text-sm text-muted-foreground">Manager Assessments</h2>

				<Select value={activeFilter} onValueChange={(value: 'individual' | 'aggregate') => setActiveFilter(value)}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Select view" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="individual">Individual Assessments</SelectItem>
						<SelectItem value="aggregate">Question Analysis</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{activeFilter === 'individual' && (
				<Accordion type="single" collapsible className="space-y-4">
					{employeeAnswers.map(({ employee, hasAnswer, submissionDate, answers }) => (
						<AccordionItem key={employee.id} value={employee.id.toString()} className="rounded-lg border px-4">
							<AccordionTrigger className="text-left hover:no-underline">
								<div className="flex w-full items-center justify-between pr-4">
									<div className="space-y-1">
										<h3 className="text-sm font-medium">
											{employee.profile.first_name} {employee.profile.last_name}
										</h3>
										<p className="text-xs text-muted-foreground">{employee.job_title}</p>
									</div>
									{hasAnswer && submissionDate && <div className="text-sm text-muted-foreground">Submitted on {format(new Date(submissionDate), 'MMM d, yyyy')}</div>}
								</div>
							</AccordionTrigger>

							<AccordionContent>
								<Separator className="my-4" />
								{!hasAnswer ? (
									<div className="pb-4 text-sm text-muted-foreground">No assessment submitted yet</div>
								) : (
									<div className="space-y-4 pb-4">
										{managerAssessmentQuestions.map(question => {
											const answer = answers[question.question];
											return (
												<div key={question.id} className="space-y-2">
													<h4 className="text-sm font-medium">{question.manager_question || question.question}</h4>
													<AnswerDisplay question={question} answer={answer} />
												</div>
											);
										})}
									</div>
								)}
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			)}

			{activeFilter === 'aggregate' && (
				<div className="space-y-10">
					{questionDistributions.map(({ question, type, distribution }, index) => (
						<>
							<div key={question.id} className="flex justify-between gap-6">
								<div className="w-1/2 text-sm font-medium">{question.manager_question || question.question}</div>
								<div className="w-1/2 space-y-2">
									{type === 'scale' ? (
										<>
											{(() => {
												const scaleLabels = Array.isArray(question.scale_labels) ? (question.scale_labels.filter(item => item && typeof item === 'object' && !Array.isArray(item)) as { label?: string; description?: string }[]) : undefined;
												return (
													<>
														<MultiScaleProgressBar distribution={distribution as ScaleDistribution[]} scaleLabels={scaleLabels} />
														<div className="flex justify-between text-xs text-muted-foreground">
															{[1, 2, 3, 4, 5].map(num => {
																const labelObj = scaleLabels?.[num - 1];
																const isObj = labelObj && typeof labelObj === 'object' && !Array.isArray(labelObj);
																const label = isObj && typeof labelObj.label === 'string' ? labelObj.label : num;
																const description = isObj && typeof labelObj.description === 'string' ? labelObj.description : undefined;
																return description ? (
																	<div className="flex items-center gap-2">
																		<div className="text-xs">{num}</div>

																		<TooltipProvider key={num}>
																			<Tooltip>
																				<TooltipTrigger>
																					<Info size={12} />
																				</TooltipTrigger>
																				<TooltipContent>{description}</TooltipContent>
																			</Tooltip>
																		</TooltipProvider>
																	</div>
																) : (
																	<span key={num}>{label}</span>
																);
															})}
														</div>
													</>
												);
											})()}
										</>
									) : (
										<>
											<YesNoProgressBar distribution={distribution as YesNoDistribution[]} />
											<div className="flex justify-between text-xs text-muted-foreground">
												<span>No</span>
												<span>Yes</span>
											</div>
										</>
									)}
								</div>
							</div>
							{index < questionDistributions.length - 1 && <Separator className="my-4" />}
						</>
					))}
				</div>
			)}
		</section>
	);
}
