'use client';

import { Tables } from '@/type/database.types';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { getTemplateQuestions } from '../appraisal-forms/appraisal.actions';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { AppraisalReviewSelector } from './appraisal-review-selector';
import { EmployeeAppraisalForm } from './employee-appraisal-form';
interface Props {
	org: string;
	contract: Tables<'contracts'>;
	appraisalCycle: Tables<'appraisal_cycles'>;
	contractAnswer?: Tables<'appraisal_answers'>;
	isManager: boolean;
	manager?: Tables<'managers'> | null;
	teamMembers?: Tables<'contracts'>[] | null;
	teamMembersAnswers?: Tables<'appraisal_answers'>[];
}

type QuestionGroup = 'growth_and_development' | 'company_values' | 'competencies' | 'private_manager_assessment';

interface GroupedQuestions {
	growth_and_development: Tables<'template_questions'>[];
	company_values: Tables<'template_questions'>[];
	competencies: Tables<'template_questions'>[];
	private_manager_assessment: Tables<'template_questions'>[];
}

export const AppraisalFormDialog = ({ org, contract, appraisalCycle, contractAnswer, isManager, manager, teamMembers, teamMembersAnswers }: Props) => {
	const [open, setOpen] = useState(false);
	const [groupedQuestions, setGroupedQuestions] = useState<GroupedQuestions>({
		growth_and_development: [],
		company_values: [],
		competencies: [],
		private_manager_assessment: []
	});
	const [answer, setAnswer] = useState<Tables<'appraisal_answers'> | null>(contractAnswer ?? null);
	const [activeTab, setActiveTab] = useState<QuestionGroup>('growth_and_development');
	const [isLoading, setIsLoading] = useState(true);
	const isSelfReviewDueDatePassed = new Date(appraisalCycle.self_review_due_date) < new Date();
	const [selectedReviewType, setSelectedReviewType] = useState<'self' | 'manager'>('self');
	const [selectedEmployee, setSelectedEmployee] = useState<Tables<'contracts'>>(contract);

	const currentQuestions = groupedQuestions['growth_and_development'];

	const isSelectedEmplyeesManager = selectedEmployee.direct_report == contract.id || (isManager && selectedEmployee.team == manager?.team);

	useEffect(() => {
		const fetchQuestions = async () => {
			try {
				setIsLoading(true);
				const fetchedQuestions = await getTemplateQuestions({ org, templateId: appraisalCycle.question_template });

				// Group questions by their group type
				const grouped: GroupedQuestions = {
					growth_and_development: [],
					company_values: [],
					competencies: [],
					private_manager_assessment: []
				};

				fetchedQuestions.forEach(question => {
					const group = question.group as QuestionGroup;
					if (group in grouped) {
						grouped[group].push(question);
					}
				});

				setGroupedQuestions(grouped);
			} catch (error) {
				console.error('Failed to fetch questions:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchQuestions();
	}, [appraisalCycle.question_template, org]);

	const handleReviewTypeSelect = (type: 'self' | 'manager', employee: Tables<'contracts'>, answer: Tables<'appraisal_answers'> | null) => {
		setSelectedReviewType(type);
		setSelectedEmployee(employee);
		setAnswer(answer);
	};

	if (isLoading) {
		return (
			<Button disabled className="flex items-center gap-2">
				<Loader2 className="h-4 w-4 animate-spin" />
				Loading...
			</Button>
		);
	}

	if (!currentQuestions?.length) {
		return (
			<Button disabled={new Date(appraisalCycle.end_date) < new Date() && !answer} onClick={() => setOpen(true)}>
				{new Date(appraisalCycle.end_date) < new Date() && !answer ? 'Appraisal Ended' : answer?.employee_submission_date ? 'Review Appraisal' : 'Continue Appraisal'}
			</Button>
		);
	}

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<Button className={cn(new Date(appraisalCycle.end_date) < new Date() && !answer && 'hidden')} onClick={() => setOpen(true)}>
				{(new Date(appraisalCycle.end_date) < new Date() && answer) || answer?.employee_submission_date ? 'Review Appraisal' : answer?.status === 'draft' ? 'Continue Appraisal' : 'Start Appraisal'}
			</Button>

			<AlertDialogContent className="flex max-w-full flex-col items-center overflow-y-auto p-0">
				<AlertDialogHeader className="sr-only">
					<AlertDialogTitle>{appraisalCycle.name}</AlertDialogTitle>
					<AlertDialogDescription>{appraisalCycle.description}</AlertDialogDescription>
				</AlertDialogHeader>

				{/* {MemoizedAppraisalReviewSelector} */}
				<AppraisalReviewSelector
					selectedEmployee={selectedEmployee}
					teamMembers={teamMembers}
					contract={contract}
					contractAnswer={contractAnswer}
					isSelfReviewDueDatePassed={isSelfReviewDueDatePassed}
					handleReviewTypeSelect={handleReviewTypeSelect}
					manager={manager}
					activeReviewType={selectedReviewType}
					teamMembersAnswers={teamMembersAnswers}
				/>

				{/* Appraisal Form */}
				<EmployeeAppraisalForm
					setOpen={setOpen}
					org={org}
					appraisalCycle={appraisalCycle}
					activeTab={activeTab}
					setActiveTab={setActiveTab}
					answer={answer}
					selectedReviewType={selectedReviewType}
					isManager={isManager}
					selectedEmployee={selectedEmployee}
					contract={contract}
					isSelectedEmplyeesManager={isSelectedEmplyeesManager}
					groupedQuestions={groupedQuestions}
				/>

				{/* <div className="mx-auto flex w-full max-w-2xl flex-col gap-10 space-y-6">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold">{appraisalCycle.name}</h2>
						<div className="flex items-center gap-2">
							<Button variant="outline" onClick={handlePrevious} disabled={isFirstQuestionInGroup && currentGroupIndex === 0}>
								{isFirstQuestionInGroup && currentGroupIndex > 0 ? `Back to ${questionGroups[currentGroupIndex - 1].replace(/_/g, ' ')}` : 'Previous'}
							</Button>
							<Button variant="outline" onClick={handleNext} disabled={isLastQuestionInGroup && isLastGroup}>
								{isLastQuestionInGroup && !isLastGroup ? `Continue to ${questionGroups[currentGroupIndex + 1].replace(/_/g, ' ')}` : 'Next'}
							</Button>
						</div>
					</div>

					{isSelfReviewDueDatePassed && (
						<Alert className="border bg-accent">
							<AlertDescription className="text-xs font-normal">The self review due date has passed. You can no longer edit or submit this appraisal.</AlertDescription>
						</Alert>
					)}

					<Tabs
						value={activeTab}
						onValueChange={value => {
							setActiveTab(value as QuestionGroup);
							setCurrentGroup(value as QuestionGroup);
							setCurrentQuestionIndex(0);
						}}
						className="w-full space-y-10">
						<TabsList className="mb-10 flex h-[unset] w-fit p-2">
							{questionGroups.map(group => (
								<TabsTrigger key={group} value={group} className="relative whitespace-nowrap">
									{groupLabels[group]}

									<div className={cn('ml-2 h-1 w-6 rounded-md', getGroupStatus(group) === 'Completed' && 'bg-green-500/75', getGroupStatus(group) === 'In Progress' && 'bg-yellow-500', getGroupStatus(group) === 'Not Started' && 'bg-primary-foreground')}></div>
								</TabsTrigger>
							))}
						</TabsList>

						<div className="space-y-4">
							<Progress value={getGroupProgress(currentGroup)} className="h-1" />
							<p className="flex items-center gap-2 text-xs text-muted-foreground">
								<span>{groupLabels[currentGroup]}</span> •
								<span>
									Question {currentQuestionIndex + 1} of {currentQuestions.length}
								</span>
							</p>
						</div>

						{questionGroups.map(group => (
							<TabsContent className="space-y-4" key={group} value={group}>
								<h3 className="text-base font-medium">
									{selectedReviewType === 'self' ? currentQuestion.question : currentQuestion.manager_question} {currentQuestion.required && <span className="text-red-500">*</span>}
								</h3>

								<QuestionInput question={currentQuestion} />
							</TabsContent>
						))}
					</Tabs>

					<Separator className="!my-10" />

					<div className="flex justify-end gap-4">
						<Button variant="outline" className="mr-auto" onClick={() => setOpen(false)}>
							Close
						</Button>

						{!isSelfReviewDueDatePassed && (
							<>
								<Button variant="secondary" onClick={handlePrevious} disabled={currentQuestionIndex === 0 && currentGroupIndex === 0}>
									{isFirstQuestionInGroup && currentGroupIndex > 0 ? `Previous: ${groupLabels[questionGroups[currentGroupIndex - 1]]}` : 'Previous question'}
								</Button>

								{isLastQuestionInGroup && isLastGroup ? (
									<Button onClick={handleSubmit}>{isSubmitting ? 'Submitting...' : 'Submit Appraisal'}</Button>
								) : (
									<Button onClick={handleNext}>{isLastQuestionInGroup ? `Next: ${groupLabels[questionGroups[currentGroupIndex + 1]]}` : 'Next question'}</Button>
								)}
							</>
						)}
					</div>
				</div> */}
			</AlertDialogContent>
		</AlertDialog>
	);
};
