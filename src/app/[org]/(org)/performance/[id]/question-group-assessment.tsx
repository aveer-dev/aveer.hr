'use client';

import { Tables } from '@/type/database.types';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { AnswerDisplay } from '@/components/appraisal/assessment-indicators';

type AppraisalAnswer = Tables<'appraisal_answers'>;
type Contract = Tables<'contracts'>;
type TemplateQuestion = Tables<'template_questions'>;

interface QuestionGroupAssessmentProps {
	employees: (Contract & { profile: { first_name: string; last_name: string } })[];
	answers: AppraisalAnswer[];
	questions: TemplateQuestion[];
	group: 'growth_and_development' | 'company_values' | 'competencies';
}

export function QuestionGroupAssessment({ employees, answers, questions, group }: QuestionGroupAssessmentProps) {
	const [activeFilter, setActiveFilter] = useState<'individual' | 'aggregate'>('individual');

	// Filter questions for the specified group
	const groupQuestions = questions.filter(q => q.group === group);

	// Group answers by employee
	const employeeAnswers = employees.map(employee => {
		const employeeAnswer = answers.find(a => a.contract_id === employee.id);
		const managerAnswers = employeeAnswer?.manager_answers as { question_id: number; answer: any }[] | undefined;
		const selfAnswers = employeeAnswer?.answers as { question_id: number; answer: any }[] | undefined;

		return {
			employee,
			hasAnswer: !!employeeAnswer,
			submissionDate: employeeAnswer?.employee_submission_date,
			managerSubmissionDate: employeeAnswer?.manager_submission_date,
			answers: {
				self:
					selfAnswers?.reduce(
						(acc, curr) => {
							const question = groupQuestions.find(q => q.id === curr.question_id);
							if (question) {
								acc[question.question] = curr.answer;
							}
							return acc;
						},
						{} as Record<string, any>
					) || {},
				manager:
					managerAnswers?.reduce(
						(acc, curr) => {
							const question = groupQuestions.find(q => q.id === curr.question_id);
							if (question) {
								acc[question.question] = curr.answer;
							}
							return acc;
						},
						{} as Record<string, any>
					) || {}
			}
		};
	});

	return (
		<section>
			<div className="mb-7 flex items-center justify-between">
				<h2 className="text-sm capitalize text-muted-foreground">{group.replace(/_/g, ' ')}</h2>

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
					{employeeAnswers.map(({ employee, hasAnswer, submissionDate, managerSubmissionDate, answers }) => (
						<AccordionItem key={employee.id} value={employee.id.toString()} className="rounded-lg border px-4">
							<AccordionTrigger className="text-left hover:no-underline">
								<div className="flex w-full items-center justify-between pr-4">
									<div className="space-y-1">
										<h3 className="text-sm font-medium">
											{employee.profile.first_name} {employee.profile.last_name}
										</h3>
										<p className="text-xs text-muted-foreground">{employee.job_title}</p>
									</div>
									{hasAnswer && (
										<div className="text-sm text-muted-foreground">
											{submissionDate && `Self: ${format(new Date(submissionDate), 'MMM d, yyyy')}`}
											{managerSubmissionDate && ` | Manager: ${format(new Date(managerSubmissionDate), 'MMM d, yyyy')}`}
										</div>
									)}
								</div>
							</AccordionTrigger>

							<AccordionContent>
								<Separator className="my-4" />
								{!hasAnswer ? (
									<div className="pb-4 text-sm text-muted-foreground">No assessment submitted yet</div>
								) : (
									<div className="space-y-4 pb-4">
										{groupQuestions.map((question, index) => (
											<>
												<div className="space-y-4" key={question.id}>
													<div className="space-y-2">
														<h4 className="text-xs font-medium text-muted-foreground">{question.question} (Self)</h4>

														<div className="rounded-lg border bg-accent p-4">
															<AnswerDisplay question={question} answer={answers.self[question.question]} />
														</div>
													</div>

													<div className="space-y-2">
														<h4 className="text-xs font-medium text-muted-foreground">{question.manager_question} (Manager)</h4>

														<div className="rounded-lg border bg-accent p-4">
															<AnswerDisplay question={question} answer={answers.manager[question.question]} />
														</div>
													</div>
												</div>

												{index < groupQuestions.length - 1 && <Separator className="my-4" />}
											</>
										))}
									</div>
								)}
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			)}

			{activeFilter === 'aggregate' && (
				<div className="space-y-10">
					{groupQuestions.map((question, index) => (
						<div key={question.id} className="space-y-6">
							<div className="space-y-2">
								<div className="text-sm font-light">{question.question} (Self)</div>

								<div className="space-y-2">
									{employeeAnswers.map(({ employee, answers }) => (
										<div key={employee.id} className="space-y-2 rounded-lg border bg-accent p-2">
											<p className="text-xs text-muted-foreground">
												{employee.profile.first_name} {employee.profile.last_name} ({employee.job_title})
											</p>
											<AnswerDisplay question={question} answer={answers.self[question.question]} />
										</div>
									))}
								</div>
							</div>

							<div className="space-y-2">
								<div className="text-sm font-light">{question.manager_question} (Manager)</div>

								<div className="space-y-2">
									{employeeAnswers.map(({ employee, answers }) => (
										<div key={employee.id} className="space-y-1 rounded-lg border bg-accent p-2">
											<p className="text-xs text-muted-foreground">
												{employee.profile.first_name} {employee.profile.last_name} ({employee.job_title})
											</p>
											<AnswerDisplay question={question} answer={answers.manager[question.question]} />
										</div>
									))}
								</div>
							</div>

							{index < groupQuestions.length - 1 && <Separator className="my-4" />}
						</div>
					))}
				</div>
			)}
		</section>
	);
}
