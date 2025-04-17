'use client';

import { Tables } from '@/type/database.types';
import { AlertDialog, AlertDialogContent } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTemplateQuestions, autoSaveAnswer, submitAppraisal } from '../appraisal-forms/appraisal.actions';
import { useDebounce } from '@/hooks/use-debounce';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '../ui/textarea';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';

interface Props {
	org: string;
	contract: Tables<'contracts'>;
	appraisalCycle: Tables<'appraisal_cycles'>;
	answer?: Tables<'appraisal_answers'>;
}

interface Answer {
	question_id: number;
	answer: any;
	[key: string]: any;
}

type QuestionGroup = 'growth_and_development' | 'company_values' | 'competencies' | 'private_manager_assessment';

interface GroupedQuestions {
	growth_and_development: Tables<'template_questions'>[];
	company_values: Tables<'template_questions'>[];
	competencies: Tables<'template_questions'>[];
	private_manager_assessment: Tables<'template_questions'>[];
}

type AnswersState = Record<number, any>;

export const AppraisalFormDialog = ({ org, contract, appraisalCycle, answer }: Props) => {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [groupedQuestions, setGroupedQuestions] = useState<GroupedQuestions>({
		growth_and_development: [],
		company_values: [],
		competencies: [],
		private_manager_assessment: []
	});
	const [answers, setAnswers] = useState<AnswersState>(() => {
		if (!answer?.answers) return {};
		return (answer.answers as unknown as Answer[]).reduce((acc, curr) => {
			const value = curr.answer;
			if (Array.isArray(value)) {
				return { ...acc, [curr.question_id]: value };
			}
			if (typeof value === 'number') {
				return { ...acc, [curr.question_id]: value };
			}
			return { ...acc, [curr.question_id]: value || '' };
		}, {});
	});
	const [currentGroup, setCurrentGroup] = useState<QuestionGroup>('growth_and_development');
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [activeTab, setActiveTab] = useState<QuestionGroup>('growth_and_development');
	const [isLoading, setIsLoading] = useState(true);
	const [savingStates, setSavingStates] = useState<Record<number, boolean>>({});
	const isSelfReviewDueDatePassed = new Date(appraisalCycle.self_review_due_date) < new Date();

	const currentQuestions = groupedQuestions[currentGroup];
	const currentQuestion = currentQuestions[currentQuestionIndex];

	// Get all question groups in order
	const questionGroups = Object.keys(groupedQuestions) as QuestionGroup[];
	const currentGroupIndex = questionGroups.indexOf(currentGroup);
	const isLastGroup = currentGroupIndex === questionGroups.length - 1;
	const isFirstQuestionInGroup = currentQuestionIndex === 0;
	const isLastQuestionInGroup = currentQuestionIndex === currentQuestions.length - 1;

	const autoSaveAnswerDebounced = useDebounce(async (questionId: number, value: any) => {
		try {
			setSavingStates(prev => ({ ...prev, [questionId]: true }));
			const savePromise = autoSaveAnswer({
				answerId: answer?.id,
				questionId,
				value,
				org,
				appraisalCycleId: appraisalCycle.id,
				contractId: contract.id,
				managerContractId: contract.direct_report
			});

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

	const handleAnswerChange = (questionId: number, value: any) => {
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
		if (isSelfReviewDueDatePassed) {
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
			const submitPromise = submitAppraisal({
				answerId: answer?.id,
				answers: Object.entries(answers).map(([questionId, answer]) => ({
					question_id: Number(questionId),
					answer
				}))
			});

			toast.promise(submitPromise, {
				loading: 'Submitting appraisal...',
				success: 'Appraisal submitted successfully',
				error: 'Failed to submit appraisal'
			});

			await submitPromise;
			router.refresh();
			setOpen(false);
		} catch (error) {
			console.error('Failed to submit appraisal:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleNext = () => {
		if (isLastQuestionInGroup) {
			if (!isLastGroup) {
				// Move to next group
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
				const prevGroup = questionGroups[currentGroupIndex - 1];
				setCurrentGroup(prevGroup);
				setCurrentQuestionIndex(groupedQuestions[prevGroup].length - 1);
				setActiveTab(prevGroup);
			}
		} else {
			setCurrentQuestionIndex(prev => prev - 1);
		}
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

	const groupLabels: Record<QuestionGroup, string> = {
		growth_and_development: 'Growth & Development',
		company_values: 'Company Values',
		competencies: 'Competencies',
		private_manager_assessment: 'Manager Assessment'
	};

	const getGroupProgress = (group: QuestionGroup) => {
		const groupQuestions = groupedQuestions[group];
		const answeredCount = groupQuestions.filter((q: Tables<'template_questions'>) => answers[q.id] !== undefined && answers[q.id] !== '').length;
		return (answeredCount / groupQuestions.length) * 100;
	};

	const getGroupStatus = (group: QuestionGroup) => {
		const progress = getGroupProgress(group);
		if (progress === 100) return 'Completed';
		if (progress > 0) return 'In Progress';
		return 'Not Started';
	};

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<Button className={cn(new Date(appraisalCycle.end_date) < new Date() && !answer && 'hidden')} onClick={() => setOpen(true)}>
				{(new Date(appraisalCycle.end_date) < new Date() && answer) || answer?.employee_submission_date ? 'Review Appraisal' : answer?.status === 'draft' ? 'Continue Appraisal' : 'Start Appraisal'}
			</Button>

			<AlertDialogContent className="max-w-3xl">
				<div className="space-y-6">
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
									{currentQuestion.question} {currentQuestion.required && <span className="text-red-500">*</span>}
								</h3>

								{currentQuestion.type === 'textarea' && (
									<div className="relative">
										<Textarea disabled={isSelfReviewDueDatePassed} className="min-h-[100px] w-full rounded-md border p-2" value={answers[currentQuestion.id] || ''} onChange={e => handleAnswerChange(currentQuestion.id, e.target.value)} />
										{savingStates[currentQuestion.id] && (
											<div className="absolute right-2 top-2">
												<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
											</div>
										)}
									</div>
								)}

								{currentQuestion.type === 'yesno' && (
									<div className="flex items-center gap-2">
										<Button disabled={isSelfReviewDueDatePassed} variant={answers[currentQuestion.id] === 'yes' ? 'secondary_success' : 'outline'} onClick={() => handleAnswerChange(currentQuestion.id, 'yes')}>
											Yes
										</Button>
										<Button disabled={isSelfReviewDueDatePassed} variant={answers[currentQuestion.id] === 'no' ? 'secondary_success' : 'outline'} onClick={() => handleAnswerChange(currentQuestion.id, 'no')}>
											No
										</Button>
									</div>
								)}

								{currentQuestion.type === 'scale' && (
									<div className="flex items-center gap-2">
										{[1, 2, 3, 4, 5].map(num => (
											<Button disabled={isSelfReviewDueDatePassed} key={num} variant={answers[currentQuestion.id] === num ? 'default' : 'outline'} onClick={() => handleAnswerChange(currentQuestion.id, num)}>
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
												variant={(answers[currentQuestion.id] as string[])?.includes(option) ? 'default' : 'outline'}
												onClick={() => {
													if (isSelfReviewDueDatePassed) return;
													const currentAnswers = (answers[currentQuestion.id] as string[]) || [];
													const newAnswers = currentAnswers.includes(option) ? currentAnswers.filter(a => a !== option) : [...currentAnswers, option];
													handleAnswerChange(currentQuestion.id, newAnswers);
												}}
												disabled={isSelfReviewDueDatePassed}>
												{option}
											</Button>
										))}
									</div>
								)}
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
				</div>
			</AlertDialogContent>
		</AlertDialog>
	);
};
