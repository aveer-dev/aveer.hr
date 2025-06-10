'use client';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Grip, Settings2, Trash2, Loader2, Pencil } from 'lucide-react';
import { useState, useCallback, useEffect, useRef } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Tables } from '@/type/database.types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { QuestionSetupDialog } from './question-setup-dialog';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createQuestionTemplate, updateQuestionTemplate, createTemplateQuestions, updateTemplateQuestions, getTemplateQuestions, deleteQuestionTemplate } from './appraisal.actions';
import { Separator } from '../ui/separator';
import { Label } from '../ui/label';
import { LoadingSpinner } from '../ui/loader';
import { DeleteTemplateDialog } from './delete-template-dialog';
import { useDebounce } from '@/hooks/use-debounce';
import { Badge } from '@/components/ui/badge';
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

const templateSchema = z.object({
	name: z.string().min(1, 'Template name is required'),
	description: z.string().optional(),
	is_draft: z.boolean(),
	questions: z.array(questionSchema),
	custom_group_names: z.array(z.object({ id: z.string(), name: z.string() })).optional()
});

type QuestionFormValues = z.infer<typeof questionSchema>;
type TemplateFormValues = z.infer<typeof templateSchema>;

interface QuestionTemplateDialogProps {
	children: React.ReactNode;
	onSave?: () => void;
	teams: Tables<'teams'>[];
	employees: ContractWithProfile[];
	template?: Tables<'question_templates'>;
	template_questions?: Tables<'template_questions'>[];

	org: string;
}

interface QuestionItemProps {
	question: QuestionFormValues;
	onEdit: () => void;
	onRemove: () => void;
	teams: Tables<'teams'>[];
	employees: ContractWithProfile[];
}

const QuestionItem = ({ question, onEdit, onRemove, teams, employees }: QuestionItemProps) => {
	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: question.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition
	};

	return (
		<div ref={setNodeRef} style={style} className="flex gap-4">
			<div className="flex flex-col items-center justify-between gap-4">
				<Button type="button" {...attributes} {...listeners} variant={'ghost'} className="h-6 w-6 p-0">
					<Grip className="h-3 w-3" />
				</Button>

				<div className="flex flex-col items-center gap-2">
					<Button variant="ghost" type="button" size="icon" onClick={onEdit} className="h-6 w-6 p-0">
						<Settings2 className="h-3 w-3" />
					</Button>

					<Button variant="ghost_destructive" type="button" size="icon" onClick={onRemove} className="h-6 w-6 p-0">
						<Trash2 className="h-3 w-3" />
					</Button>
				</div>
			</div>

			<div className="flex w-full items-center gap-6 rounded-lg border p-4">
				<div className="flex-1 space-y-4">
					<div className="space-y-4">
						{question.question && (
							<div className="space-y-4">
								<div className="text-sm font-light leading-6">
									<div className="mb-2 flex items-center justify-between gap-2 text-xs font-light text-muted-foreground">
										<div>Self review question</div>

										<div className="flex items-center gap-2">
											{question.teams.map(teamId => (
												<Badge key={teamId} variant="outline" className="text-xs">
													{teams.find(team => team.id === Number(teamId))?.name}
												</Badge>
											))}
											{question.employees &&
												question.employees.map(empId => {
													const emp = employees.find(e => e.id === Number(empId));
													return (
														<Badge key={empId} variant="secondary" className="text-xs">
															{emp ? `${emp.profile?.first_name} ${emp.profile?.last_name}` : `Employee: ${empId}`}
														</Badge>
													);
												})}
											<Badge variant="secondary" className="text-xs">
												Type: {question.type === 'textarea' ? 'Text' : question.type === 'yesno' ? 'Yes/No' : question.type === 'scale' ? 'Scale' : 'Multiple Choice'}
											</Badge>
											<Badge variant="secondary" className="text-xs">
												{question.required ? 'Required' : 'Optional'}
											</Badge>
										</div>
									</div>
									{question.question}
								</div>
							</div>
						)}

						{question.managerQuestion && question.question && <Separator />}

						{question.managerQuestion && (
							<div className="flex items-center gap-2">
								<div className="text-sm font-light leading-6">
									<div className="mb-2 text-xs font-light text-muted-foreground">Manager review question</div>
									{question.managerQuestion}
									{question.required && <span className="text-sm text-destructive">*</span>}
								</div>
							</div>
						)}
					</div>

					{question.type === 'multiselect' && question.options && question.options.length > 0 && (
						<>
							<Separator />

							<div className="space-y-2">
								<Label>Options</Label>
								<div className="space-y-2">
									{question.options.map((option, i) => (
										<div key={i} className="flex items-center gap-2">
											<Input value={option} readOnly />
										</div>
									))}
								</div>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
};

// Deep equality check (if lodash not available)
const deepEqual = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

export const QuestionTemplateDialog = ({ children, onSave, teams, employees, template, template_questions, org }: QuestionTemplateDialogProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
	const [editingQuestion, setEditingQuestion] = useState<QuestionFormValues | undefined>();
	const [selectedGroup, setSelectedGroup] = useState<QuestionFormValues['group']>('growth_and_development');
	const [isSaving, setIsSaving] = useState(false);
	const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
	const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
	const [customGroupNames, setCustomGroupNames] = useState<Record<string, string>>(
		Array.isArray(template?.custom_group_names)
			? (template?.custom_group_names as unknown[])
					.filter((curr): curr is { id: string; name: string } => !!curr && typeof curr === 'object' && typeof (curr as any).id === 'string' && typeof (curr as any).name === 'string')
					.reduce((acc: Record<string, string>, curr) => {
						acc[curr.id] = curr.name;
						return acc;
					}, {})
			: {}
	);
	const [groupNameInput, setGroupNameInput] = useState<string>('');
	const router = useRouter();
	const lastAutoSaved = useRef<any>(null);

	const form = useForm<TemplateFormValues & { custom_group_names?: { id: string; name: string }[] }>({
		resolver: zodResolver(templateSchema),
		defaultValues: {
			name: template?.name || '',
			description: template?.description || '',
			is_draft: template?.is_draft || false,
			questions:
				template_questions?.map(q => ({
					id: q.id.toString(),
					question: q.question,
					managerQuestion: q.manager_question || '',
					type: q.type as QuestionFormValues['type'],
					options: q.options || [],
					required: q.required || false,
					teams: q.team_ids?.map(id => id.toString()) || [],
					employees: (q.employee_ids || []).map(eid => eid.toString()),
					group: (q.group as QuestionFormValues['group']) || 'growth_and_development',
					scaleLabels: Array.isArray(q.scale_labels) ? (q.scale_labels.filter(item => item && typeof item === 'object' && !Array.isArray(item)) as { label?: string; description?: string }[]) : undefined
				})) || [],
			custom_group_names: Array.isArray(template?.custom_group_names) ? ((template?.custom_group_names as unknown[]).filter(g => !!g && typeof g === 'object' && typeof (g as any).id === 'string' && typeof (g as any).name === 'string') as { id: string; name: string }[]) : []
		}
	});

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates
		})
	);

	const handleDragEnd = async (event: { active: any; over: any }) => {
		const { active, over } = event;

		if (active.id !== over.id) {
			const questions = form.getValues('questions');
			const oldIndex = questions.findIndex(q => q.id === active.id);
			const newIndex = questions.findIndex(q => q.id === over.id);
			const newQuestions = arrayMove(questions, oldIndex, newIndex);
			form.setValue('questions', newQuestions);
			// Instantly update questions in backend (no debounce)
			if (template) {
				toast.promise(
					updateTemplateQuestions(
						template.id,
						newQuestions.map((q, index) => ({
							id: parseInt(q.id),
							question: q.question,
							manager_question: q.managerQuestion,
							type: q.type,
							options: q.options,
							required: q.required,
							team_ids: q.teams.map(id => parseInt(id)),
							employee_ids: q.employees.map(eid => Number(eid)),
							order_index: index,
							template_id: template.id,
							org: org,
							group: q.group,
							scale_labels: q.scaleLabels || null
						})),
						template_questions || []
					),
					{
						loading: 'Reordering questions...',
						success: 'Questions reordered',
						error: 'Failed to reorder questions'
					}
				);
			}
		}
	};

	const handleAddQuestion = async (question: QuestionFormValues) => {
		const currentQuestions = form.getValues('questions');
		const questionWithGroup = { ...question, group: selectedGroup };
		const updatedQuestions = editingQuestion ? currentQuestions.map(q => (q.id === question.id ? questionWithGroup : q)) : [...currentQuestions, questionWithGroup];
		form.reset({ ...form.getValues(), questions: updatedQuestions });
		if (editingQuestion) setEditingQuestion(undefined);
		if (template) {
			toast.promise(
				updateTemplateQuestions(
					template.id,
					updatedQuestions.map((q, index) => ({
						id: parseInt(q.id),
						question: q.question,
						manager_question: q.managerQuestion,
						type: q.type,
						options: q.options,
						required: q.required,
						team_ids: q.teams.map(id => parseInt(id)),
						employee_ids: q.employees.map(eid => Number(eid)),
						order_index: index,
						template_id: template.id,
						org: org,
						group: q.group,
						scale_labels: q.scaleLabels || null
					})),
					template_questions || []
				),
				{
					loading: 'Saving question...',
					success: 'Questions updated',
					error: 'Failed to update questions'
				}
			);
		}
	};

	const fetchTemplateQuestions = useCallback(async () => {
		if (!template?.id) return;

		try {
			setIsLoadingQuestions(true);
			const questions = await getTemplateQuestions({ org, templateId: template?.id });
			const mappedQuestions = questions.map(q => ({
				id: q.id.toString(),
				question: q.question,
				managerQuestion: q.manager_question || '',
				type: q.type as QuestionFormValues['type'],
				options: q.options || [],
				required: q.required || false,
				teams: q.team_ids?.map(id => id.toString()) || [],
				employees: (q.employee_ids || []).map(eid => eid.toString()),
				group: (q.group as QuestionFormValues['group']) || 'growth_and_development',
				scaleLabels: Array.isArray(q.scale_labels) ? (q.scale_labels.filter(item => item && typeof item === 'object' && !Array.isArray(item)) as { label?: string; description?: string }[]) : undefined,
				org: org
			}));
			form.setValue('questions', mappedQuestions);
			form.reset({ ...form.getValues(), questions: mappedQuestions });
		} catch (error) {
			toast.error('Error fetching template questions', { description: error instanceof Error ? error.message : 'Unknown error' });
		} finally {
			setIsLoadingQuestions(false);
		}
	}, [template?.id, org, form]);

	const handleGroupNameEdit = (groupId: string) => {
		setEditingGroupId(groupId);
		setGroupNameInput(customGroupNames[groupId] || groupTitles[groupId] || '');
	};

	const handleGroupNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setGroupNameInput(e.target.value);
	};

	const handleGroupNameSave = (groupId: string) => {
		const updated = { ...customGroupNames, [groupId]: groupNameInput };
		setCustomGroupNames(updated);
		setEditingGroupId(null);
		form.setValue(
			'custom_group_names',
			Object.entries(updated).map(([id, name]) => ({ id, name }))
		);
		if (template) {
			debouncedAutoSave(form.getValues());
		}
	};

	const groupTitles: Record<string, string> = {
		growth_and_development: 'Growth and Development',
		company_values: 'Company Values',
		competencies: 'Competencies',
		private_manager_assessment: 'Private Manager Assessment'
	};

	const handleSave = async () => {
		try {
			setIsSaving(true);
			const values = form.getValues();

			const custom_group_names = form.getValues('custom_group_names') || Object.entries(customGroupNames).map(([id, name]) => ({ id, name }));

			if (template) {
				// Update existing template
				await updateQuestionTemplate(template.id, {
					name: values.name,
					description: values.description,
					is_draft: values.is_draft,
					custom_group_names
				});

				await updateTemplateQuestions(
					template.id,
					values.questions.map((q, index) => ({
						id: parseInt(q.id),
						question: q.question,
						manager_question: q.managerQuestion,
						type: q.type,
						options: q.options,
						required: q.required,
						team_ids: q.teams.map(id => parseInt(id)),
						employee_ids: q.employees.map(eid => Number(eid)),
						order_index: index,
						template_id: template.id,
						org: org,
						group: q.group,
						scale_labels: q.scaleLabels || null
					})),
					template_questions || []
				);
			} else {
				// Create new template
				const newTemplate = await createQuestionTemplate({
					name: values.name,
					description: values.description,
					is_draft: values.is_draft,
					org: org,
					custom_group_names
				});

				await createTemplateQuestions(
					newTemplate.id,
					values.questions.map((q, index) => ({
						question: q.question,
						manager_question: q.managerQuestion,
						type: q.type,
						options: q.options,
						required: q.required,
						team_ids: q.teams.map(id => parseInt(id)),
						employee_ids: q.employees.map(eid => Number(eid)),
						order_index: index,
						template_id: newTemplate.id,
						org: org,
						group: q.group,
						scale_labels: q.scaleLabels || null
					})) || []
				);
			}

			router.refresh();
			setIsOpen(false);
			form.reset();
			toast.success('Question template saved successfully');
			onSave?.();
		} catch (error) {
			console.error('Error saving template:', error);
			toast.error('Failed to save question template');
		} finally {
			setIsSaving(false);
		}
	};

	const handleOpenChange = (open: boolean) => {
		setIsOpen(open);
		form.reset();

		if (open) {
			setEditingQuestion(undefined);

			if (template) {
				form.setValue('name', template?.name || '');
				form.setValue('description', template?.description || '');
				form.setValue('is_draft', template?.is_draft || false);
			}

			if (!template_questions && template?.id && form.getValues('questions').length === 0) {
				fetchTemplateQuestions();
			}
		}
	};

	const debouncedAutoSave = useDebounce(async (values: TemplateFormValues & { custom_group_names?: { id: string; name: string }[] }) => {
		if (template) {
			toast.promise(
				(async () => {
					await updateQuestionTemplate(template.id, {
						name: values.name,
						description: values.description,
						is_draft: true,
						custom_group_names: values.custom_group_names
					});
					await updateTemplateQuestions(
						template.id,
						values.questions.map((q, index) => ({
							id: parseInt(q.id),
							question: q.question,
							manager_question: q.managerQuestion,
							type: q.type,
							options: q.options,
							required: q.required,
							team_ids: q.teams.map(id => parseInt(id)),
							employee_ids: q.employees.map(eid => Number(eid)),
							order_index: index,
							template_id: template.id,
							org: org,
							group: q.group,
							scale_labels: q.scaleLabels || null
						})),
						template_questions || []
					);
				})(),
				{
					loading: 'Saving...',
					success: 'Saved',
					error: 'Auto-save failed'
				}
			);
		}
	}, 1000);

	// Watch form values for auto-save
	useEffect(() => {
		const values = form.getValues();
		if (form.formState.isDirty && form.formState.isValid && template && !deepEqual(values, lastAutoSaved.current)) {
			debouncedAutoSave(values);
			lastAutoSaved.current = values;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form.formState.isDirty, form.formState.isValid, template, debouncedAutoSave]);

	return (
		<>
			<AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
				<AlertDialogTrigger asChild>{children}</AlertDialogTrigger>

				<AlertDialogContent className="flex h-screen max-w-full flex-col overflow-y-auto py-0">
					<AlertDialogHeader className="mx-auto mb-8 w-full max-w-2xl pt-16">
						<AlertDialogTitle>{template ? 'Edit' : 'Create'} Question Template</AlertDialogTitle>
						<AlertDialogDescription>{template ? 'Edit' : 'Create'} a new question template to be used in the appraisal process</AlertDialogDescription>
					</AlertDialogHeader>

					<Form {...form}>
						<form onSubmit={form.handleSubmit(handleSave)} className="mx-auto flex w-full max-w-2xl flex-col gap-10">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Template Name</FormLabel>
										<FormControl>
											<Input {...field} placeholder="Enter template name" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Textarea {...field} placeholder="Enter template description" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="space-y-8">
								{[
									{ id: 'growth_and_development', title: 'Growth and Development' },
									{ id: 'company_values', title: 'Company Values' },
									{ id: 'competencies', title: 'Competencies' },
									{ id: 'private_manager_assessment', title: 'Private Manager Assessment' }
								].map(group => (
									<div key={group.id} className="space-y-4">
										<div className="sticky top-0 !-mb-2 flex items-center justify-between gap-4 rounded-md bg-background p-2 backdrop-blur-lg">
											<FormLabel className="flex w-full items-center gap-2 text-lg font-semibold">
												{editingGroupId === group.id ? (
													<input
														type="text"
														className="w-full rounded border px-2 py-1 text-base font-semibold outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2"
														value={groupNameInput}
														onChange={handleGroupNameChange}
														onBlur={() => handleGroupNameSave(group.id)}
														onKeyDown={e => {
															if (e.key === 'Enter') {
																e.preventDefault();
																handleGroupNameSave(group.id);
															}
														}}
														autoFocus
													/>
												) : (
													<>
														{customGroupNames[group.id] || group.title}
														<Button type="button" size="icon" variant="ghost" className="ml-2 h-8 w-8 p-0" onClick={() => handleGroupNameEdit(group.id)}>
															<Pencil size={14} />
														</Button>
													</>
												)}
											</FormLabel>

											<Button
												variant="outline"
												type="button"
												onClick={() => {
													setSelectedGroup(group.id as QuestionFormValues['group']);
													setIsQuestionDialogOpen(true);
												}}>
												<Plus className="mr-2" size={12} />
												Add Question
											</Button>
										</div>

										{isLoadingQuestions ? (
											<div className="flex h-36 w-full flex-col items-center justify-center gap-4 rounded-md border border-dashed">
												<LoadingSpinner />
												<p className="text-xs text-muted-foreground">Loading questions...</p>
											</div>
										) : (
											<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
												<SortableContext
													items={form
														.getValues('questions')
														.filter(q => q.group === group.id)
														.map(q => q.id)}
													strategy={verticalListSortingStrategy}>
													<div className="space-y-4">
														{form
															.getValues('questions')
															.filter(q => q.group === group.id)
															.map((question, index) => (
																<QuestionItem
																	teams={teams}
																	key={question.id}
																	question={question}
																	onEdit={() => {
																		setEditingQuestion(question);
																		setSelectedGroup(question.group);
																		setIsQuestionDialogOpen(true);
																	}}
																	onRemove={async () => {
																		const questions = form.getValues('questions');
																		const updatedQuestions = questions.filter(q => q.id !== question.id);
																		form.setValue('questions', updatedQuestions);
																		form.reset({ ...form.getValues(), questions: updatedQuestions });
																		// Instantly update questions in backend (no debounce)
																		if (template) {
																			toast.promise(deleteQuestionTemplate(template.id, question.id), {
																				loading: 'Removing question...',
																				success: 'Question removed',
																				error: 'Failed to remove question'
																			});
																		}
																	}}
																	employees={employees}
																/>
															))}
													</div>
												</SortableContext>
											</DndContext>
										)}

										{form.getValues('questions').filter(q => q.group === group.id).length === 0 && !isLoadingQuestions && (
											<div className="flex h-36 w-full flex-col items-center justify-center gap-4 rounded-md border border-dashed">
												<p className="text-xs text-muted-foreground">No questions added yet</p>
											</div>
										)}
									</div>
								))}
							</div>

							<div className="sticky bottom-0 flex justify-end gap-4 border-t p-4 backdrop-blur-xl">
								{template && (
									<DeleteTemplateDialog
										templateId={template.id}
										org={org}
										onSuccess={() => {
											setIsOpen(false);
											onSave?.();
										}}
									/>
								)}

								<Button type="button" variant="outline" className="ml-auto" onClick={() => setIsOpen(false)}>
									Close
								</Button>

								<Button type="submit" disabled={isSaving}>
									{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
									{template ? 'Save Changes' : 'Create Template'}
								</Button>
							</div>
						</form>
					</Form>
				</AlertDialogContent>
			</AlertDialog>

			<QuestionSetupDialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen} question={editingQuestion} onSave={handleAddQuestion} teams={teams} group={selectedGroup} employees={employees} />
		</>
	);
};
