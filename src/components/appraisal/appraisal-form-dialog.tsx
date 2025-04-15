'use client';

import { Tables } from '@/type/database.types';
import { AlertDialog, AlertDialogContent } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { debounce } from 'lodash';
import { getTemplateQuestions, autoSaveAnswer, submitAppraisal } from '../appraisal-forms/appraisal.actions';
import { useDebounce } from '@/hooks/use-debounce';

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

export const AppraisalFormDialog = ({ org, contract, appraisalCycle, answer }: Props) => {
	const [open, setOpen] = useState(false);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [answers, setAnswers] = useState<Record<number, any>>(answer?.answers ? (answer.answers as unknown as Answer[]).reduce((acc, curr) => ({ ...acc, [curr.question_id]: curr.answer }), {}) : {});
	const [questions, setQuestions] = useState<Tables<'template_questions'>[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	const currentQuestion = questions[currentQuestionIndex];

	const autoSaveAnswerDebounced = useDebounce(async (questionId: number, value: any) => {
		try {
			await autoSaveAnswer({
				answerId: answer?.id,
				questionId,
				value,
				org,
				appraisalCycleId: appraisalCycle.id,
				contractId: contract.id,
				managerContractId: contract.direct_report
			});
		} catch (error) {
			console.error('Failed to auto-save answer:', error);
		}
	}, 1000);

	useEffect(() => {
		const fetchQuestions = async () => {
			try {
				setIsLoading(true);
				const fetchedQuestions = await getTemplateQuestions({ org, templateId: appraisalCycle.question_template });
				setQuestions(fetchedQuestions);
			} catch (error) {
				console.error('Failed to fetch questions:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchQuestions();
	}, [appraisalCycle.question_template, org]);

	const handleAnswerChange = (questionId: number, value: any) => {
		setAnswers(prev => ({
			...prev,
			[questionId]: value
		}));
		autoSaveAnswerDebounced(questionId, value);
	};

	const handleSubmit = async () => {
		try {
			await submitAppraisal({
				answerId: answer?.id,
				appraisalCycleId: appraisalCycle.id,
				contractId: contract.id,
				managerContractId: contract.direct_report,
				org,
				answers: Object.entries(answers).map(([questionId, answer]) => ({
					question_id: Number(questionId),
					answer
				}))
			});
			router.refresh();
			setOpen(false);
		} catch (error) {
			console.error('Failed to submit appraisal:', error);
		}
	};

	if (isLoading || !questions.length) {
		return (
			<Button variant="outline" onClick={() => setOpen(true)}>
				{answer?.submission_date ? 'View' : 'Continue'}
			</Button>
		);
	}

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<Button variant="outline" onClick={() => setOpen(true)}>
				{answer?.submission_date ? 'View' : 'Continue'}
			</Button>

			<AlertDialogContent className="max-w-3xl">
				<div className="space-y-6">
					<div className="space-y-2">
						<h2 className="text-lg font-semibold">{appraisalCycle.name}</h2>
						<Progress value={(currentQuestionIndex / questions.length) * 100} />
						<p className="text-sm text-muted-foreground">
							Question {currentQuestionIndex + 1} of {questions.length}
						</p>
					</div>

					<div className="space-y-4">
						<h3 className="text-base font-medium">{currentQuestion.question}</h3>

						{currentQuestion.type === 'textarea' && <textarea className="min-h-[100px] w-full rounded-md border p-2" value={answers[currentQuestion.id] || ''} onChange={e => handleAnswerChange(currentQuestion.id, e.target.value)} />}

						{currentQuestion.type === 'scale' && (
							<div className="flex items-center gap-2">
								{[1, 2, 3, 4, 5].map(num => (
									<Button key={num} variant={answers[currentQuestion.id] === num ? 'default' : 'outline'} onClick={() => handleAnswerChange(currentQuestion.id, num)}>
										{num}
									</Button>
								))}
							</div>
						)}

						{currentQuestion.type === 'multiselect' && currentQuestion.options && (
							<div className="space-y-2">
								{currentQuestion.options.map(option => (
									<label key={option} className="flex items-center gap-2">
										<input
											type="checkbox"
											checked={answers[currentQuestion.id]?.includes(option) || false}
											onChange={e => {
												const currentAnswers = answers[currentQuestion.id] || [];
												const newAnswers = e.target.checked ? [...currentAnswers, option] : currentAnswers.filter((a: string) => a !== option);
												handleAnswerChange(currentQuestion.id, newAnswers);
											}}
										/>
										{option}
									</label>
								))}
							</div>
						)}
					</div>

					<div className="flex justify-between">
						<Button variant="outline" onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))} disabled={currentQuestionIndex === 0}>
							Previous
						</Button>

						{currentQuestionIndex === questions.length - 1 ? <Button onClick={handleSubmit}>Submit</Button> : <Button onClick={() => setCurrentQuestionIndex(prev => prev + 1)}>Next</Button>}
					</div>
				</div>
			</AlertDialogContent>
		</AlertDialog>
	);
};
