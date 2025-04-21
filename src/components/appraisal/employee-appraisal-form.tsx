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
	selectedReviewType: 'self' | 'manager' | 'summary';
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
	const shouldShowQuestion = (question: Tables<'template_questions'>) => {
		// If no team_ids specified, show to all
		if (!question.team_ids || question.team_ids.length === 0) {
			// For private_manager_assessment, only show to managers
			if (question.group === 'private_manager_assessment') {
				return isManager;
			}
			return true;
		}

		// Check if employee's team is in the allowed teams
		return question.team_ids.includes(selectedEmployee.team || 0);
	};

	const filteredQuestions = currentQuestions.filter(shouldShowQuestion);
	const currentQuestion = filteredQuestions[currentQuestionIndex];
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
		const filteredQuestions = currentQuestions.filter(shouldShowQuestion);
		if (currentQuestionIndex === filteredQuestions.length - 1) {
			if (!isLastGroup) {
				// Move to next group
				const nextGroupIndex = currentGroupIndex + 1;
				const nextGroup = questionGroups[nextGroupIndex];

				// Skip private_manager_assessment if not a manager
				if (nextGroup === 'private_manager_assessment' && !isSelectedEmplyeesManager) {
					// If this is the last group they can access, show submit button
					if (nextGroupIndex + 1 >= questionGroups.length) {
						return;
					}
					setCurrentGroupIndex(nextGroupIndex + 1);
					setCurrentGroup(questionGroups[nextGroupIndex + 1]);
					setCurrentQuestionIndex(0);
					setActiveTab(questionGroups[nextGroupIndex + 1]);
				} else {
					setCurrentGroupIndex(nextGroupIndex);
					setCurrentGroup(nextGroup);
					setCurrentQuestionIndex(0);
					setActiveTab(nextGroup);
				}
			}
		} else {
			setCurrentQuestionIndex(prev => prev + 1);
		}
	};

	const handlePrevious = () => {
		const filteredQuestions = currentQuestions.filter(shouldShowQuestion);
		if (currentQuestionIndex === 0) {
			if (currentGroupIndex > 0) {
				// Move to previous group
				const prevGroupIndex = currentGroupIndex - 1;
				const prevGroup = questionGroups[prevGroupIndex];

				// Skip private_manager_assessment if not a manager
				if (prevGroup === 'private_manager_assessment' && !isSelectedEmplyeesManager) {
					if (prevGroupIndex - 1 >= 0) {
						setCurrentGroupIndex(prevGroupIndex - 1);
						setCurrentGroup(questionGroups[prevGroupIndex - 1]);
						const prevGroupQuestions = groupedQuestions[questionGroups[prevGroupIndex - 1]].filter(shouldShowQuestion);
						setCurrentQuestionIndex(prevGroupQuestions.length - 1);
						setActiveTab(questionGroups[prevGroupIndex - 1]);
					}
				} else {
					setCurrentGroupIndex(prevGroupIndex);
					setCurrentGroup(prevGroup);
					const prevGroupQuestions = groupedQuestions[prevGroup].filter(shouldShowQuestion);
					setCurrentQuestionIndex(prevGroupQuestions.length - 1);
					setActiveTab(prevGroup);
				}
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

	useEffect(() => {
		const loadAnswers = () => {
			// Reset the appropriate state when no answers are available
			if (!answer || !answer[selectedReviewType === 'self' ? 'answers' : 'manager_answers']) return selectedReviewType === 'self' ? setAnswers({}) : setManagerAnswers({});

			const answers = answer['answers'];
			const managerAnswers = answer['manager_answers'];

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

			const _managerAnswers = (managerAnswers as unknown as Answer[]).reduce((acc, curr) => {
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
			setAnswers(_answers);
			setManagerAnswers(_managerAnswers);
		};

		loadAnswers();
	}, [answer, selectedReviewType, selectedEmployee]);

	const isLastAccessibleGroup = () => {
		if (isLastGroup) return true;
		const nextGroupIndex = currentGroupIndex + 1;
		return nextGroupIndex < questionGroups.length && questionGroups[nextGroupIndex] === 'private_manager_assessment' && !isSelectedEmplyeesManager;
	};

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col">
			<div className="mb-4 flex items-center justify-between">
				<h2 className="text-2xl font-semibold">{appraisalCycle.name}</h2>
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
					{questionGroups
						.filter(group => {
							// Show all tabs except private_manager_assessment to non-managers
							if (group === 'private_manager_assessment') {
								return isSelectedEmplyeesManager;
							}
							return true;
						})
						.map(group => (
							<TabsTrigger key={group} value={group} className="relative whitespace-nowrap">
								{groupLabels[group]}

								{selectedReviewType !== 'summary' && (
									<div className={cn('ml-2 h-1 w-6 rounded-md', getGroupStatus(group) === 'Completed' && 'bg-green-500/75', getGroupStatus(group) === 'In Progress' && 'bg-yellow-500', getGroupStatus(group) === 'Not Started' && 'bg-primary-foreground')}></div>
								)}
							</TabsTrigger>
						))}
				</TabsList>

				<div className="space-y-4">
					{selectedReviewType !== 'summary' && <Progress value={getGroupProgress(currentGroup)} className="h-1" />}
					<p className="flex items-center gap-2 text-xs text-muted-foreground">
						<span>{groupLabels[currentGroup]}</span> •
						<span>
							Question {currentQuestionIndex + 1} of {filteredQuestions.length}
						</span>
					</p>
				</div>

				{currentQuestion &&
					questionGroups.map(group => {
						const canViewSelfAnswer = selectedEmployee.id === contract.id;
						const canViewManagerAnswer = answer?.manager_submission_date !== null || isSelectedEmplyeesManager;
						const canEditSelfAnswer = selectedEmployee.id === contract.id && !isSelfReviewDueDatePassed;
						const canEditManagerAnswer = isManager && selectedEmployee.id !== contract.id && !isManagerReviewDueDatePassed && isSelectedEmplyeesManager;

						// Only render if the question should be shown for this employee's team
						if (!shouldShowQuestion(currentQuestion)) return null;

						// For private_manager_assessment, only show manager questions
						const showManagerQuestion = currentQuestion.group === 'private_manager_assessment' || selectedReviewType === 'manager';
						const questionText = showManagerQuestion ? currentQuestion.manager_question : currentQuestion.question;

						return (
							<TabsContent className="min-h-36 space-y-4" key={group} value={group}>
								<h3 className="text-base font-medium">
									{questionText} {currentQuestion.required && <span className="text-red-500">*</span>}
								</h3>

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

												{canEditManagerAnswer && (selectedReviewType === 'manager' || currentQuestion.group === 'private_manager_assessment') && (
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

												{!canEditSelfAnswer && canViewSelfAnswer && selectedReviewType === 'self' && currentQuestion.group !== 'private_manager_assessment' && (
													<Textarea disabled={true} readOnly className="min-h-[100px] w-full rounded-md border p-2" defaultValue={answers[currentQuestion.id]} />
												)}
												{!canEditManagerAnswer && canViewManagerAnswer && (selectedReviewType === 'manager' || currentQuestion.group === 'private_manager_assessment') && (
													<Textarea disabled={true} readOnly className="min-h-[100px] w-full rounded-md border p-2" defaultValue={managerAnswers[currentQuestion.id]} />
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
													onClick={() => handleAnswerChange(currentQuestion.id, 'no')}>
													No
												</Button>
											</div>
										)}

										{currentQuestion.type === 'scale' && (
											<div className="flex items-center gap-2">
												{[1, 2, 3, 4, 5].map(num => (
													<Button
														disabled={selectedReviewType === 'self' ? !canEditSelfAnswer || currentQuestion.group === 'private_manager_assessment' : !canEditManagerAnswer}
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
														disabled={selectedReviewType === 'self' ? !canEditSelfAnswer || currentQuestion.group === 'private_manager_assessment' : !canEditManagerAnswer}>
														{option}
													</Button>
												))}
											</div>
										)}
									</>
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
							{currentQuestionIndex === 0 && currentGroupIndex > 0 ? `Previous: ${groupLabels[questionGroups[currentGroupIndex - 1]]}` : 'Previous question'}
						</Button>

						{currentQuestionIndex === filteredQuestions.length - 1 && isLastAccessibleGroup() ? (
							<Button onClick={handleSubmit}>{isSubmitting ? 'Submitting...' : 'Submit Appraisal'}</Button>
						) : (
							<Button onClick={handleNext}>{currentQuestionIndex === filteredQuestions.length - 1 ? `Next: ${groupLabels[questionGroups[currentGroupIndex + 1]]}` : 'Next question'}</Button>
						)}
					</>
				)}
			</div>
		</div>
	);
};
