'use client';

import { AppraisalReviewSelector } from '@/components/appraisal/appraisal-review-selector';
import { EmployeeAppraisalForm } from '@/components/appraisal/employee-appraisal-form';
import { GroupedQuestions } from '@/components/appraisal/appraisal.types';
import { Tables } from '@/type/database.types';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BackButton } from '@/components/ui/back-button';

export const AppraisalFormComponent = ({
	org,
	teams,
	teamMembers,
	manager,
	teamMembersAnswers,
	contract,
	questions,
	template,
	appraisalCycle
}: {
	org: string;
	teams: Tables<'teams'>[];
	teamMembers: Tables<'contracts'>[];
	manager: Tables<'managers'> | null;
	teamMembersAnswers: Tables<'appraisal_answers'>[];
	contract: Tables<'contracts'>;
	questions: Tables<'template_questions'>[];
	template: Tables<'question_templates'>;
	appraisalCycle: Tables<'appraisal_cycles'>;
}) => {
	const router = useRouter();
	const allQuestions = questions;
	const [groupedQuestions, setGroupedQuestions] = useState<GroupedQuestions>({
		growth_and_development: [],
		company_values: [],
		competencies: [],
		private_manager_assessment: [],
		objectives: [],
		goal_scoring: []
	});
	const contractAnswer = teamMembersAnswers.find(answer => answer.contract_id === contract.id) ?? null;

	const isManager = manager?.person === contract.id || teamMembers.some(member => member.direct_report === contract.id);
	const customGroupNames = template.custom_group_names as { id: string; name: string }[];

	const [answer, setAnswer] = useState<Tables<'appraisal_answers'> | null>(contractAnswer);
	const [activeTab, setActiveTab] = useState<'objectives' | 'goal_scoring' | 'questions' | 'direct_score'>(appraisalCycle.type === 'objectives_goals_accessment' ? 'objectives' : 'direct_score');
	const [selectedReviewType, setSelectedReviewType] = useState<'self' | 'manager' | 'summary'>('self');
	const [selectedEmployee, setSelectedEmployee] = useState<Tables<'contracts'>>(contract);

	const isSelectedEmployeesManager = selectedEmployee.direct_report === contract.id || (isManager && !!manager?.team && selectedEmployee.team === manager.team && selectedEmployee.id !== manager.person);

	// Group questions whenever selectedEmployee changes
	useEffect(() => {
		let grouped: any = {};

		// Sort questions by order_index first
		allQuestions
			.sort((a, b) => a.order_index - b.order_index)
			.forEach(question => {
				const group = question.group;
				const teamMatch = !question.team_ids?.length || question.team_ids.includes((selectedEmployee.team as any)?.id || selectedEmployee.team);
				const empMatch = !question.employee_ids?.length || question.employee_ids.includes(selectedEmployee.id);
				if (group && (teamMatch || empMatch)) {
					if (!grouped[group]) grouped[group] = [];
					grouped[group].push(question);
				}
			});

		setGroupedQuestions({ objectives: [], goal_scoring: [], ...grouped });
	}, [allQuestions, selectedEmployee]);

	const handleReviewTypeSelect = (type: 'self' | 'manager' | 'summary', employee: Tables<'contracts'>, answer: Tables<'appraisal_answers'> | null) => {
		setSelectedReviewType(type);
		setSelectedEmployee(employee);
		setAnswer(answer);
	};

	const isManagerReviewDueDatePassed = new Date(appraisalCycle.manager_review_due_date) < new Date();
	const isSelfReviewDueDatePassed = new Date(appraisalCycle.self_review_due_date) < new Date();

	return (
		<div className="pb-28">
			<div className="mb-4 flex items-center gap-4">
				<BackButton className="lg:static lg:translate-y-0" />
				<h2 className="text-2xl font-semibold">{appraisalCycle.name}</h2>
			</div>

			{selectedReviewType === 'self' && isSelfReviewDueDatePassed && (
				<Alert className="mb-4 border bg-accent py-2">
					<AlertDescription className="text-xs font-normal">Review due date has passed. You can no longer edit or submit this appraisal.</AlertDescription>
				</Alert>
			)}

			{selectedReviewType === 'manager' && isManagerReviewDueDatePassed && (
				<Alert className="mb-4 border bg-accent py-2">
					<AlertDescription className="text-xs font-normal">Review due date has passed. You can no longer edit or submit this appraisal.</AlertDescription>
				</Alert>
			)}

			<div className="mt-8 flex h-full w-full flex-col items-start gap-4 md:flex-row">
				<AppraisalReviewSelector
					selectedEmployee={selectedEmployee}
					teamMembers={teamMembers}
					contract={contract}
					contractAnswer={contractAnswer ?? undefined}
					isSelfReviewDueDatePassed={isSelfReviewDueDatePassed}
					handleReviewTypeSelect={handleReviewTypeSelect}
					manager={manager}
					activeReviewType={selectedReviewType}
					teamMembersAnswers={teamMembersAnswers}
					showTeamMembers={!appraisalCycle.employee}
				/>

				{/* Appraisal Form */}
				<div className="w-full flex-1 overflow-y-auto p-1">
					<EmployeeAppraisalForm
						setOpen={() => {
							router.refresh();
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
						isSelectedEmplyeesManager={isSelectedEmployeesManager}
						groupedQuestions={groupedQuestions}
						teams={teams}
						customGroupNames={customGroupNames}
					/>
				</div>
			</div>
		</div>
	);
};
