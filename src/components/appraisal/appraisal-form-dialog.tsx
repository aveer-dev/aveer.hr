'use client';

import { Tables } from '@/type/database.types';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { getQuestionTemplate, getTemplateQuestions } from '../appraisal-forms/appraisal.actions';
import { cn } from '@/lib/utils';
import { AppraisalReviewSelector } from './appraisal-review-selector';
import { EmployeeAppraisalForm } from './employee-appraisal-form';
import { useRouter } from 'next/navigation';
import { getTeamAppraisalAnswers } from './appraisal.actions';
import { PageLoader } from '../ui/page-loader';

interface Props {
	org: string;
	contract: Tables<'contracts'>;
	appraisalCycle: Tables<'appraisal_cycles'>;
	contractAnswer?: Tables<'appraisal_answers'>;
	isManager: boolean;
	manager?: Tables<'managers'> | null;
	teamMembers?: Tables<'contracts'>[] | null;
	teamMembersAnswers?: Tables<'appraisal_answers'>[];
	teams?: Tables<'teams'>[] | null;
}

type QuestionGroup = 'growth_and_development' | 'company_values' | 'competencies' | 'private_manager_assessment' | 'objectives' | 'goal_scoring';

interface GroupedQuestions {
	growth_and_development: Tables<'template_questions'>[];
	company_values: Tables<'template_questions'>[];
	competencies: Tables<'template_questions'>[];
	private_manager_assessment: Tables<'template_questions'>[];
	objectives: Tables<'template_questions'>[];
	goal_scoring: Tables<'template_questions'>[];
}

export const AppraisalFormDialog = ({ org, contract, appraisalCycle, contractAnswer, isManager, manager, teamMembers, teams }: Props) => {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [allQuestions, setAllQuestions] = useState<Tables<'template_questions'>[]>([]);
	const [groupedQuestions, setGroupedQuestions] = useState<GroupedQuestions>({
		growth_and_development: [],
		company_values: [],
		competencies: [],
		private_manager_assessment: [],
		objectives: [],
		goal_scoring: []
	});
	const [answer, setAnswer] = useState<Tables<'appraisal_answers'> | null>(contractAnswer ?? null);
	const [activeTab, setActiveTab] = useState<'objectives' | 'goal_scoring' | 'questions'>('objectives');
	const [isLoading, setIsLoading] = useState(true);
	const [isTeamAnswersLoading, setIsTeamAnswersLoading] = useState(true);
	const isSelfReviewDueDatePassed = new Date(appraisalCycle.self_review_due_date) < new Date();
	const [selectedReviewType, setSelectedReviewType] = useState<'self' | 'manager' | 'summary'>('self');
	const [selectedEmployee, setSelectedEmployee] = useState<Tables<'contracts'>>(contract);
	const [teamMembersAnswers, setTeamMembersAnswers] = useState<Tables<'appraisal_answers'>[]>([]);
	const [customGroupNames, setCustomGroupNames] = useState<{ id: string; name: string }[]>([]);

	const isSelectedEmplyeesManager = selectedEmployee.direct_report == contract.id || (isManager && selectedEmployee.team == manager?.team);

	useEffect(() => {
		const fetchQuestions = async () => {
			if (!open) return;

			try {
				setIsLoading(true);
				const [fetchedQuestions, template] = await Promise.all([getTemplateQuestions({ org, templateId: appraisalCycle.question_template }), getQuestionTemplate(appraisalCycle.question_template)]);
				setAllQuestions(fetchedQuestions);
				setCustomGroupNames(template.custom_group_names as { id: string; name: string }[]);
			} catch (error) {
				console.error('Failed to fetch questions:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchQuestions();
	}, [open, appraisalCycle.question_template, org]);

	useEffect(() => {
		const fetchTeamAnswers = async () => {
			if (!open) return;
			setIsTeamAnswersLoading(true);

			try {
				const teamMembersAnswers = await getTeamAppraisalAnswers({ org, contractIds: teamMembers?.map(member => member.id) || [], appraisalCycleId: appraisalCycle.id });
				setTeamMembersAnswers(teamMembersAnswers);
			} catch (error) {
				console.error('Failed to fetch team answers:', error);
			} finally {
				setIsTeamAnswersLoading(false);
			}
		};

		fetchTeamAnswers();
	}, [appraisalCycle.id, org, teamMembers, open]);

	// Group questions whenever selectedEmployee changes
	useEffect(() => {
		let grouped: any = {};

		allQuestions.forEach(question => {
			const group = question.group as QuestionGroup;
			const teamMatch = !question.team_ids?.length || question.team_ids.includes((selectedEmployee.team as any)?.id || selectedEmployee.team);
			const empMatch = !question.employee_ids?.length || question.employee_ids.includes(selectedEmployee.id);
			if (group && (teamMatch || empMatch)) {
				if (!grouped[group]) grouped[group] = [];
				grouped[group].push(question);
			}
		});

		setGroupedQuestions({ objectives: [], goal_scoring: [], ...grouped });
	}, [allQuestions, selectedEmployee]);

	useEffect(() => {
		if ((contractAnswer && answer?.contract_id !== contractAnswer.contract_id) || (contractAnswer && !answer)) {
			setAnswer(contractAnswer);
		}
	}, [contractAnswer, answer]);

	const handleReviewTypeSelect = (type: 'self' | 'manager' | 'summary', employee: Tables<'contracts'>, answer: Tables<'appraisal_answers'> | null) => {
		setSelectedReviewType(type);
		setSelectedEmployee(employee);
		setAnswer(answer);
	};

	return (
		<AlertDialog
			open={open}
			onOpenChange={state => {
				router.refresh();
				setOpen(state);
			}}>
			<Button className={cn(new Date(appraisalCycle.end_date) < new Date() && !contractAnswer && 'hidden')} onClick={() => setOpen(true)}>
				{(new Date(appraisalCycle.end_date) < new Date() && contractAnswer) || contractAnswer?.employee_submission_date ? 'Review Appraisal' : contractAnswer?.status === 'draft' ? 'Continue Appraisal' : 'Start Appraisal'}
			</Button>

			<AlertDialogContent className="flex h-screen max-w-full flex-col items-center overflow-y-auto p-1">
				<AlertDialogHeader className="sr-only">
					<AlertDialogTitle>{appraisalCycle.name}</AlertDialogTitle>
					<AlertDialogDescription>{appraisalCycle.description}</AlertDialogDescription>
				</AlertDialogHeader>

				{(isLoading || isTeamAnswersLoading) && <PageLoader isLoading={isLoading || isTeamAnswersLoading} />}

				<div className="flex h-full w-full flex-col md:flex-row">
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
					<div className="flex-1 overflow-y-auto p-1 md:-ml-[16rem] md:py-24">
						<EmployeeAppraisalForm
							setOpen={state => {
								router.refresh();
								setOpen(state);
							}}
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
							teams={teams}
							customGroupNames={customGroupNames}
						/>
					</div>
				</div>
			</AlertDialogContent>
		</AlertDialog>
	);
};
