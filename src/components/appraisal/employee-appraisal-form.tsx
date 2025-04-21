import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Tables } from '@/type/database.types';
import { useEffect, useState } from 'react';
import { autoSaveAnswer, submitAppraisal } from '../appraisal-forms/appraisal.actions';
import { useRouter } from 'next/navigation';
import { Textarea } from '../ui/textarea';
import { useDebounce } from '@/hooks/use-debounce';
import { Loader2 } from 'lucide-react';

type QuestionGroup = 'growth_and_development' | 'company_values' | 'competencies' | 'private_manager_assessment';

interface GroupedQuestions {
	growth_and_development: Tables<'template_questions'>[];
	company_values: Tables<'template_questions'>[];
	competencies: Tables<'template_questions'>[];
	private_manager_assessment: Tables<'template_questions'>[];
}

type AnswersState = Record<number, any>;

interface Answer {
	question_id: number;
	answer: any;
	[key: string]: any;
}

interface Props {
	appraisalCycle: Tables<'appraisal_cycles'>;
	activeTab: string;
	setActiveTab: (tab: QuestionGroup) => void;
	answer?: Tables<'appraisal_answers'> | null;
	selectedReviewType: 'self' | 'manager';
	isManager: boolean;
	selectedEmployee: Tables<'contracts'>;
	contract: Tables<'contracts'>;
	isSelectedEmplyeesManager: boolean;
	org: string;
	setOpen: (open: boolean) => void;
	groupedQuestions: GroupedQuestions;
}

export const EmployeeAppraisalForm = ({ groupedQuestions, setOpen, org, appraisalCycle, activeTab, setActiveTab, answer, selectedReviewType, isManager, selectedEmployee, contract, isSelectedEmplyeesManager }: Props) => {
	const router = useRouter();
	const [currentGroup, setCurrentGroup] = useState<QuestionGroup>('growth_and_development');
	const [managerAnswers, setManagerAnswers] = useState<AnswersState>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [answers, setAnswers] = useState<AnswersState>({});
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [savingStates, setSavingStates] = useState<Record<number, boolean>>({});

	const currentQuestions = groupedQuestions[currentGroup];
	const currentQuestion = currentQuestions[currentQuestionIndex];
	const questionGroups = Object.keys(groupedQuestions) as QuestionGroup[];
	const [currentGroupIndex, setCurrentGroupIndex] = useState(questionGroups.indexOf(currentGroup));
	const isLastGroup = currentGroupIndex === questionGroups.length - 1;
	const isFirstQuestionInGroup = currentQuestionIndex === 0;
	const isLastQuestionInGroup = currentQuestionIndex === currentQuestions.length - 1;

	const isSelfReviewDueDatePassed = new Date(appraisalCycle.self_review_due_date) < new Date();
	const isManagerReviewDueDatePassed = new Date(appraisalCycle.manager_review_due_date) < new Date();

	const autoSaveAnswerDebounced = useDebounce(async (questionId: number, value: any) => {
		try {
			setSavingStates(prev => ({ ...prev, [questionId]: true }));

			const payload: Parameters<typeof autoSaveAnswer>[0] = {
				answerId: answer?.id,
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

			await savePromise;
		} catch (error) {
			console.error('Failed to auto-save answer:', error);
		} finally {
			setSavingStates(prev => ({ ...prev, [questionId]: false }));
		}
	}, 1000);

	const handleAnswerChange = (questionId: number, value: any) => {
		if (selectedReviewType === 'manager') {
			if (isManagerReviewDueDatePassed) {
				toast.error('Cannot update answers after manager review due date has passed');
				return;
			}

			if (!isManager) {
				toast.error('This section is only available for your team managers');
				return;
			}

			setManagerAnswers(prev => ({
				...prev,
				[questionId]: value
			}));

			autoSaveAnswerDebounced(questionId, value);
			return;
		}

		if (isManager && selectedReviewType && selectedEmployee.id !== contract.id) {
			toast.error('This section is only available for your team members');
			return;
		}

		if (isSelfReviewDueDatePassed) {
			toast.error('Cannot update answers after self review due date has passed');
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
				if (question.required && !answers[question.id]) {
					unanswered.push({ group: group as QuestionGroup, question });
				}
			});
		});

		return unanswered;
	};

	const handleSubmit = async () => {
		if (isSelfReviewDueDatePassed && selectedReviewType === 'self') {
			toast.error('Cannot submit appraisal after self review due date has passed');
			return;
		}

		const unansweredQuestions = getUnansweredRequiredQuestions();
		if (unansweredQuestions.length > 0) {
			toast.error('Your yet to answer some required questions.');
			return;
		}

		try {
			setIsSubmitting(true);

			if (selectedReviewType === 'manager') {
				const submitPromise = submitAppraisal({
					answerId: answer?.id,
					manager_answers: managerAnswers as any,
					manager_submission_date: new Date().toISOString(),
					status: 'manager_reviewed'
				});

				toast.promise(submitPromise, {
					loading: 'Submitting appraisal...',
					success: 'Appraisal submitted successfully',
					error: 'Failed to submit appraisal'
				});

				await submitPromise;
			} else {
				const submitPromise = submitAppraisal({
					answerId: answer?.id,
					answers: Object.entries(answers).map(([id, answer]) => ({
						question_id: Number(id),
						answer
					})),
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
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleNext = () => {
		if (isLastQuestionInGroup) {
			if (!isLastGroup) {
				// Move to next group
				setCurrentGroupIndex(currentGroupIndex + 1);
				const nextGroup = questionGroups[currentGroupIndex + 1];
				setCurrentGroup(nextGroup);
				setCurrentQuestionIndex(0);
				setActiveTab(nextGroup);
			}
		} else {
			setCurrentQuestionIndex(prev => prev + 1);
		}
	};

	const handlePrevious = () => {
		if (isFirstQuestionInGroup) {
			if (currentGroupIndex > 0) {
				// Move to previous group
				setCurrentGroupIndex(currentGroupIndex - 1);
				const prevGroup = questionGroups[currentGroupIndex - 1];
				setCurrentGroup(prevGroup);
				setCurrentQuestionIndex(groupedQuestions[prevGroup].length - 1);
				setActiveTab(prevGroup);
			}
		} else {
			setCurrentQuestionIndex(prev => prev - 1);
		}
	};

	const groupLabels: Record<QuestionGroup, string> = {
		growth_and_development: 'Growth & Development',
		company_values: 'Company Values',
		competencies: 'Competencies',
		private_manager_assessment: 'Manager Assessment'
	};

	const getGroupProgress = (group: QuestionGroup) => {
		const groupQuestions = groupedQuestions[group];
		const answeredCount = groupQuestions.filter((q: Tables<'template_questions'>) => (selectedReviewType === 'self' ? answers[q.id] : managerAnswers[q.id]) !== undefined && (selectedReviewType === 'self' ? answers[q.id] : managerAnswers[q.id]) !== '').length;
		return (answeredCount / groupQuestions.length) * 100;
	};

	const getGroupStatus = (group: QuestionGroup) => {
		const progress = getGroupProgress(group);
		if (progress === 100) return 'Completed';
		if (progress > 0) return 'In Progress';
		return 'Not Started';
	};

	useEffect(() => {
		const loadAnswers = () => {
			// Reset the appropriate state when no answers are available
			if (!answer || !answer[selectedReviewType === 'self' ? 'answers' : 'manager_answers']) return selectedReviewType === 'self' ? setAnswers({}) : setManagerAnswers({});

			const answers = answer[selectedReviewType === 'self' ? 'answers' : 'manager_answers'];

			const _answers = (answers as unknown as Answer[]).reduce((acc, curr) => {
				const value = curr.answer;
				if (Array.isArray(value)) {
					return { ...acc, [curr.question_id]: value };
				}
				if (typeof value === 'number') {
					return { ...acc, [curr.question_id]: value };
				}
				return { ...acc, [curr.question_id]: value || '' };
			}, {});

			// Use a callback to ensure we're working with the latest state
			selectedReviewType === 'self' ? setAnswers(_answers) : setManagerAnswers(_answers);
		};

		loadAnswers();
	}, [answer, selectedReviewType, selectedEmployee]);

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-10 space-y-6">
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

				{currentQuestion &&
					questionGroups.map(group => {
						const canViewSelfAnswer = selectedEmployee.id === contract.id;
						const canViewManagerAnswer = answer?.manager_submission_date !== null || isSelectedEmplyeesManager;
						const canEditSelfAnswer = selectedEmployee.id === contract.id && !isSelfReviewDueDatePassed;
						const canEditManagerAnswer = isManager && selectedEmployee.id !== contract.id && !isManagerReviewDueDatePassed && isSelectedEmplyeesManager;

						return (
							<TabsContent className="min-h-36 space-y-4" key={group} value={group}>
								<h3 className="text-base font-medium">
									{selectedReviewType === 'self' ? currentQuestion.question : currentQuestion.manager_question} {currentQuestion.required && <span className="text-red-500">*</span>}
								</h3>

								{/* <QuestionInput question={currentQuestion} /> */}
								{currentQuestion.type === 'textarea' && (
									<div className="relative">
										{canEditSelfAnswer && selectedReviewType === 'self' && (
											<Textarea
												key="self"
												className="min-h-[100px] w-full rounded-md border p-2"
												value={answers[currentQuestion.id]}
												autoFocus={true}
												onChange={e => handleAnswerChange(currentQuestion.id, e.target.value)}
												onKeyDown={e => {
													e.stopPropagation();
												}}
											/>
										)}

										{canEditManagerAnswer && selectedReviewType === 'manager' && (
											<Textarea
												key="manager"
												className="min-h-[100px] w-full rounded-md border p-2"
												value={managerAnswers[currentQuestion.id]}
												onChange={e => {
													e.preventDefault();
													e.stopPropagation();
													handleAnswerChange(currentQuestion.id, e.target.value);
												}}
											/>
										)}

										{!canEditSelfAnswer && canViewSelfAnswer && selectedReviewType === 'self' && <Textarea disabled={true} readOnly className="min-h-[100px] w-full rounded-md border p-2" defaultValue={answers[currentQuestion.id]} />}
										{!canEditManagerAnswer && canViewManagerAnswer && selectedReviewType === 'manager' && <Textarea disabled={true} readOnly className="min-h-[100px] w-full rounded-md border p-2" defaultValue={managerAnswers[currentQuestion.id]} />}

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
											disabled={selectedReviewType === 'self' ? !canEditSelfAnswer : !canEditManagerAnswer}
											variant={
												selectedReviewType === 'self' ? (answers[currentQuestion.id] === 'yes' && canViewSelfAnswer ? 'secondary_success' : 'outline') : managerAnswers[currentQuestion.id] === 'yes' && canViewManagerAnswer ? 'secondary_success' : 'outline'
											}
											onClick={() => handleAnswerChange(currentQuestion.id, 'yes')}>
											Yes
										</Button>
										<Button
											disabled={selectedReviewType === 'self' ? !canEditSelfAnswer : !canEditManagerAnswer}
											variant={
												selectedReviewType === 'self' ? (answers[currentQuestion.id] === 'no' && canViewSelfAnswer ? 'secondary_success' : 'outline') : managerAnswers[currentQuestion.id] === 'no' && canViewManagerAnswer ? 'secondary_success' : 'outline'
											}
											onClick={() => handleAnswerChange(currentQuestion.id, 'no')}>
											No
										</Button>
									</div>
								)}

								{currentQuestion.type === 'scale' && (
									<div className="flex items-center gap-2">
										{[1, 2, 3, 4, 5].map(num => (
											<Button
												disabled={selectedReviewType === 'self' ? !canEditSelfAnswer : !canEditManagerAnswer}
												key={num}
												variant={selectedReviewType === 'self' ? (answers[currentQuestion.id] === num && canViewSelfAnswer ? 'default' : 'outline') : managerAnswers[currentQuestion.id] === num && canViewManagerAnswer ? 'default' : 'outline'}
												onClick={() => handleAnswerChange(currentQuestion.id, num)}>
												{num}
											</Button>
										))}
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
															? 'default'
															: 'outline'
														: (managerAnswers[currentQuestion.id] as string[])?.includes(option) && canViewManagerAnswer
															? 'default'
															: 'outline'
												}
												onClick={() => {
													if (selectedReviewType === 'self' ? isSelfReviewDueDatePassed : isManagerReviewDueDatePassed) return;
													const currentAnswers = (selectedReviewType === 'self' ? answers[currentQuestion.id] : managerAnswers[currentQuestion.id]) as string[];
													const newAnswers = currentAnswers.includes(option) ? currentAnswers.filter(a => a !== option) : [...currentAnswers, option];
													handleAnswerChange(currentQuestion.id, newAnswers);
												}}
												disabled={selectedReviewType === 'self' ? !canEditSelfAnswer : !canEditManagerAnswer}>
												{option}
											</Button>
										))}
									</div>
								)}
							</TabsContent>
						);
					})}
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
		</div>
	);
};
