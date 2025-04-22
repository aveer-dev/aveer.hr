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
import { MultiTeamSelect } from '@/components/ui/multi-team-select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const questionSchema = z.object({
	id: z.string(),
	question: z.string().min(1, 'Question is required'),
	managerQuestion: z.string().min(1, 'Manager question is required'),
	type: z.enum(['textarea', 'yesno', 'scale', 'multiselect']),
	options: z.array(z.string()).optional(),
	required: z.boolean(),
	teams: z.array(z.string()),
	group: z.enum(['growth_and_development', 'company_values', 'competencies', 'private_manager_assessment'])
});

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
	group: QuestionFormValues['group'];
}

export const QuestionSetupDialog = ({ open, onOpenChange, question, onSave, teams, group }: QuestionSetupDialogProps) => {
	const [isTypePopoverOpen, setIsTypePopoverOpen] = useState(false);

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
			group: group
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
				group: group
			});
		} else {
			form.reset({
				id: Math.random().toString(36).substr(2, 9),
				question: '',
				managerQuestion: '',
				type: group === 'competencies' || group === 'private_manager_assessment' ? 'scale' : 'textarea',
				options: [],
				required: false,
				teams: [],
				group: group
			});
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
				group: group
			});
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
				group: group
			});
		}
		onOpenChange(false);
	};

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent className="flex h-screen max-w-full flex-col overflow-y-auto p-0">
				<AlertDialogHeader className="mx-auto w-full max-w-2xl pt-16">
					<AlertDialogTitle className="flex items-center justify-between gap-2">
						{question ? 'Edit Question' : 'Add Question'}
						<Badge variant="secondary" className="text-xs">
							{group
								.split('_')
								.map(word => word.charAt(0).toUpperCase() + word.slice(1))
								.join(' ')}
						</Badge>
					</AlertDialogTitle>
					<AlertDialogDescription>Configure your question settings</AlertDialogDescription>
				</AlertDialogHeader>

				<Form {...form}>
					<form className="mx-auto flex w-full max-w-2xl flex-col space-y-6 py-4">
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

						<div className="flex items-center justify-between">
							<FormField
								control={form.control}
								name="type"
								render={({ field }) => {
									const isScaleOnlyGroup = group === 'competencies' || group === 'private_manager_assessment';

									return (
										<FormItem className="flex items-center gap-2">
											<Popover open={isTypePopoverOpen} onOpenChange={setIsTypePopoverOpen}>
												<PopoverTrigger asChild>
													<FormControl>
														<Button variant="outline" className="w-fit justify-between" disabled={isScaleOnlyGroup}>
															{inputTypes.find(t => t.type === field.value)?.label}
															{!isScaleOnlyGroup && <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
														</Button>
													</FormControl>
												</PopoverTrigger>

												<PopoverContent align="start" className="w-[200px] p-0">
													<Command>
														<CommandList>
															<CommandGroup>
																{inputTypes.map(inputType => (
																	<CommandItem
																		key={inputType.type}
																		onSelect={() => {
																			field.onChange(inputType.type);
																			if (inputType.type !== 'multiselect') {
																				form.setValue('options', []);
																			} else if (!form.getValues('options')?.length) {
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

											{isScaleOnlyGroup && (
												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger className="!mt-0">
															<Info size={12} className="text-muted-foreground" />
														</TooltipTrigger>

														<TooltipContent>
															<p className="text-xs">
																Scale type is required for{' '}
																{group
																	.split('_')
																	.map(word => word.charAt(0).toUpperCase() + word.slice(1))
																	.join(' ')}{' '}
																questions
															</p>
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>
											)}
											<FormMessage />
										</FormItem>
									);
								}}
							/>

							<FormField
								control={form.control}
								name="required"
								render={({ field }) => (
									<FormItem className="flex items-center gap-2">
										<FormLabel>Required</FormLabel>
										<FormControl>
											<Switch checked={field.value} onCheckedChange={field.onChange} className="scale-75" />
										</FormControl>
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="teams"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Teams</FormLabel>
									<FormControl>
										<MultiTeamSelect teams={teams} value={field.value} onChange={field.onChange} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

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
											<Button variant="outline" onClick={() => field.onChange([...(field.value || []), 'New Option'])} className="w-full">
												<Plus className="mr-2 h-4 w-4" />
												Add Option
											</Button>
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						<QuestionPreview question={form.watch('question')} managerQuestion={form.watch('managerQuestion')} type={form.watch('type')} options={form.watch('options')} />

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
										group: group
									});
									onOpenChange(false);
								}}>
								Cancel
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

const QuestionPreview = ({ question, managerQuestion, type, options }: { question: string; managerQuestion: string; type: QuestionFormValues['type']; options?: string[] }) => {
	const renderInput = () => {
		switch (type) {
			case 'textarea':
				return <Textarea readOnly placeholder="Enter your response here..." className="pointer-events-none min-h-[100px] bg-background" disabled />;
			case 'yesno':
				return (
					<div className="flex gap-4">
						<Button variant="outline" className="pointer-events-none flex-1">
							Yes
						</Button>
						<Button disabled variant="outline" className="pointer-events-none flex-1">
							No
						</Button>
					</div>
				);
			case 'scale':
				return (
					<div className="flex justify-between">
						{[1, 2, 3, 4, 5].map(value => (
							<div key={value} className="flex flex-col items-center gap-1">
								<Button variant="outline" size="sm" className="pointer-events-none h-8 w-8 rounded-full">
									{value}
								</Button>
							</div>
						))}
					</div>
				);
			case 'multiselect':
				return (
					<div className="space-y-2">
						{options?.map((option, i) => (
							<div key={i} className="flex items-center gap-2">
								<Button variant="outline" className="pointer-events-none w-full justify-start">
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
