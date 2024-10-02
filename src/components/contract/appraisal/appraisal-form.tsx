'use client';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tables, TablesInsert } from '@/type/database.types';
import { updateAnswer } from './appraisal.actions';
import { toast } from 'sonner';
import { Clock, Save, SendHorizonal } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { add, format } from 'date-fns';
import { LoadingSpinner } from '@/components/ui/loader';
import { InputFields } from './appraisal-form-input-fields';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';

interface props {
	questions: Tables<'appraisal_questions'>[];
	contract: number;
	org: string;
	dbAnswer?: Tables<'appraisal_answers'>;
	appraisalStartDate: string;
	appraisal: number;
}

const answerType = z.object({ id: z.number(), answer: z.string().optional(), required: z.boolean() });

const formSchema = z.object({
	answers: answerType.array().refine(answers => !answers.filter(answer => answer.required && !answer.answer).length, { message: 'You must answer all required questions' }),
	note: z.string().optional(),
	score: z.number().max(100)
});

export const AppraisalForm = ({ questions, contract, org, dbAnswer, appraisalStartDate, appraisal }: props) => {
	const [answer, setAnswer] = useState(dbAnswer);
	const [isSaving, setSaveState] = useState(false);
	const [isSubmitting, setSubmitState] = useState(false);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			answers: answer
				? questions.map(question => {
						const questionsAnswer = (answer.answers as z.infer<typeof answerType>[]).find(ans => ans.id == question.id);
						return { answer: questionsAnswer?.answer || '', id: question.id, group: question.group, required: question.required };
					})
				: questions.map(question => ({ answer: '', id: question.id, group: question.group, required: question.required })),
			note: answer?.note || '',
			score: answer?.contract_score || 50
		}
	});

	const onSubmit = async (values: z.infer<typeof formSchema>, submit?: boolean) => {
		const payload: TablesInsert<'appraisal_answers'> = { answers: values.answers, org, contract, group: questions[0].group, appraisal, note: values.note, contract_score: values.score };
		if (submit) payload.submission_date = new Date().toISOString();
		if (answer) payload.id = answer.id;

		submit ? setSubmitState(true) : setSaveState(true);
		const response = await updateAnswer(payload);
		submit ? setSubmitState(false) : setSaveState(false);

		if (typeof response == 'string') return toast.error('Error updating appraisal', { description: response });

		toast.success(submit ? 'Appraisal submitted successfully' : 'Appraisal saved successfully');
		setAnswer(response[0]);
	};

	return (
		<Form {...form}>
			<Alert>
				<Clock size={14} className="stroke-muted-foreground" />
				<AlertTitle className="text-xs">Heads up!</AlertTitle>
				<AlertDescription className="text-xs font-light">You&apos;re required complete appraisal before {format(add(appraisalStartDate, { weeks: 2 }), 'PP')}</AlertDescription>
			</Alert>

			<form onSubmit={form.handleSubmit(value => onSubmit(value, false))} className="space-y-8">
				<FormField
					control={form.control}
					name={`answers`}
					render={() => (
						<FormItem className="space-y-10">
							{questions.map((question, index) => (
								<FormField
									control={form.control}
									key={question.id}
									name={`answers.${index}.answer`}
									render={({ field }) => (
										<FormItem className="space-y-3">
											<FormLabel>
												{question.required && <span className="mr-1 text-sm text-destructive">*</span>}
												{question.question}
											</FormLabel>
											<InputFields isSubmitted={!!answer?.submission_date} question={question} field={field} />
											<FormMessage />
										</FormItem>
									)}
								/>
							))}
							<FormMessage />
						</FormItem>
					)}
				/>

				<Separator />

				<div className="space-y-2">
					<h3 className="font-medium">Appraisal score</h3>
					<p className="text-xs text-muted-foreground">What will you score yourself for this appraisal period</p>
				</div>

				<div className="space-y-6">
					<FormField
						control={form.control}
						name="score"
						render={({ field }) => (
							<FormItem className="space-y-4">
								<FormLabel className="flex items-center justify-between">
									<div>
										<span className="mr-1 text-sm text-destructive">*</span>Score
									</div>

									<div className="font-medium text-foreground">{field.value} / 100</div>
								</FormLabel>

								<div>
									<FormControl>
										<Slider max={100} min={0} step={1} disabled={!!answer?.submission_date} onValueChange={value => field.onChange(value[0])} defaultValue={[field.value || 0]} />
									</FormControl>
									<div className="flex items-center justify-between text-[10px] text-muted-foreground">
										<div>0</div>
										<div>50</div>
										<div>100</div>
									</div>
								</div>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="note"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Note</FormLabel>
								<FormControl>
									<Textarea disabled={!!answer?.submission_date} placeholder="Enter appraisal note here" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<FormDescription>
					<span className="mr-1 text-sm text-destructive">* </span> Indicates required fields
				</FormDescription>

				<div className="flex items-center justify-end gap-4">
					<Button disabled={!!answer?.submission_date} className="w-full max-w-[90px] gap-3" variant={'outline'} type="submit">
						{isSaving && <LoadingSpinner />}
						Save
						<Save size={12} />
					</Button>

					<Button disabled={!!answer?.submission_date} className="w-full max-w-[130px] gap-3" onClick={form.handleSubmit(value => onSubmit(value, true))} type="button">
						{isSubmitting && <LoadingSpinner />}
						Submit
						<SendHorizonal size={12} />
					</Button>
				</div>
			</form>
		</Form>
	);
};
