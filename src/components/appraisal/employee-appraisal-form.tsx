import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Tables } from '@/type/database.types';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { autoSaveAnswer, autoSaveObjectives, submitAppraisal } from '../appraisal-forms/appraisal.actions';
import { useRouter } from 'next/navigation';
import { Textarea } from '../ui/textarea';
import { useDebounce } from '@/hooks/use-debounce';
import { ChevronLeft, ChevronRight, Info, Loader2, Send, Settings2, Trash2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusIcon } from 'lucide-react';
import { Answer, AnswersState, Goal, GOAL_SCORE, GroupedQuestions, Objective } from './appraisal.types';
import { GoalFileUpload } from './goal-file-upload';
import { Badge } from '../ui/badge';
import { LoadingSpinner } from '../ui/loader';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Switch } from '../ui/switch';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../ui/tooltip';
import { AppraisalReviewSelector } from './appraisal-review-selector';
type QuestionGroup = 'growth_and_development' | 'company_values' | 'competencies' | 'private_manager_assessment' | 'objectives' | 'goal_scoring';

interface Props {
	appraisalCycle: Tables<'appraisal_cycles'>;
	activeTab: string;
	setActiveTab: (tab: QuestionGroup) => void;
	answer?: Tables<'appraisal_answers'> | null;
	selectedReviewType: 'self' | 'manager' | 'summary';
	isManager: boolean;
	selectedEmployee: Tables<'contracts'>;
	contract: Tables<'contracts'>;
	isSelectedEmplyeesManager: boolean;
	org: string;
	setOpen: (open: boolean) => void;
	groupedQuestions: GroupedQuestions;
	teams?: Tables<'teams'>[] | null;
	handleReviewTypeSelect: (type: 'self' | 'manager' | 'summary', employee: Tables<'contracts'>, answer: Tables<'appraisal_answers'> | null) => void;
	teamMembers?: Tables<'contracts'>[] | null;
	customGroupNames?: { id: string; name: string }[];
}

const isAppraisalSubmitted = (reviewType: 'self' | 'manager', answer?: Tables<'appraisal_answers'> | null): boolean => {
	if (!answer) return false;
	return reviewType === 'self' ? !!answer.employee_submission_date : !!answer.manager_submission_date;
};

const canUpdateAppraisal = (reviewType: 'self' | 'manager', isManager: boolean, isSelectedEmplyeesManager: boolean, selectedEmployee: Tables<'contracts'>, contract: Tables<'contracts'>, dueDatePassed: boolean, answer?: Tables<'appraisal_answers'> | null): boolean => {
	// Then check due date
	if (dueDatePassed) return false;

	if (reviewType === 'self') {
		// Employees can update their self review even after submission,
		// until their manager submits their review
		const managerSubmitted = !!answer?.manager_submission_date;
		return selectedEmployee.id === contract.id && !managerSubmitted;
	} else {
		// For manager review, prevent update if already submitted
		if (isAppraisalSubmitted('manager', answer)) return false;
		return isManager && isSelectedEmplyeesManager;
	}
};

export const EmployeeAppraisalForm = ({
	teams,
	groupedQuestions,
	setOpen,
	org,
	appraisalCycle,
	activeTab,
	setActiveTab,
	answer,
	selectedReviewType,
	isManager,
	selectedEmployee,
	contract,
	isSelectedEmplyeesManager,
	customGroupNames,
	handleReviewTypeSelect,
	teamMembers
}: Props) => {
	const router = useRouter();
	const questionGroups = Object.keys(groupedQuestions) as QuestionGroup[];
	const [managerAnswers, setManagerAnswers] = useState<AnswersState>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [answers, setAnswers] = useState<AnswersState>({});
	const [savingStates, setSavingStates] = useState<Record<number, boolean>>({});
	const [objectives, setObjectives] = useState<Objective[]>([]);
	const [objectivesScore, updateObjectivesScore] = useState<GOAL_SCORE[]>([]);
	const [managerObjectivesScore, updateManagerObjectivesScore] = useState<GOAL_SCORE[]>([]);
	const [editingObjective, setEditingObjective] = useState<Objective | null>(null);
	const [editingGoal, setEditingGoal] = useState<{ objectiveId: string; goal: Goal } | null>(null);
	const [deletingObjective, setDeletingObjective] = useState<string | null>(null);
	const [deletingGoal, setDeletingGoal] = useState<string | null>(null);
	const [enableWeights, setEnableWeights] = useState<boolean>(false);
	const [localAnswerId, setLocalAnswerId] = useState<number | undefined>(answer?.id);

	const canUpdateSelfReview = useMemo(
		() => canUpdateAppraisal('self', isManager, isSelectedEmplyeesManager, selectedEmployee, contract, new Date(appraisalCycle.self_review_due_date) < new Date(), answer),
		[isManager, isSelectedEmplyeesManager, selectedEmployee, contract, appraisalCycle.self_review_due_date, answer]
	);

	const canUpdateManagerReview = useMemo(
		() => canUpdateAppraisal('manager', isManager, isSelectedEmplyeesManager, selectedEmployee, contract, new Date(appraisalCycle.manager_review_due_date) < new Date(), answer),
		[isManager, isSelectedEmplyeesManager, selectedEmployee, contract, appraisalCycle.manager_review_due_date, answer]
	);

	const shouldShowQuestion = (question: Tables<'template_questions'>) => {
		if (question.group === 'private_manager_assessment') {
			return isManager && selectedReviewType === 'manager';
		}
		const teamMatch = !question.team_ids?.length || question.team_ids.includes((selectedEmployee.team as any)?.id || selectedEmployee.team);
		const empMatch = !question.employee_ids?.length || question.employee_ids.includes(selectedEmployee.id);
		return teamMatch || empMatch;
	};

	const isSelfReviewDueDatePassed = new Date(appraisalCycle.self_review_due_date) < new Date();
	const isManagerReviewDueDatePassed = new Date(appraisalCycle.manager_review_due_date) < new Date();

	const autoSaveAnswerDebounced = useDebounce(async (questionId: number, value: any) => {
		try {
			setSavingStates(prev => ({ ...prev, [questionId]: true }));

			const payload: Parameters<typeof autoSaveAnswer>[0] = {
				answerId: localAnswerId,
				questionId,
				value,
				org,
				appraisalCycleId: appraisalCycle.id,
				contractId: selectedEmployee.id,
				answerType: selectedReviewType
			};

			const savePromise = autoSaveAnswer(payload);

			toast.promise(savePromise, {
				loading: 'Saving answer...',
				success: 'Answer saved successfully',
				error: 'Failed to save answer'
			});

			const result = await savePromise;
			if (result && Array.isArray(result) && result.length > 0 && !localAnswerId) {
				setLocalAnswerId(result[0].id);
			}
		} catch (error) {
			console.error('Failed to auto-save answer:', error);
		} finally {
			setSavingStates(prev => ({ ...prev, [questionId]: false }));
		}
	}, 1000);

	const autoSaveObjectivesDebounced = useDebounce(async (objectives: Objective[]) => {
		try {
			const savePromise = autoSaveObjectives({
				answerId: localAnswerId,
				objectives,
				org,
				appraisalCycleId: appraisalCycle.id,
				contractId: selectedEmployee.id
			});

			toast.promise(savePromise, {
				loading: 'Saving objectives...',
				success: 'Objectives saved successfully',
				error: 'Failed to save objectives'
			});

			const result = await savePromise;
			if (result && Array.isArray(result) && result.length > 0 && !localAnswerId) {
				setLocalAnswerId(result[0].id);
			}
		} catch (error) {
			console.error('Failed to auto-save objectives:', error);
		}
	}, 1000);

	const autoSaveObjectivesScoreDebounced = useDebounce(async (objectivesScore: GOAL_SCORE[]) => {
		try {
			const payload: Parameters<typeof autoSaveObjectives>[0] = {
				answerId: localAnswerId,
				org,
				appraisalCycleId: appraisalCycle.id,
				contractId: selectedEmployee.id
			};

			if (selectedReviewType === 'self') {
				payload.objectivesScore = objectivesScore;
			} else {
				payload.managerObjectivesScore = objectivesScore;
			}

			const savePromise = autoSaveObjectives(payload);

			toast.promise(savePromise, {
				loading: 'Saving score...',
				success: 'Score saved successfully',
				error: 'Failed to save score'
			});

			await savePromise;
		} catch (error) {
			toast.error('Failed to auto-save score', {
				description: error instanceof Error ? error.message : 'An unknown error occurred'
			});
			console.error('Failed to auto-save score:', error);
		}
	}, 1000);

	const updateObjectives = (newObjectives: Objective[]) => {
		if (!canUpdateSelfReview) {
			toast.error(isAppraisalSubmitted('self', answer) ? 'Cannot update objectives after submission' : isSelfReviewDueDatePassed ? 'Cannot update objectives after due date' : 'You do not have permission to update objectives');
			return;
		}

		setObjectives(newObjectives);
		autoSaveObjectivesDebounced(newObjectives);
	};

	const handleGoalScoreUpdate = (goalId: string, score: number, comment: string) => {
		const reviewType = selectedReviewType === 'summary' ? 'self' : selectedReviewType;
		const canUpdate = reviewType === 'self' ? canUpdateSelfReview : canUpdateManagerReview;

		if (!canUpdate) {
			toast.error(isAppraisalSubmitted(reviewType, answer) ? 'Cannot update scores after submission' : reviewType === 'self' ? 'Cannot update scores after self review due date' : 'Cannot update scores after manager review due date');
			return;
		}

		if (reviewType === 'self') {
			updateObjectivesScore(prev => {
				const newScores = prev.map(prevScore =>
					prevScore.goal_id === goalId
						? {
								...prevScore,
								score,
								comment
							}
						: prevScore
				);
				autoSaveObjectivesScoreDebounced(newScores);
				return newScores;
			});
		} else {
			updateManagerObjectivesScore(prev => {
				const newScores = prev.map(prevScore =>
					prevScore.goal_id === goalId
						? {
								...prevScore,
								score,
								comment
							}
						: prevScore
				);
				autoSaveObjectivesScoreDebounced(newScores);
				return newScores;
			});
		}
	};

	const handleAnswerChange = (questionId: number, value: any) => {
		if (selectedReviewType === 'manager') {
			if (!canUpdateManagerReview) {
				toast.error(isAppraisalSubmitted('manager', answer) ? 'Cannot update answers after submission' : isManagerReviewDueDatePassed ? 'Cannot update answers after manager review due date has passed' : 'You do not have permission to update this review');
				return;
			}

			setManagerAnswers(prev => ({
				...prev,
				[questionId]: value
			}));

			autoSaveAnswerDebounced(questionId, value);
			return;
		}

		if (!canUpdateSelfReview) {
			toast.error(isAppraisalSubmitted('self', answer) ? 'Cannot update answers after submission' : isSelfReviewDueDatePassed ? 'Cannot update answers after self review due date has passed' : 'You do not have permission to update this review');
			return;
		}

		setAnswers(prev => ({
			...prev,
			[questionId]: value
		}));

		autoSaveAnswerDebounced(questionId, value);
	};

	const getUnansweredRequiredQuestions = () => {
		const unanswered: { group: QuestionGroup; question: Tables<'template_questions'> }[] = [];

		Object.entries(groupedQuestions).forEach(([group, questions]) => {
			questions.forEach((question: Tables<'template_questions'>) => {
				if (question.required && (selectedReviewType === 'self' ? !answers[question.id] : !managerAnswers[question.id])) {
					if (question.group === 'private_manager_assessment') {
						if (isSelectedEmplyeesManager && selectedReviewType === 'manager') {
							unanswered.push({ group: group as QuestionGroup, question });
						}
					} else {
						unanswered.push({ group: group as QuestionGroup, question });
					}
				}
			});
		});

		return unanswered;
	};

	const handleSubmit = async () => {
		const canUpdate = selectedReviewType === 'self' ? canUpdateSelfReview : canUpdateManagerReview;

		if (!localAnswerId) {
			toast.error('Unable to submit appraisal. Please try adding some answers first.');
			return;
		}

		if (!canUpdate) {
			toast.error(
				isAppraisalSubmitted(selectedReviewType === 'summary' ? 'self' : selectedReviewType, answer)
					? 'Cannot submit appraisal after it has been submitted'
					: selectedReviewType === 'self'
						? 'Cannot submit appraisal after self review due date has passed'
						: 'Cannot submit appraisal after manager review due date has passed'
			);
			return;
		}

		const unansweredQuestions = getUnansweredRequiredQuestions();
		if (unansweredQuestions.length > 0) {
			toast.error('You are yet to answer some required questions.');
			return;
		}

		// Check if all objectives have at least one goal
		const objectivesWithoutGoals = objectives.filter(obj => obj.goals.length === 0);
		if (objectivesWithoutGoals.length > 0) {
			toast.error('Each objective must have at least one goal.');
			return;
		}

		// Check weights if enabled
		if (enableWeights) {
			const totalWeight = objectives.reduce((sum, obj) => sum + (obj.weight || 0), 0);
			if (totalWeight !== 100) {
				toast.error('Total objective weights must equal 100%');
				return;
			}

			const objectivesWithoutWeight = objectives.filter(obj => !obj.weight);
			if (objectivesWithoutWeight.length > 0) {
				toast.error('All objectives must have a weight when weights are enabled');
				return;
			}
		}

		// Check if all goals have been scored
		const unscoredGoals = objectives.some(obj =>
			obj.goals.some(goal => {
				const scores = selectedReviewType === 'self' ? objectivesScore : managerObjectivesScore;
				return !scores.find(score => score.goal_id === goal.id && score.score !== 0);
			})
		);

		if (unscoredGoals) {
			toast.error('Please score all goals before submitting.');
			return;
		}

		try {
			setIsSubmitting(true);

			if (selectedReviewType === 'manager') {
				const submitPromise = submitAppraisal({
					answerId: localAnswerId,
					manager_submission_date: new Date().toISOString()
				});

				toast.promise(submitPromise, {
					loading: 'Submitting appraisal...',
					success: 'Appraisal submitted successfully',
					error: 'Failed to submit appraisal'
				});

				await submitPromise;
			} else {
				const submitPromise = submitAppraisal({
					answerId: localAnswerId,
					employee_submission_date: new Date().toISOString(),
					status: 'submitted'
				});

				toast.promise(submitPromise, {
					loading: 'Submitting appraisal...',
					success: 'Appraisal submitted successfully',
					error: 'Failed to submit appraisal'
				});

				await submitPromise;
			}

			router.refresh();
			setOpen(false);
		} catch (error) {
			console.error('Error submitting appraisal:', error);
			toast.error('Failed to submit appraisal', {
				description: error instanceof Error ? error.message : 'An unknown error occurred'
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleNext = () => {
		if (activeTab === 'objectives' && selectedReviewType === 'self' && !isSelectedEmplyeesManager) {
			if (!objectives.length) return toast.error('Please add at least one objective before proceeding');
			if (objectives.length > 0 && objectives.some(obj => !obj.title)) return toast.error('Please add at least a title to each objective before proceeding');
			if (objectives.length > 0 && objectives.every(obj => obj.goals.length === 0)) return toast.error('Please add at least one goal to each objective before proceeding');
			if (objectives.length > 0 && objectives.some(obj => obj.goals.some(goal => !goal.title))) return toast.error('Please add at least a title to each goal before proceeding');
		}

		const nextGroupIndex = questionGroups.indexOf(activeTab as QuestionGroup) + 1;
		const nextGroup = questionGroups[nextGroupIndex];

		if (!nextGroup) return;

		if ((nextGroup === 'private_manager_assessment' && selectedReviewType === 'self') || (nextGroup === 'private_manager_assessment' && !isSelectedEmplyeesManager && selectedReviewType === 'manager')) {
			setActiveTab(questionGroups[nextGroupIndex + 1] as QuestionGroup);
			return;
		}

		setActiveTab(nextGroup);
	};

	// Update handlePrevious function
	const handlePrevious = () => {
		if (activeTab === 'objectives') return;

		const previousGroup = questionGroups[questionGroups.indexOf(activeTab as QuestionGroup) - 1];
		if (!previousGroup) return;

		if ((previousGroup === 'private_manager_assessment' && selectedReviewType === 'self') || (previousGroup === 'private_manager_assessment' && !isSelectedEmplyeesManager && selectedReviewType === 'manager')) {
			setActiveTab(questionGroups[questionGroups.indexOf(previousGroup) - 1] as QuestionGroup);
			return;
		}

		setActiveTab(previousGroup);
	};

	const groupNameMap = (customGroupNames || []).reduce(
		(acc, curr) => {
			if (curr && curr.id && typeof curr.name === 'string') acc[curr.id] = curr.name;
			return acc;
		},
		{} as Record<string, string>
	);

	const defaultGroupLabels: Record<QuestionGroup, string> = {
		growth_and_development: 'Growth & Development',
		company_values: 'Company Values',
		competencies: 'Competencies',
		private_manager_assessment: 'Manager Assessment',
		objectives: 'Objectives & Goals',
		goal_scoring: 'Goal Scoring'
	};

	const getGroupLabel = (group: QuestionGroup) => groupNameMap[group] || defaultGroupLabels[group] || group;

	const getPreviousGroupLabel = (group: QuestionGroup) => {
		const previousGroupIndex = questionGroups.indexOf(group) - 1;
		let previousGroup = questionGroups[previousGroupIndex];

		if (!previousGroup) return '';

		if ((previousGroup === 'private_manager_assessment' && selectedReviewType === 'self') || (previousGroup === 'private_manager_assessment' && !isSelectedEmplyeesManager && selectedReviewType === 'manager')) {
			previousGroup = questionGroups[previousGroupIndex - 1];
			return `: ${getGroupLabel(previousGroup as QuestionGroup)}`;
		}
		return `: ${getGroupLabel(previousGroup as QuestionGroup)}`;
	};

	const getNextGroupLabel = (group: QuestionGroup) => {
		const nextGroupIndex = questionGroups.indexOf(group) + 1;
		let nextGroup = questionGroups[nextGroupIndex];

		if (!nextGroup) return '';

		if ((nextGroup === 'private_manager_assessment' && selectedReviewType === 'self') || (nextGroup === 'private_manager_assessment' && !isSelectedEmplyeesManager && selectedReviewType === 'manager')) {
			nextGroup = questionGroups[nextGroupIndex + 1];
			return `: ${getGroupLabel(nextGroup as QuestionGroup)}`;
		}

		return `: ${getGroupLabel(nextGroup as QuestionGroup)}`;
	};

	const groupLabels: Record<QuestionGroup, string> = {
		growth_and_development: 'Growth & Development',
		company_values: 'Company Values',
		competencies: 'Competencies',
		private_manager_assessment: 'Manager Assessment',
		objectives: 'Objectives & Goals',
		goal_scoring: 'Goal Scoring'
	};

	const getGroupProgress = (group: QuestionGroup) => {
		const groupQuestions = groupedQuestions[group].filter(shouldShowQuestion);
		const answeredCount = groupQuestions.filter((q: Tables<'template_questions'>) => (selectedReviewType === 'self' ? answers[q.id] : managerAnswers[q.id]) !== undefined && (selectedReviewType === 'self' ? answers[q.id] : managerAnswers[q.id]) !== '').length;
		return (answeredCount / groupQuestions.length) * 100;
	};

	const getGroupStatus = (group: QuestionGroup) => {
		const progress = getGroupProgress(group);
		if (progress === 100) return 'Completed';
		if (progress > 0) return 'In Progress';
		return 'Not Started';
	};

	const loadAnswers = useCallback(() => {
		if (!answer) {
			setAnswers({});
			setManagerAnswers({});
			return;
		}

		const selfAnswers = (answer.answers as Answer[]) || [];
		const managerAnswerArray = (answer.manager_answers as Answer[]) || [];

		const _answers = selfAnswers.reduce(
			(acc, curr) => ({
				...acc,
				[curr.question_id]: curr.answer
			}),
			{}
		);

		const _managerAnswers = managerAnswerArray.reduce(
			(acc, curr) => ({
				...acc,
				[curr.question_id]: curr.answer
			}),
			{}
		);

		setAnswers(_answers);
		setManagerAnswers(_managerAnswers);
		setObjectives((answer.objectives as unknown as Objective[]) || []);
		setEnableWeights((answer.objectives as unknown as Objective[])?.some(obj => obj?.weight) || false);

		const initialGoalScores: GOAL_SCORE[] = [];
		(answer.objectives as unknown as Objective[])?.forEach(obj => {
			initialGoalScores.push(...obj.goals.map(goal => ({ goal_id: goal.id, score: 0, comment: '' })));
		});

		updateObjectivesScore((answer.employee_goal_score as unknown as GOAL_SCORE[]) || initialGoalScores);
		updateManagerObjectivesScore((answer.manager_goal_score as unknown as GOAL_SCORE[]) || initialGoalScores);
	}, [answer, setAnswers, setManagerAnswers, setObjectives, updateObjectivesScore, updateManagerObjectivesScore]);

	useEffect(() => {
		loadAnswers();
	}, [loadAnswers, selectedReviewType, selectedEmployee]);

	const handleDeleteObjective = async (objectiveId: string) => {
		setDeletingObjective(objectiveId);
		try {
			// Remove the objective and its goals from the state
			const newObjectives = objectives.filter(obj => obj.id !== objectiveId);
			updateObjectives(newObjectives);

			// Remove associated goal scores
			const goalsToRemove = objectives.find(obj => obj.id === objectiveId)?.goals.map(g => g.id) || [];
			updateObjectivesScore(prev => prev.filter(score => !goalsToRemove.includes(score.goal_id)));
			updateManagerObjectivesScore(prev => prev.filter(score => !goalsToRemove.includes(score.goal_id)));
		} catch (error) {
			console.error('Error deleting objective:', error);
			toast.error('Failed to delete objective');
		} finally {
			setDeletingObjective(null);
		}
	};

	const handleDeleteGoal = async (objectiveId: string, goalId: string) => {
		setDeletingGoal(goalId);
		try {
			// Remove the goal from the objective
			const newObjectives = objectives.map(obj =>
				obj.id === objectiveId
					? {
							...obj,
							goals: obj.goals.filter(g => g.id !== goalId)
						}
					: obj
			);
			updateObjectives(newObjectives);

			// Remove associated goal scores
			updateObjectivesScore(prev => prev.filter(score => score.goal_id !== goalId));
			updateManagerObjectivesScore(prev => prev.filter(score => score.goal_id !== goalId));
		} catch (error) {
			console.error('Error deleting goal:', error);
			toast.error('Failed to delete goal');
		} finally {
			setDeletingGoal(null);
		}
	};

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col">
			<div className="my-6 block w-full md:hidden">
				<AppraisalReviewSelector
					mode="dropdown"
					selectedEmployee={selectedEmployee}
					teamMembers={teamMembers}
					contract={contract}
					contractAnswer={answer ?? undefined}
					isSelfReviewDueDatePassed={isSelfReviewDueDatePassed}
					handleReviewTypeSelect={handleReviewTypeSelect}
					activeReviewType={selectedReviewType}
					manager={undefined}
					teamMembersAnswers={undefined}
				/>
			</div>

			<Tabs value={activeTab} onValueChange={value => setActiveTab(value as QuestionGroup)} className="w-full space-y-10">
				<div className="relative">
					<TabsList className="no-scrollbar mb-10 flex h-[unset] w-fit max-w-full items-start justify-start overflow-x-auto p-2 pr-14">
						{questionGroups
							.filter(group => {
								// Show all tabs except private_manager_assessment to non-managers
								if (group === 'private_manager_assessment') {
									return isSelectedEmplyeesManager && selectedReviewType === 'manager';
								}

								return true;
							})
							.map(group => (
								<TabsTrigger key={group} value={group} className="relative whitespace-nowrap">
									{getGroupLabel(group)}

									{selectedReviewType !== 'summary' && group !== 'goal_scoring' && group !== 'objectives' && (
										<div
											className={cn(
												'ml-2 h-2 w-2 rounded-md',
												getGroupStatus(group) === 'Completed' && 'bg-green-500/75',
												getGroupStatus(group) === 'In Progress' && 'bg-yellow-500',
												getGroupStatus(group) === 'Not Started' && 'bg-primary-foreground shadow'
											)}></div>
									)}
								</TabsTrigger>
							))}

						{selectedReviewType === 'summary' && (
							<>
								<TabsTrigger value="self_scoring" className="relative whitespace-nowrap">
									Self Scoring
								</TabsTrigger>
								<TabsTrigger value="manager_scoring" className="relative whitespace-nowrap">
									Manager Scoring
								</TabsTrigger>
							</>
						)}

						<div className="pointer-events-none absolute right-0 top-0 flex h-full w-24 items-center justify-end bg-gradient-to-r from-transparent to-muted pr-4">
							<ChevronRight size={14} />
						</div>
					</TabsList>
				</div>

				{activeTab === 'objectives' && (
					<TabsContent className="min-h-36 space-y-4" value="objectives">
						<div className="space-y-6">
							<div className="flex items-center justify-between">
								<h3 className="text-base font-medium">Objectives & Goals</h3>

								{selectedEmployee.id === contract.id && !isSelfReviewDueDatePassed && selectedReviewType === 'self' && (
									<Button
										onClick={() => {
											const newObjective: Objective = {
												id: crypto.randomUUID(),
												title: '',
												description: '',
												goals: []
											};
											updateObjectives([...objectives, newObjective]);
											setEditingObjective(newObjective);
										}}
										variant="outline"
										className="gap-2">
										<PlusIcon size={14} /> Add Objective
									</Button>
								)}
							</div>

							{objectives.map(objective => (
								<div key={objective.id} className="rounded-lg border p-4">
									<div className="mb-8">
										<div className="flex justify-between gap-4">
											<div>
												<h3 className="mb-1 text-xs font-light text-muted-foreground">objective:</h3>
												<h4 className="text-sm font-normal">{objective.title || 'Untitled Objective'}</h4>
											</div>

											{selectedEmployee.id === contract.id && !isSelfReviewDueDatePassed && selectedReviewType === 'self' && (
												<div className="flex gap-2">
													<Button
														variant="outline"
														size="sm"
														onClick={() => {
															const newGoal: Goal = {
																id: crypto.randomUUID(),
																title: '',
																description: ''
															};
															updateObjectives(objectives.map(obj => (obj.id === objective.id ? { ...obj, goals: [...obj.goals, newGoal] } : obj)));
															setEditingGoal({ objectiveId: objective.id, goal: newGoal });

															updateObjectivesScore([...objectivesScore, { goal_id: newGoal.id, score: 0, comment: '' }]);

															updateManagerObjectivesScore([...managerObjectivesScore, { goal_id: newGoal.id, score: 0, comment: '' }]);
														}}
														className="gap-2">
														<PlusIcon size={14} /> Add Goal
													</Button>

													<Button variant="outline" size="sm" onClick={() => setEditingObjective(objective)}>
														<Settings2 size={14} />
													</Button>

													<Button variant="secondary_destructive" size="sm" onClick={() => handleDeleteObjective(objective.id)} disabled={deletingObjective === objective.id}>
														{deletingObjective === objective.id ? <LoadingSpinner className="h-4 w-4" /> : <Trash2 size={14} />}
													</Button>
												</div>
											)}
										</div>

										<p className="mt-2 text-xs text-muted-foreground empty:hidden">{objective.description}</p>
									</div>

									{!!objective.goals.length && <h3 className="mb-1 text-xs font-light text-muted-foreground">goals:</h3>}
									{objective.goals.length > 0 && (
										<div className="space-y-2">
											{objective.goals.map(goal => (
												<div key={goal.id} className="rounded-md bg-muted p-3">
													<div className="flex items-center justify-between gap-4">
														<div className="space-y-1">
															<h5 className="text-sm font-light">{goal.title || 'Untitled Goal'}</h5>
															<p className="text-xs text-muted-foreground empty:hidden">{goal.description}</p>
														</div>

														<div className="flex gap-2">
															{selectedEmployee.id === contract.id && !isSelfReviewDueDatePassed && selectedReviewType === 'self' && (
																<>
																	<Button variant="ghost" size="sm" onClick={() => setEditingGoal({ objectiveId: objective.id, goal })}>
																		<Settings2 size={14} />
																	</Button>

																	<Button variant="ghost_destructive" size="sm" onClick={() => handleDeleteGoal(objective.id, goal.id)} disabled={deletingGoal === goal.id}>
																		{deletingGoal === goal.id ? <LoadingSpinner className="h-4 w-4" /> : <Trash2 size={14} />}
																	</Button>
																</>
															)}
														</div>
													</div>
												</div>
											))}
										</div>
									)}
								</div>
							))}

							{objectives.length === 0 && (
								<div className="mx-auto flex h-full min-h-44 w-full items-center justify-center rounded-lg border bg-muted">
									<p className="text-sm font-light text-muted-foreground">No objectives found</p>
								</div>
							)}
						</div>
					</TabsContent>
				)}

				{activeTab === 'goal_scoring' && (
					<TabsContent className="min-h-36 space-y-4" value="goal_scoring">
						<div className="space-y-6">
							<div className="flex items-center justify-between">
								<h3 className="text-base font-medium">Score {isSelectedEmplyeesManager ? `${(selectedEmployee.profile as any)?.first_name}'s` : 'Your'} Goals</h3>
								<div className="flex items-center gap-2">
									<Label htmlFor="enable-weights">Objective Weights</Label>
									<Switch
										id="enable-weights"
										checked={enableWeights}
										className="scale-75"
										onCheckedChange={checked => {
											setEnableWeights(checked);
											if (!checked) {
												// Reset weights when disabling
												const newObjectives = objectives.map(obj => ({ ...obj, weight: undefined }));
												updateObjectives(newObjectives);
											}
										}}
										disabled={selectedEmployee.id !== contract.id || isSelfReviewDueDatePassed}
									/>
								</div>
							</div>

							{enableWeights && (
								<div className="rounded-lg border bg-muted p-3">
									<p className="text-xs text-muted-foreground">
										Total Weight: {objectives.reduce((sum, obj) => sum + (obj.weight || 0), 0)}%{objectives.reduce((sum, obj) => sum + (obj.weight || 0), 0) !== 100 && <span className="ml-2 text-destructive">(Must equal 100%)</span>}
									</p>
								</div>
							)}

							{objectives.map(objective => (
								<div key={objective.id} className="rounded-lg border p-4">
									<div className="flex justify-between gap-6">
										<div>
											<h3 className="mb-1 text-xs font-light text-muted-foreground">objective:</h3>
											<h4 className="text-sm font-medium">{objective.title || 'Untitled Objective'}</h4>
										</div>

										{enableWeights && (
											<div className="flex h-fit items-center gap-2">
												<Label htmlFor={`weight-${objective.id}`} className="text-xs">
													Weight:
												</Label>
												<Input
													id={`weight-${objective.id}`}
													type="number"
													min="0"
													max="100"
													className="h-6 w-12 p-1 text-xs"
													value={objective.weight || ''}
													onChange={e => {
														const weight = parseInt(e.target.value) || 0;
														const newObjectives = objectives.map(obj => (obj.id === objective.id ? { ...obj, weight } : obj));
														updateObjectives(newObjectives);
													}}
													disabled={selectedEmployee.id !== contract.id || isSelfReviewDueDatePassed}
												/>
												<span className="text-xs text-muted-foreground">%</span>
											</div>
										)}
									</div>
									<p className="mb-6 mt-3 text-xs text-muted-foreground empty:hidden">{objective.description}</p>

									<div>
										<h3 className="mb-1 text-xs font-light text-muted-foreground">goals:</h3>

										<div className="space-y-8">
											{objective.goals.map(goal => {
												const goalScore = objectivesScore.find(score => score.goal_id === goal.id);
												const managerGoalScore = managerObjectivesScore.find(score => score.goal_id === goal.id);

												return (
													<div key={goal.id} className="space-y-7 rounded-md bg-muted p-3">
														<div className="space-y-2">
															<h5 className="text-sm font-normal">{goal.title || 'Untitled Goal'}</h5>
															<p className="text-xs text-muted-foreground empty:hidden">{goal.description}</p>
														</div>

														{selectedReviewType === 'self' && (
															<>
																<div className="flex h-fit items-center gap-6">
																	{['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'].map((score, index) => (
																		<div key={score} className="flex flex-col items-center gap-2">
																			<Button
																				disabled={selectedEmployee.id !== contract.id || isSelfReviewDueDatePassed}
																				variant={goalScore?.score === index + 1 ? 'default' : 'outline'}
																				className="disabled:opacity-100"
																				size="icon"
																				onClick={() => handleGoalScoreUpdate(goal.id, index + 1, '')}>
																				{index + 1}
																			</Button>
																			<div className="text-xs font-light text-muted-foreground">{score}</div>
																		</div>
																	))}
																</div>

																<div className="space-y-2">
																	<Textarea
																		placeholder="Add a comment about your score..."
																		disabled={selectedEmployee.id !== contract.id || isSelfReviewDueDatePassed}
																		value={goalScore?.comment || ''}
																		onChange={e => handleGoalScoreUpdate(goal.id, goalScore?.score || 0, e.target.value)}
																		className="col-span-2 min-h-[60px] w-full bg-background disabled:cursor-default disabled:opacity-100"
																	/>

																	<GoalFileUpload
																		updateGoalFile={file =>
																			updateObjectivesScore(prev => {
																				const newScores = prev.map(score =>
																					score.goal_id === goal.id
																						? {
																								...score,
																								filePath: file.filePath,
																								fileName: file.fileName
																							}
																						: score
																				);

																				autoSaveObjectivesScoreDebounced(newScores);
																				return newScores;
																			})
																		}
																		org={org}
																		goal={goalScore as GOAL_SCORE}
																		appraisalCycleId={appraisalCycle.id}
																		canView={((isSelectedEmplyeesManager && answer?.employee_submission_date !== null) || (selectedEmployee.id === contract.id && isSelfReviewDueDatePassed)) && !!goalScore?.filePath && !!goalScore?.fileName}
																		canUpload={selectedEmployee.id === contract.id && !isSelfReviewDueDatePassed}
																	/>
																</div>
															</>
														)}

														{selectedReviewType === 'manager' && (
															<>
																<div className="flex h-fit items-center gap-6">
																	{['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'].map((score, index) => (
																		<div key={score} className="flex flex-col items-center gap-2">
																			<Button
																				key={score}
																				variant={managerGoalScore?.score === index + 1 ? 'default' : 'outline'}
																				className="disabled:opacity-100"
																				disabled={!isSelectedEmplyeesManager || isManagerReviewDueDatePassed}
																				size="icon"
																				onClick={() => handleGoalScoreUpdate(goal.id, index + 1, '')}>
																				{index + 1}
																			</Button>
																			<div className="text-xs font-light text-muted-foreground">{score}</div>
																		</div>
																	))}
																</div>

																<div className="space-y-2">
																	<Textarea
																		placeholder="Add your feedback on this goal..."
																		disabled={!isSelectedEmplyeesManager}
																		value={managerGoalScore?.comment || ''}
																		onChange={e => handleGoalScoreUpdate(goal.id, managerGoalScore?.score || 0, e.target.value)}
																		className="col-span-2 min-h-[60px] w-full bg-background disabled:cursor-default disabled:opacity-100"
																	/>

																	<GoalFileUpload
																		updateGoalFile={file =>
																			updateManagerObjectivesScore(prev => {
																				const newScores = prev.map(score =>
																					score.goal_id === goal.id
																						? {
																								...score,
																								filePath: file.filePath,
																								fileName: file.fileName
																							}
																						: score
																				);

																				autoSaveObjectivesScoreDebounced(newScores);
																				return newScores;
																			})
																		}
																		org={org}
																		goal={managerGoalScore as GOAL_SCORE}
																		appraisalCycleId={appraisalCycle.id}
																		canView={(isSelectedEmplyeesManager || (selectedEmployee.id === contract.id && answer?.manager_submission_date !== null)) && !!managerGoalScore?.filePath && !!managerGoalScore?.fileName}
																		canUpload={isSelectedEmplyeesManager && !isManagerReviewDueDatePassed}
																	/>
																</div>
															</>
														)}
													</div>
												);
											})}
										</div>
									</div>
								</div>
							))}

							{objectives.length === 0 && (
								<div className="mx-auto flex h-full min-h-44 w-full items-center justify-center rounded-lg border bg-muted">
									<p className="text-sm font-light text-muted-foreground">No objective and goals found to score</p>
								</div>
							)}
						</div>
					</TabsContent>
				)}

				{questionGroups
					.filter(group => group !== 'objectives' && group !== 'goal_scoring')
					.map(group => {
						const canViewSelfAnswer = selectedEmployee.id === contract.id || answer?.employee_submission_date !== null;
						const canViewManagerAnswer = answer?.manager_submission_date !== null || isSelectedEmplyeesManager;
						const canEditSelfAnswer = selectedEmployee.id === contract.id && !isSelfReviewDueDatePassed;
						const canEditManagerAnswer = isManager && selectedEmployee.id !== contract.id && !isManagerReviewDueDatePassed && isSelectedEmplyeesManager;

						return (
							<TabsContent className="min-h-36 space-y-10" key={group} value={group}>
								{groupedQuestions[group].map(currentQuestion => {
									// Only render if the question should be shown for this employee's team
									if (!shouldShowQuestion(currentQuestion)) return null;

									return (
										<div key={currentQuestion.id} className="space-y-4">
											<div className="flex items-center gap-2">
												<h3 className="text-base font-medium">
													{selectedReviewType === 'manager' ? currentQuestion.manager_question : currentQuestion.question} {currentQuestion.required && <span className="text-red-500">*</span>}
												</h3>
												{currentQuestion.team_ids &&
													currentQuestion.team_ids.length > 0 &&
													currentQuestion.team_ids.map(teamId => (
														<Badge key={teamId} variant="secondary" className="max-h-6 px-2 text-xs">
															{teams?.find(team => team.id === teamId)?.name}
														</Badge>
													))}
											</div>

											{selectedReviewType === 'summary' ? (
												<div className="space-y-4">
													<div className="space-y-2 rounded-md bg-accent p-2">
														<h4 className="text-xs font-medium text-muted-foreground">Employee name ({selectedEmployee.job_title})</h4>
														{currentQuestion.type !== 'scale' && (answers[currentQuestion.id] ? <p className="text-sm font-light">{answers[currentQuestion.id]}</p> : <p className="text-sm font-light italic text-muted-foreground">No answer</p>)}
														{currentQuestion.type === 'scale' &&
															(answers[currentQuestion.id] ? (
																<div className="flex items-center gap-2">
																	{Array.from({ length: 5 }, (_, i) => (
																		<div key={i} className={cn('h-2 w-2 rounded-full', answers[currentQuestion.id] === i + 1 && 'bg-primary')} />
																	))}
																</div>
															) : (
																<p className="text-sm font-light italic text-muted-foreground">No answer</p>
															))}
													</div>

													<h3 className="text-base font-medium">
														{currentQuestion.question !== currentQuestion.manager_question && currentQuestion.manager_question} {currentQuestion.required && <span className="text-red-500">*</span>}
													</h3>
													<div className="space-y-2 rounded-md bg-accent p-2">
														<h4 className="text-xs font-medium text-muted-foreground">Managers name ({selectedEmployee.job_title})</h4>
														{managerAnswers[currentQuestion.id] ? <p className="text-sm font-light">{managerAnswers[currentQuestion.id]}</p> : <p className="text-sm font-light italic text-muted-foreground">No manager answer</p>}
													</div>
												</div>
											) : (
												<>
													{currentQuestion.type === 'textarea' && (
														<div className="relative">
															{canEditSelfAnswer && selectedReviewType === 'self' && currentQuestion.group !== 'private_manager_assessment' && (
																<Textarea
																	key={`self-${currentQuestion.id}-${answer?.id}`}
																	className="min-h-[100px] w-full rounded-md border p-2"
																	value={answers[currentQuestion.id] || ''}
																	onChange={e => handleAnswerChange(currentQuestion.id, e.target.value)}
																/>
															)}

															{canEditManagerAnswer && (selectedReviewType === 'manager' || currentQuestion.group === 'private_manager_assessment') && (
																<Textarea
																	key={`manager-${currentQuestion.id}-${answer?.id}`}
																	className="min-h-[100px] w-full rounded-md border p-2"
																	value={managerAnswers[currentQuestion.id] || ''}
																	onChange={e => handleAnswerChange(currentQuestion.id, e.target.value)}
																/>
															)}

															{!canEditSelfAnswer && canViewSelfAnswer && selectedReviewType === 'self' && (
																<Textarea
																	key={`view-self-${currentQuestion.id}-${answer?.id}`}
																	disabled={true}
																	readOnly
																	className="min-h-[100px] w-full rounded-md border p-2 disabled:cursor-default disabled:opacity-100"
																	value={answers[currentQuestion.id] || ''}
																/>
															)}
															{!canEditManagerAnswer && canViewManagerAnswer && selectedReviewType === 'manager' && (
																<Textarea
																	key={`view-manager-${currentQuestion.id}-${answer?.id}`}
																	disabled={true}
																	readOnly
																	className="min-h-[100px] w-full rounded-md border p-2 disabled:cursor-default disabled:opacity-100"
																	value={managerAnswers[currentQuestion.id] || ''}
																/>
															)}

															{savingStates[currentQuestion.id] && (
																<div className="absolute right-2 top-2">
																	<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
																</div>
															)}
														</div>
													)}

													{currentQuestion.type === 'yesno' && (
														<div className="flex items-center gap-2">
															<Button
																disabled={selectedReviewType === 'self' ? !canEditSelfAnswer || currentQuestion.group === 'private_manager_assessment' : !canEditManagerAnswer}
																variant={
																	selectedReviewType === 'self'
																		? answers[currentQuestion.id] === 'yes' && canViewSelfAnswer
																			? 'secondary_success'
																			: 'outline'
																		: managerAnswers[currentQuestion.id] === 'yes' && canViewManagerAnswer
																			? 'secondary_success'
																			: 'outline'
																}
																className={cn(
																	'disabled:opacity-100',
																	selectedReviewType === 'self'
																		? answers[currentQuestion.id] === 'yes' && canViewSelfAnswer
																			? 'border border-green-400'
																			: ''
																		: managerAnswers[currentQuestion.id] === 'yes' && canViewManagerAnswer
																			? 'border border-green-400'
																			: ''
																)}
																onClick={() => handleAnswerChange(currentQuestion.id, 'yes')}>
																Yes
															</Button>
															<Button
																disabled={selectedReviewType === 'self' ? !canEditSelfAnswer || currentQuestion.group === 'private_manager_assessment' : !canEditManagerAnswer}
																variant={
																	selectedReviewType === 'self'
																		? answers[currentQuestion.id] === 'no' && canViewSelfAnswer
																			? 'secondary_success'
																			: 'outline'
																		: managerAnswers[currentQuestion.id] === 'no' && canViewManagerAnswer
																			? 'secondary_success'
																			: 'outline'
																}
																className={cn(
																	'disabled:opacity-100',
																	selectedReviewType === 'self'
																		? answers[currentQuestion.id] === 'no' && canViewSelfAnswer
																			? 'border border-green-400'
																			: ''
																		: managerAnswers[currentQuestion.id] === 'no' && canViewManagerAnswer
																			? 'border border-green-400'
																			: ''
																)}
																onClick={() => handleAnswerChange(currentQuestion.id, 'no')}>
																No
															</Button>
														</div>
													)}

													{currentQuestion.type === 'scale' && (
														<div className="flex items-center gap-8">
															{[1, 2, 3, 4, 5].map(num => {
																const scaleLabels = Array.isArray(currentQuestion.scale_labels) ? currentQuestion.scale_labels : [];
																const labelObj = scaleLabels[num - 1];
																const isObj = labelObj && typeof labelObj === 'object' && !Array.isArray(labelObj);
																const label = isObj && typeof labelObj.label === 'string' && labelObj.label;
																const description = isObj && typeof labelObj.description === 'string' ? labelObj.description : undefined;

																return label ? (
																	<div className="flex flex-col items-center justify-center gap-2">
																		<Button
																			disabled={selectedReviewType === 'self' ? !canEditSelfAnswer || currentQuestion.group === 'private_manager_assessment' : !canEditManagerAnswer}
																			className={cn(
																				'disabled:opacity-100',
																				selectedReviewType === 'self'
																					? answers[currentQuestion.id] === num && canViewSelfAnswer
																						? 'border border-green-400'
																						: ''
																					: managerAnswers[currentQuestion.id] === num && canViewManagerAnswer
																						? 'border border-green-400'
																						: ''
																			)}
																			size="icon"
																			variant={
																				selectedReviewType === 'self'
																					? answers[currentQuestion.id] === num && canViewSelfAnswer
																						? 'secondary_success'
																						: 'outline'
																					: managerAnswers[currentQuestion.id] === num && canViewManagerAnswer
																						? 'secondary_success'
																						: 'outline'
																			}
																			onClick={() => handleAnswerChange(currentQuestion.id, num)}>
																			{num}
																		</Button>

																		<div className="flex items-center gap-2">
																			<div className="text-xs text-muted-foreground">{label}</div>
																			{description && (
																				<TooltipProvider key={num}>
																					<Tooltip>
																						<TooltipTrigger>
																							<Info size={12} className="text-muted-foreground" />
																						</TooltipTrigger>
																						<TooltipContent>
																							<div className="max-w-64 text-xs">{description}</div>
																						</TooltipContent>
																					</Tooltip>
																				</TooltipProvider>
																			)}
																		</div>
																	</div>
																) : (
																	<Button
																		disabled={selectedReviewType === 'self' ? !canEditSelfAnswer || currentQuestion.group === 'private_manager_assessment' : !canEditManagerAnswer}
																		className={cn(
																			'disabled:opacity-100',
																			selectedReviewType === 'self'
																				? answers[currentQuestion.id] === num && canViewSelfAnswer
																					? 'border border-green-400'
																					: ''
																				: managerAnswers[currentQuestion.id] === num && canViewManagerAnswer
																					? 'border border-green-400'
																					: ''
																		)}
																		size="icon"
																		key={num}
																		variant={
																			selectedReviewType === 'self'
																				? answers[currentQuestion.id] === num && canViewSelfAnswer
																					? 'secondary_success'
																					: 'outline'
																				: managerAnswers[currentQuestion.id] === num && canViewManagerAnswer
																					? 'secondary_success'
																					: 'outline'
																		}
																		onClick={() => handleAnswerChange(currentQuestion.id, num)}>
																		{num}
																	</Button>
																);
															})}
														</div>
													)}

													{currentQuestion.type === 'multiselect' && (
														<div className="flex flex-wrap gap-2">
															{currentQuestion.options?.map((option: string) => (
																<Button
																	key={option}
																	variant={
																		selectedReviewType === 'self'
																			? (answers[currentQuestion.id] as string[])?.includes(option) && canViewSelfAnswer
																				? 'secondary_success'
																				: 'outline'
																			: (managerAnswers[currentQuestion.id] as string[])?.includes(option) && canViewManagerAnswer
																				? 'secondary_success'
																				: 'outline'
																	}
																	className={cn(
																		'disabled:opacity-100',
																		selectedReviewType === 'self'
																			? (answers[currentQuestion.id] as string[])?.includes(option) && canViewSelfAnswer
																				? 'border border-green-400'
																				: ''
																			: (managerAnswers[currentQuestion.id] as string[])?.includes(option) && canViewManagerAnswer
																				? 'border border-green-400'
																				: ''
																	)}
																	onClick={() => {
																		if (selectedReviewType === 'self' ? isSelfReviewDueDatePassed : isManagerReviewDueDatePassed) return;
																		const currentAnswers = (selectedReviewType === 'self' ? answers[currentQuestion.id] || [] : managerAnswers[currentQuestion.id] || []) as string[];
																		const newAnswers = currentAnswers.length > 0 ? (currentAnswers.includes(option) ? currentAnswers.filter(a => a !== option) : [...currentAnswers, option]) : [option];
																		handleAnswerChange(currentQuestion.id, newAnswers);
																	}}
																	disabled={selectedReviewType === 'self' ? !canEditSelfAnswer || currentQuestion.group === 'private_manager_assessment' : !canEditManagerAnswer}>
																	{option}
																</Button>
															))}
														</div>
													)}
												</>
											)}
										</div>
									);
								})}
							</TabsContent>
						);
					})}
			</Tabs>

			<Separator className="!my-10" />

			<div className="flex justify-end gap-4">
				{/* {(selectedReviewType === 'self' && !isSelfReviewDueDatePassed) || (selectedReviewType === 'manager' && !isManagerReviewDueDatePassed) && ( */}
				<>
					<Button variant="secondary" className="gap-4" onClick={handlePrevious} disabled={questionGroups.indexOf(activeTab as QuestionGroup) === 0}>
						<ChevronLeft size={14} /> Previous{getPreviousGroupLabel(activeTab as QuestionGroup)}
					</Button>

					{(questionGroups.indexOf(activeTab as QuestionGroup) === questionGroups.length - 1 && (selectedReviewType === 'self' ? !isSelfReviewDueDatePassed && selectedEmployee.id === contract.id : isSelectedEmplyeesManager && !isManagerReviewDueDatePassed)) ||
					(questionGroups.indexOf(activeTab as QuestionGroup) + 1 == questionGroups.length - 1 &&
						questionGroups[questionGroups.indexOf(activeTab as QuestionGroup) + 1] === 'private_manager_assessment' &&
						(selectedReviewType === 'self' ? !isSelfReviewDueDatePassed : !isManagerReviewDueDatePassed && !isSelectedEmplyeesManager)) ? (
						<Button onClick={handleSubmit} className="gap-4">
							{isSubmitting ? 'Submitting...' : 'Submit Appraisal'} <Send size={14} />
						</Button>
					) : (
						<Button onClick={handleNext} className="gap-4" disabled={questionGroups.indexOf(activeTab as QuestionGroup) === questionGroups.length - 1}>
							Next {getNextGroupLabel(activeTab as QuestionGroup)}
							<ChevronRight size={14} />
						</Button>
					)}
				</>
				{/* )} */}
			</div>

			<AlertDialog open={!!editingObjective} onOpenChange={() => setEditingObjective(null)}>
				<AlertDialogContent>
					<AlertDialogHeader className="flex flex-row items-center justify-between">
						<AlertDialogTitle>{editingObjective?.id ? 'Edit Objective' : 'Add Objective'}</AlertDialogTitle>
						<AlertDialogCancel onClick={() => setEditingObjective(null)}>
							<X size={14} />
						</AlertDialogCancel>
					</AlertDialogHeader>

					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="title">Title</Label>
							<Input id="title" value={editingObjective?.title || ''} onChange={e => setEditingObjective(prev => (prev ? { ...prev, title: e.target.value } : null))} />
						</div>
						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea id="description" value={editingObjective?.description || ''} onChange={e => setEditingObjective(prev => (prev ? { ...prev, description: e.target.value } : null))} />
						</div>
					</div>

					<AlertDialogFooter className="flex items-center justify-between gap-2 sm:justify-between">
						{editingObjective?.id && (
							<Button
								variant="secondary_destructive"
								disabled={deletingObjective === editingObjective.id}
								onClick={() => {
									handleDeleteObjective(editingObjective.id);
									setEditingObjective(null);
								}}>
								{deletingObjective === editingObjective.id ? <LoadingSpinner /> : <Trash2 size={14} />}
							</Button>
						)}
						<Button
							variant="default"
							className="px-8"
							onClick={() => {
								updateObjectives(
									objectives.map(obj =>
										obj.id === editingObjective?.id
											? {
													...obj,
													title: editingObjective.title,
													description: editingObjective.description
												}
											: obj
									)
								);
								setEditingObjective(null);
							}}>
							Save
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog open={!!editingGoal} onOpenChange={() => setEditingGoal(null)}>
				<AlertDialogContent>
					<AlertDialogHeader className="flex flex-row items-center justify-between">
						<AlertDialogTitle>{editingGoal?.goal.id ? 'Edit Goal' : 'Add Goal'}</AlertDialogTitle>
						<AlertDialogCancel className="!m-0" onClick={() => setEditingGoal(null)}>
							<X size={14} />
						</AlertDialogCancel>
					</AlertDialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="goal-title">Title</Label>
							<Input
								id="goal-title"
								value={editingGoal?.goal.title || ''}
								onChange={e =>
									setEditingGoal(prev =>
										prev
											? {
													...prev,
													goal: {
														...prev.goal,
														title: e.target.value
													}
												}
											: null
									)
								}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="goal-description">Description</Label>
							<Textarea
								id="goal-description"
								value={editingGoal?.goal.description || ''}
								onChange={e =>
									setEditingGoal(prev =>
										prev
											? {
													...prev,
													goal: {
														...prev.goal,
														description: e.target.value
													}
												}
											: null
									)
								}
							/>
						</div>
					</div>

					<AlertDialogFooter className="flex items-center justify-between gap-2 sm:justify-between">
						{editingGoal?.goal.id && (
							<Button
								variant="secondary_destructive"
								disabled={deletingGoal === editingGoal.goal.id}
								onClick={() => {
									handleDeleteGoal(editingGoal.objectiveId, editingGoal.goal.id);
									setEditingGoal(null);
								}}>
								{deletingGoal === editingGoal.goal.id ? <LoadingSpinner /> : <Trash2 size={14} />}
							</Button>
						)}
						<Button
							variant="default"
							className="px-8"
							onClick={() => {
								if (!editingGoal) return;
								updateObjectives(
									objectives.map(obj =>
										obj.id === editingGoal.objectiveId
											? {
													...obj,
													goals: obj.goals.map(g =>
														g.id === editingGoal.goal.id
															? {
																	...g,
																	title: editingGoal.goal.title,
																	description: editingGoal.goal.description
																}
															: g
													)
												}
											: obj
									)
								);
								setEditingGoal(null);
							}}>
							Save
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};
