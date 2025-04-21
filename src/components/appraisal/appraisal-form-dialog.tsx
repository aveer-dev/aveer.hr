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
	const [selectedReviewType, setSelectedReviewType] = useState<'self' | 'manager' | 'summary'>('self');
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

	const handleReviewTypeSelect = (type: 'self' | 'manager' | 'summary', employee: Tables<'contracts'>, answer: Tables<'appraisal_answers'> | null) => {
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

			<AlertDialogContent className="flex h-screen max-w-full flex-col items-center overflow-y-auto p-1">
				<AlertDialogHeader className="sr-only">
					<AlertDialogTitle>{appraisalCycle.name}</AlertDialogTitle>
					<AlertDialogDescription>{appraisalCycle.description}</AlertDialogDescription>
				</AlertDialogHeader>

				<div className="flex h-full w-full flex-col items-center md:flex-row">
					<div className="sticky top-0 h-screen w-full overflow-y-auto md:w-64 md:flex-shrink-0">
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
					</div>

					{/* Appraisal Form */}
					<div className="flex-1 overflow-y-auto p-1 md:-ml-[16rem]">
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
					</div>
				</div>
			</AlertDialogContent>
		</AlertDialog>
	);
};
