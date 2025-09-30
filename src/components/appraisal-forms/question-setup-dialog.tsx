'use client';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, Text, SquareCheckBig, ChevronsUpDown, Check, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '../ui/badge';
import { Tables } from '@/type/database.types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MultiTargetSelect } from './multi-team-select';
import { ContractWithProfile } from '@/dal/interfaces/contract.repository.interface';

const questionSchema = z
	.object({
		id: z.string(),
		question: z.string(),
		managerQuestion: z.string().min(1, 'Manager question is required'),
		type: z.enum(['textarea', 'yesno', 'scale', 'multiselect']),
		options: z.array(z.string()).optional(),
		required: z.boolean(),
		teams: z.array(z.string()),
		employees: z.array(z.string()),
		group: z.enum(['growth_and_development', 'company_values', 'competencies', 'private_manager_assessment']),
		scaleLabels: z
			.array(
				z.object({
					label: z.string().optional(),
					description: z.string().optional()
				})
			)
			.optional()
	})
	.refine(
		data => {
			if (data.group !== 'private_manager_assessment') {
				return data.question.length > 0;
			}
			return true;
		},
		{
			message: 'Question is required',
			path: ['question']
		}
	);

type QuestionFormValues = z.infer<typeof questionSchema>;

const inputTypes = [
	{ type: 'textarea', label: 'Text', icon: <Text size={12} /> },
	{ type: 'yesno', label: 'Yes or No', icon: <Check size={12} /> },
	{ type: 'scale', label: 'Opinion Scale', icon: <SquareCheckBig size={12} /> },
	{ type: 'multiselect', label: 'Multiselect', icon: <SquareCheckBig size={12} /> }
];

interface QuestionSetupDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	question?: QuestionFormValues;
	onSave: (question: QuestionFormValues) => void;
	teams: Tables<'teams'>[];
	employees: ContractWithProfile[];
	group: QuestionFormValues['group'];
	customGroupName: string;
}

export const QuestionSetupDialog = ({ open, onOpenChange, question, onSave, teams, employees, group, customGroupName }: QuestionSetupDialogProps) => {
	const [isTypePopoverOpen, setIsTypePopoverOpen] = useState(false);
	const [showScaleLabels, setShowScaleLabels] = useState(question?.type === 'scale' && !!question?.scaleLabels && question?.scaleLabels.length > 0);

	const form = useForm<QuestionFormValues>({
		resolver: zodResolver(questionSchema),
		defaultValues: {
			id: question?.id || Math.random().toString(36).substr(2, 9),
			question: question?.question || '',
			managerQuestion: question?.managerQuestion || '',
			type: question?.type || group === 'competencies' || group === 'private_manager_assessment' ? 'scale' : 'textarea',
			options: question?.options || [],
			required: question?.required || true,
			teams: question?.teams || [],
			employees: question?.employees || [],
			group: group,
			scaleLabels: question?.scaleLabels && question?.scaleLabels.length === 5 ? question.scaleLabels : Array(5).fill({ label: '', description: '' })
		}
	});

	useEffect(() => {
		if (question) {
			form.reset({
				id: question.id,
				question: question.question,
				managerQuestion: question.managerQuestion,
				type: question.type,
				options: question.options || [],
				required: question.required,
				teams: question.teams,
				employees: question.employees,
				group: group,
				scaleLabels: question.scaleLabels && question.scaleLabels.length === 5 ? question.scaleLabels : Array(5).fill({ label: '', description: '' })
			});
			setShowScaleLabels(question.type === 'scale' && !!question.scaleLabels && question.scaleLabels.length > 0);
		} else {
			form.reset({
				id: Math.random().toString(36).substr(2, 9),
				question: '',
				managerQuestion: '',
				type: group === 'competencies' || group === 'private_manager_assessment' ? 'scale' : 'textarea',
				options: [],
				required: false,
				teams: [],
				employees: [],
				group: group,
				scaleLabels: Array(5).fill({ label: '', description: '' })
			});
			setShowScaleLabels(false);
		}
	}, [question, form, group]);

	useEffect(() => {
		if (!open) {
			form.reset({
				id: Math.random().toString(36).substr(2, 9),
				question: '',
				managerQuestion: '',
				type: group === 'competencies' || group === 'private_manager_assessment' ? 'scale' : 'textarea',
				options: [],
				required: false,
				teams: [],
				employees: [],
				group: group,
				scaleLabels: Array(5).fill({ label: '', description: '' })
			});
			setShowScaleLabels(false);
		}
	}, [open, form, group]);

	const onSubmit = (values: QuestionFormValues) => {
		onSave(values);
		if (!question) {
			form.reset({
				id: Math.random().toString(36).substr(2, 9),
				question: '',
				managerQuestion: '',
				type: group === 'competencies' || group === 'private_manager_assessment' ? 'scale' : 'textarea',
				options: [],
				required: false,
				teams: [],
				employees: [],
				group: group,
				scaleLabels: Array(5).fill({ label: '', description: '' })
			});
			setShowScaleLabels(false);
		}
		onOpenChange(false);
	};

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent className="flex h-screen max-w-full flex-col overflow-y-auto">
				<AlertDialogHeader className="mx-auto w-full max-w-2xl pt-16 text-left">
					<AlertDialogTitle className="flex items-center justify-between gap-2">
						{question ? 'Edit Question' : 'Add Question'}
						<Badge variant="secondary" className="text-xs">
							{customGroupName ||
								group
									.split('_')
									.map(word => word.charAt(0).toUpperCase() + word.slice(1))
									.join(' ')}
						</Badge>
					</AlertDialogTitle>
					<AlertDialogDescription>Add question details and settings below.</AlertDialogDescription>
				</AlertDialogHeader>

				<Form {...form}>
					<form className="mx-auto flex w-full max-w-2xl flex-col space-y-6 py-4">
						{group !== 'private_manager_assessment' && (
							<FormField
								control={form.control}
								name="question"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Self Review Question</FormLabel>
										<FormControl>
											<Input {...field} placeholder="Enter question for self review" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						<FormField
							control={form.control}
							name="managerQuestion"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Manager Review Question</FormLabel>
									<FormControl>
										<Input {...field} placeholder="Enter question for manager review" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Separator />

						<FormField
							control={form.control}
							name="type"
							render={({ field }) => {
								const isScaleOnlyGroup = group === 'competencies';

								return (
									<FormItem>
										<FormLabel>Select question type</FormLabel>

										<Popover open={isTypePopoverOpen} onOpenChange={setIsTypePopoverOpen}>
											<PopoverTrigger asChild>
												<FormControl>
													<Button variant="outline" type="button" className="w-full justify-between">
														{inputTypes.find(t => t.type === field.value)?.label}
														{!isScaleOnlyGroup && <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
													</Button>
												</FormControl>
											</PopoverTrigger>

											<PopoverContent align="start" className="w-[200px] p-0">
												<Command>
													<CommandList>
														<CommandGroup>
															{inputTypes
																.filter(t => isScaleOnlyGroup && (t.type === 'scale' || t.type === 'yesno'))
																.map(inputType => (
																	<CommandItem
																		key={inputType.type}
																		onSelect={() => {
																			field.onChange(inputType.type);
																			if (inputType.type !== 'multiselect') {
																				form.setValue('options', []);
																			}
																			if (inputType.type === 'scale') {
																				setShowScaleLabels(false);
																				form.setValue('scaleLabels', Array(5).fill({ label: '', description: '' }));
																			}
																			if (inputType.type !== 'scale') {
																				setShowScaleLabels(false);
																			}
																			if (inputType.type === 'multiselect' && !form.getValues('options')?.length) {
																				form.setValue('options', ['Option 1']);
																			}
																			setIsTypePopoverOpen(false);
																		}}>
																		<Check className={cn('mr-2 h-4 w-4', field.value === inputType.type ? 'opacity-100' : 'opacity-0')} />
																		{inputType.label}
																	</CommandItem>
																))}
														</CommandGroup>
													</CommandList>
												</Command>
											</PopoverContent>
										</Popover>

										<FormMessage />
									</FormItem>
								);
							}}
						/>

						<FormField
							control={form.control}
							name="required"
							render={({ field }) => (
								<FormItem className="!mb-5 !mt-10 flex items-center justify-between gap-2 space-y-0 rounded-3xl bg-accent p-4">
									<FormLabel>Required?</FormLabel>
									<FormControl>
										<Switch checked={field.value} onCheckedChange={field.onChange} className="scale-75" />
									</FormControl>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="teams"
							render={({ field: teamField }) => (
								<FormField
									control={form.control}
									name="employees"
									render={({ field: empField }) => (
										<FormItem>
											<FormLabel>Teams & Employees</FormLabel>
											<FormControl>
												<MultiTargetSelect
													teams={teams}
													employees={employees}
													value={[...teamField.value.map((id: string) => 'team-' + id), ...empField.value.map((id: string) => 'emp-' + id)]}
													onChange={ids => {
														const newTeams = ids.filter(id => id.startsWith('team-')).map(id => id.replace('team-', ''));
														const newEmployees = ids.filter(id => id.startsWith('emp-')).map(id => id.replace('emp-', ''));
														teamField.onChange(newTeams);
														empField.onChange(newEmployees);
													}}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}
						/>

						{/* Scale Labels Config */}
						{form.watch('type') === 'scale' && (
							<>
								<Separator />

								<div className="space-y-2">
									<div className="mb-3 flex items-center gap-2">
										<Label htmlFor="show-scale-labels">Set custom scale labels & descriptions</Label>
										<Switch
											checked={showScaleLabels}
											onCheckedChange={checked => {
												setShowScaleLabels(checked);
												if (!checked) {
													form.setValue('scaleLabels', Array(5).fill({ label: '', description: '' }));
												}
											}}
											id="show-scale-labels"
											className="scale-75"
										/>
									</div>

									{showScaleLabels && (
										<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
											{[1, 2, 3, 4, 5].map((num, idx) => (
												<div key={num} className="flex flex-col gap-2 rounded-md border bg-muted/30 p-3">
													<Label>Scale {num}</Label>
													<Input
														placeholder={`Label for ${num}`}
														value={(form.watch('scaleLabels') ?? [])[idx]?.label ?? ''}
														onChange={e => {
															const newLabels = [...(form.getValues('scaleLabels') || Array(5).fill({ label: '', description: '' }))];
															newLabels[idx] = { ...newLabels[idx], label: e.target.value };
															form.setValue('scaleLabels', newLabels);
														}}
													/>
													<Textarea
														placeholder={`Description for ${num}`}
														value={(form.watch('scaleLabels') ?? [])[idx]?.description ?? ''}
														onChange={e => {
															const newLabels = [...(form.getValues('scaleLabels') || Array(5).fill({ label: '', description: '' }))];
															newLabels[idx] = { ...newLabels[idx], description: e.target.value };
															form.setValue('scaleLabels', newLabels);
														}}
													/>
												</div>
											))}
										</div>
									)}
								</div>
							</>
						)}

						{form.watch('type') === 'multiselect' && (
							<FormField
								control={form.control}
								name="options"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Options</FormLabel>
										<div className="space-y-2">
											{field.value?.map((option, index) => (
												<div key={index} className="flex items-center gap-2">
													<Input
														value={option}
														onChange={e => {
															const newOptions = [...(field.value || [])];
															newOptions[index] = e.target.value;
															field.onChange(newOptions);
														}}
														placeholder="Enter option"
													/>
													<Button
														variant="ghost"
														type="button"
														size="icon"
														onClick={() => {
															const newOptions = [...(field.value || [])];
															newOptions.splice(index, 1);
															field.onChange(newOptions);
														}}>
														<X className="h-4 w-4" />
													</Button>
												</div>
											))}
											<Button variant="outline" type="button" onClick={() => field.onChange([...(field.value || []), 'New Option'])} className="w-full">
												<Plus className="mr-2 h-4 w-4" />
												Add Option
											</Button>
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						<QuestionPreview question={form.watch('question')} scaleLabels={form.watch('scaleLabels')} managerQuestion={form.watch('managerQuestion')} type={form.watch('type')} options={form.watch('options')} />

						<Separator className="!mt-8" />

						<div className="mx-auto flex w-full max-w-2xl justify-end gap-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									form.reset({
										id: Math.random().toString(36).substr(2, 9),
										question: '',
										managerQuestion: '',
										type: 'textarea',
										options: [],
										required: false,
										teams: [],
										employees: [],
										group: group,
										scaleLabels: Array(5).fill({ label: '', description: '' })
									});
									setShowScaleLabels(false);
									onOpenChange(false);
								}}>
								Close
							</Button>

							<Button type="button" onClick={form.handleSubmit(onSubmit)}>
								{question ? 'Save Changes' : 'Add Question'}
							</Button>
						</div>
					</form>
				</Form>
			</AlertDialogContent>
		</AlertDialog>
	);
};

const QuestionPreview = ({ question, managerQuestion, type, options, scaleLabels }: { question: string; managerQuestion: string; type: QuestionFormValues['type']; options?: string[]; scaleLabels?: { label?: string; description?: string }[] }) => {
	const renderInput = () => {
		switch (type) {
			case 'textarea':
				return <Textarea readOnly placeholder="Enter your response here..." className="pointer-events-none min-h-[100px] bg-background" disabled />;
			case 'yesno':
				return (
					<div className="flex gap-4">
						<Button variant="outline" type="button" className="pointer-events-none flex-1">
							Yes
						</Button>
						<Button variant="outline" type="button" className="pointer-events-none flex-1">
							No
						</Button>
					</div>
				);
			case 'scale':
				return (
					<div className="flex items-center gap-6">
						{[1, 2, 3, 4, 5].map(value => {
							const labelObj = scaleLabels?.[value - 1] || {};
							const label = (labelObj as { label: string }).label;
							const description = (labelObj as { description: string }).description;

							return label ? (
								<div className="flex flex-col items-center justify-center gap-2">
									<Button variant="outline" className="pointer-events-none" type="button" size="icon">
										{value}
									</Button>

									<div className="flex items-center gap-2">
										<div className="text-xs text-muted-foreground">{label}</div>

										{description && (
											<TooltipProvider key={value}>
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
								<Button key={value} variant="outline" type="button" size="icon" className="pointer-events-none">
									{value}
								</Button>
							);
						})}
					</div>
				);
			case 'multiselect':
				return (
					<div className="space-y-2">
						{options?.map((option, i) => (
							<div key={i} className="flex items-center gap-2">
								<Button variant="outline" type="button" className="pointer-events-none w-full justify-start">
									{option}
								</Button>
							</div>
						))}
					</div>
				);
			default:
				return null;
		}
	};

	return (
		(question || managerQuestion) && (
			<>
				<Accordion type="single" collapsible className="w-full">
					<AccordionItem value="preview" className="border-none">
						<AccordionTrigger className="text-sm font-light">Question Preview</AccordionTrigger>

						<AccordionContent>
							<div className="!mt-2 rounded-lg bg-accent p-4">
								<div className="space-y-10">
									{question && (
										<div className="space-y-5">
											<div className="mb-2 flex items-center gap-2">
												<Label className="leading-6 text-primary">
													{question} <Badge variant="outline">self review</Badge>
												</Label>
											</div>
											{renderInput()}
										</div>
									)}

									{managerQuestion && (
										<div className="space-y-5">
											<div className="mb-2 flex items-center gap-2">
												<Label className="leading-6 text-primary">
													{managerQuestion} <Badge variant="outline">manager review</Badge>
												</Label>
											</div>
											{renderInput()}
										</div>
									)}
								</div>
							</div>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</>
		)
	);
};
