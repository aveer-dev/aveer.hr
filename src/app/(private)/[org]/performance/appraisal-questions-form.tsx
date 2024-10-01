'use client';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ReactNode, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Calendar, Check, ChevronDown, ChevronsUpDown, ChevronUp, CircleCheckBig, CircleMinus, Clock, FileUp, Hash, Plus, SquareCheckBig, Text, TextCursorInputIcon, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card } from '@/components/ui/card';
import { FORM_INPUT_TYPE } from '@/type/performance.types';
import { TablesInsert } from '@/type/database.types';
import { createQuestions, deleteQuestion } from './appraisal.actions';
import { LoadingSpinner } from '@/components/ui/loader';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const inputType = z.enum(['text', 'number', 'textarea', 'multiselect', 'select', 'date', 'time', 'file']);

interface INPUT_TYPE {
	type: z.infer<typeof inputType>;
	label: string;
	icon: ReactNode;
}

const inputTypes: INPUT_TYPE[] = [
	{ type: 'text', label: 'Text', icon: <TextCursorInputIcon size={12} /> },
	{ type: 'number', label: 'Number', icon: <Hash size={12} /> },
	{ type: 'textarea', label: 'Textarea', icon: <Text size={12} /> },
	{ type: 'multiselect', label: 'Mutiselect', icon: <SquareCheckBig size={12} /> },
	{ type: 'select', label: 'select', icon: <CircleCheckBig size={12} /> },
	{ type: 'date', label: 'Date', icon: <Calendar size={12} /> },
	{ type: 'time', label: 'Time', icon: <Clock size={12} /> },
	{ type: 'file', label: 'File', icon: <FileUp size={12} /> }
];

const q = z
	.object({
		question: z.string().min(2),
		options: z.string().min(2).array().optional(),
		type: inputType,
		isTypeOpen: z.boolean().optional(),
		required: z.boolean().optional(),
		id: z.number().optional(),
		isDeleting: z.boolean().optional()
	})
	.refine(
		question => {
			if (question.type !== 'select' && question.type !== 'multiselect') return true;
			return question.options && question.options.length > 0;
		},
		{ message: 'Provide at least one option' }
	);

const formSchema = z.object({ q: q.array() });

interface props {
	org: string;
	isOptional?: boolean;
	questionsData?: z.infer<typeof formSchema>;
	group: string;
}

export const AppraisalQuestionsForm = ({ questionsData, org, isOptional, group }: props) => {
	const [questions, updateQuestions] = useState<z.infer<typeof formSchema>>(questionsData && questionsData.q?.length > 0 ? (questionsData as any) : { q: [] });
	const [showAddOptions, toggleShowAddOptions] = useState(false);
	const [isFormEnabled, toggleFormState] = useState(false);
	const [isCreatingQuestions, creationsState] = useState(false);
	const router = useRouter();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: questionsData && questionsData.q?.length > 0 ? (questionsData as any) : {}
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		const payload: TablesInsert<'appraisal_questions'>[] = values.q.map(question => ({
			question: question.question,
			options: question.options && question.options.length > 0 ? question.options : [],
			org,
			type: question.type,
			required: question.required,
			group,
			id: question.id
		}));

		creationsState(true);
		const response = await createQuestions(payload);
		creationsState(false);
		if (typeof response == 'string') return toast.error('Error creating / updating questions', { description: response });

		toast.success('Questions updated');
		console.log({ q: response as any });
		updateQuestions({ q: (response as any[]).sort((a, b) => a.id - b.id) });
	};

	const AddQuestionButton = ({ children, className, type }: { children: ReactNode; className: string; type: FORM_INPUT_TYPE }) => {
		const add = () => {
			const newItem: any = { question: '', type };
			if (type == 'select' || type == 'multiselect') newItem.options = ['Option one'];

			questions.q.push(newItem);
			updateQuestions({ ...questions });

			const formValues = form.getValues(`q`) || [];
			formValues.push(newItem);
			form.setValue(`q`, formValues);
			console.log(form.getValues());
		};

		return (
			<Button
				type="button"
				onClick={add}
				variant={'outline'}
				className={cn('group gap-2 hover:border-green-200 hover:bg-green-50/60 hover:text-green-500 focus:border-green-200 focus:bg-green-50/60 focus:text-green-500 focus:ring-green-300 focus-visible:ring-green-300', className)}>
				<Plus size={12} />
				<Separator className="group-hover:bg-green-200" orientation="vertical" />
				{children}
			</Button>
		);
	};

	const addOption = (questionIndex: number) => {
		const newItem: any = '';

		questions.q[questionIndex].options?.push(newItem);
		updateQuestions({ ...questions });

		form.setValue(`q.${questionIndex}.options`, [...(form.getValues(`q.${questionIndex}.options`) || []), newItem]);
	};

	const InputType = ({ className, input, hideLabel, iconFirst }: { input?: INPUT_TYPE; className?: string; hideLabel?: boolean; iconFirst?: boolean }) => {
		return input ? (
			<div className={cn('flex items-center gap-4', className)}>
				{!hideLabel && <span className={cn(iconFirst ? 'order-2' : 'order-1')}>{input.label}</span>} <span className={cn(iconFirst ? 'order-1' : 'order-2')}>{input.icon}</span>
			</div>
		) : (
			''
		);
	};

	const onChangeInputType = (value: FORM_INPUT_TYPE, index: number) => {
		form.setValue(`q.${index}.type`, value);
		questions.q[index].type = value;
		updateQuestions({ ...questions });

		// close options
		questions.q[index].isTypeOpen = false;
		updateQuestions({ ...questions });

		// reset options based on selected type
		if (value == 'multiselect' || value == 'select') {
			const options = ['Option one'];
			questions.q[index].options = options;
			updateQuestions({ ...questions });
			form.setValue(`q.${index}.options`, options);
			return;
		}

		questions.q[index].options = [];
		updateQuestions({ ...questions });
		form.setValue(`q.${index}.options`, []);
	};

	const onDeleteOption = async (index: number, questionIndex: number) => {
		if (!questions.q[questionIndex].options) return;

		const options = form.getValues(`q.${questionIndex}.options`);
		if (!options) return;

		questions.q[questionIndex].options.splice(index, 1);
		updateQuestions({ ...questions });

		options.splice(index, 1);
		form.setValue(`q.${questionIndex}.options`, options);
	};

	const onDeleteQuestion = async (index: number) => {
		const formQuestions = form.getValues();
		questions.q[index].isDeleting = true;
		updateQuestions({ ...questions });

		if (formQuestions.q[index].id) {
			const res = await deleteQuestion({ org, id: formQuestions.q[index].id });
			if (res !== true) return toast.error('Unable to delete question', { description: res });
			router.refresh();
		}

		questions.q.splice(index, 1);
		updateQuestions({ ...questions });

		formQuestions.q.splice(index, 1);
		form.reset(formQuestions);
	};

	return (
		<Form {...form}>
			{isOptional && (
				<Card className="flex h-fit flex-row items-center justify-between border-none bg-accent px-4 py-2">
					<p className="text-xs">Enable</p>
					<Switch className="scale-75" checked={isFormEnabled} onCheckedChange={toggleFormState} />
				</Card>
			)}

			{((isOptional && isFormEnabled) || !isOptional) && (
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
					{questions.q?.map((question, index) => (
						<FormField
							control={form.control}
							key={index}
							name={`q.${index}`}
							render={() => (
								<FormItem className="space-y-8">
									<div className="flex gap-2">
										<FormField
											control={form.control}
											key={index}
											name={`q.${index}.question`}
											render={({ field }) => (
												<FormItem className="w-full">
													<FormLabel className="flex min-h-6 items-center">Question</FormLabel>
													<FormControl className="">
														<Input placeholder="Enter question here" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name={`q.${index}.type`}
											render={() => (
												<FormItem className="flex flex-col">
													<div className="text-right">
														<Button type="button" onClick={() => onDeleteQuestion(index)} variant={'ghost_destructive'} className="h-5 w-5 p-0">
															{!question.isDeleting && <Trash2 size={12} />}
															{question.isDeleting && <LoadingSpinner className="text-destructive" />}
														</Button>
													</div>
													<Popover
														open={question.isTypeOpen}
														onOpenChange={state => {
															questions.q[index].isTypeOpen = state;
															updateQuestions({ ...questions });
														}}>
														<PopoverTrigger asChild>
															<FormControl>
																<Button type="button" variant="outline" role="combobox" className={cn('w-fit justify-between', !form.getValues(`q.${index}.type`) && 'text-muted-foreground')}>
																	<InputType hideLabel input={inputTypes.find(inputType => inputType.type === form.getValues(`q.${index}.type`))} />
																	<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
																</Button>
															</FormControl>
														</PopoverTrigger>
														<PopoverContent align="end" className="w-[150px] p-0">
															<Command>
																<CommandList>
																	<CommandGroup>
																		{inputTypes.map(inputType => (
																			<CommandItem value={inputType.type} key={inputType.type} onSelect={() => onChangeInputType(inputType.type, index)}>
																				<Check size={12} className={cn('mr-2', inputType.type === form.getValues(`q.${index}.type`) ? 'opacity-100' : 'opacity-0')} />
																				<InputType iconFirst input={inputType} />
																			</CommandItem>
																		))}
																	</CommandGroup>
																</CommandList>
															</Command>
														</PopoverContent>
													</Popover>

													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									{(question.type == 'multiselect' || question.type == 'select') && (
										<>
											{question.options && question.options.length > 0 && (
												<ul className="space-y-4">
													{question.options.map((_option, idx) => (
														<FormField
															control={form.control}
															key={idx}
															name={`q.${index}.options.${idx}`}
															render={({ field }) => (
																<FormItem className="w-full">
																	<li className="flex items-center gap-2">
																		<Checkbox className={cn(question.type == 'select' && 'rounded-full', 'disabled:cursor-default disabled:opacity-35')} disabled />
																		<FormControl className="">
																			<Input aria-label="option" placeholder="Enter option here" {...field} />
																		</FormControl>

																		<Button type="button" onClick={() => onDeleteOption(idx, index)} variant={'ghost_destructive'} className="h-6 w-6 p-0">
																			<CircleMinus size={12} />
																		</Button>
																	</li>
																	<FormMessage />
																</FormItem>
															)}
														/>
													))}
												</ul>
											)}

											<Button type="button" className="w-full gap-2" variant={'outline'} onClick={() => addOption(index)}>
												<Plus size={12} /> Add option
											</Button>
										</>
									)}

									<FormMessage />

									<FormField
										control={form.control}
										name={`q.${index}.required`}
										render={({ field }) => (
											<FormItem className="flex flex-row items-center justify-between">
												<FormLabel className="w-full">Required question</FormLabel>
												<FormControl>
													<Switch className="!m-0 scale-75" checked={field.value} onCheckedChange={field.onChange} />
												</FormControl>
											</FormItem>
										)}
									/>

									{index !== questions.q.length - 1 && <Separator className="mt-10" />}
								</FormItem>
							)}
						/>
					))}

					{(!questions.q || questions.q?.length == 0) && (
						<div className="flex h-36 w-full items-center justify-center rounded-md bg-accent/60">
							<p className="text-xs text-muted-foreground">No appraisal question added yet</p>
						</div>
					)}

					<Separator />

					<div>
						<div className="mb-4 flex items-center justify-between">
							<h3 className="text-sm">Add question field</h3>

							<Button type="button" onClick={() => toggleShowAddOptions(!showAddOptions)} variant={'ghost'} className="h-6 w-6 p-0">
								{!showAddOptions && <ChevronDown size={12} />}
								{showAddOptions && <ChevronUp size={12} />}
							</Button>
						</div>

						<div className={cn('no-scrollbar flex w-full max-w-[27.5rem] gap-4 overflow-x-auto', showAddOptions && 'flex-wrap')}>
							{inputTypes.map(inputType => (
								<AddQuestionButton key={inputType.type} type={inputType.type} className="group">
									{inputType.label} {inputType.icon}
								</AddQuestionButton>
							))}
						</div>
					</div>

					<Button type="submit" className="w-full gap-3" disabled={isCreatingQuestions}>
						{isCreatingQuestions && <LoadingSpinner />} Save changes
					</Button>
				</form>
			)}
		</Form>
	);
};
