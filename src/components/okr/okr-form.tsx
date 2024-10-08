'use client';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { SheetFooter } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { CircleMinus, Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useState } from 'react';
import { TablesInsert, Tables } from '@/type/database.types';
import { Button } from '@/components/ui/button';
import { createObjective, createOKR, createResults, deleteObjective, deleteOKR, deleteResult } from './okr.action';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/loader';

type OBJ_RESULTS = Tables<'okr_objectives'> & {
	results: Tables<'okr_results'>[] | null;
};

interface props {
	org: string;
	okr?: Tables<'okrs'>;
	objResult?: OBJ_RESULTS[];
	toggleSheet?: (state: boolean) => void;
}

const objectives = z
	.object({
		isDeleting: z.boolean().optional(),
		id: z.number().optional(),
		objective: z.string().min(2, { message: 'Enter objective' }),
		results: z.object({ isDeleting: z.boolean().optional(), result: z.string(), id: z.number().optional(), okr: z.number().optional(), okr_objective: z.number().optional() }).array().min(0)
	})
	.array()
	.refine(
		inputs => {
			if (inputs.length <= 1) return true;
			const items = inputs.map(input => inputs.filter(finder => finder.objective == input.objective).length > 1);
			return !items?.find(item => item == true);
		},
		{ message: 'You can not have one objective twice' }
	)
	.refine(inputs => inputs.length > 0, { message: 'Enter at least one objective' });

const formSchema = z.object({ id: z.number().optional(), objectives: objectives, title: z.string().min(2, { message: 'Enter OKR title' }), start: z.string().min(2, { message: 'Select OKR start date' }), end: z.string().min(2, { message: 'Select OKR expiry date' }) });

export const OKRForm = ({ org, okr, objResult, toggleSheet }: props) => {
	const [okrs, updatedOKRs] = useState<z.infer<typeof objectives>>(objResult?.map(obj => ({ objective: obj.objective, results: obj.results ? obj.results?.map(result => result) : [] })) || []);
	const [isDeletingOKR, setDeleteOKRState] = useState(false);
	const [isSubmitingOKR, setSubmitOKRState] = useState(false);
	const router = useRouter();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: okr?.title || '',
			objectives: objResult ? objResult.map(obj => ({ id: obj.id, objective: obj.objective, results: obj.results ? obj.results?.map(result => result) : [] })) : [],
			start: okr?.start || '',
			end: okr?.end || '',
			id: okr?.id
		}
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		setSubmitOKRState(true);

		// create OKR
		const okr: TablesInsert<'okrs'> = { start: values.start, end: values.end, title: values.title, org };
		if (values.id) okr.id = values.id;
		const okrRes = await createOKR(okr);
		if (typeof okrRes == 'string') {
			setSubmitOKRState(false);
			return toast.error('Unable to create OKR', { description: okrRes });
		}

		// create OKR objective
		const okrObjectives: TablesInsert<'okr_objectives'>[] = values.objectives.map(objective => {
			const data: TablesInsert<'okr_objectives'> = { objective: objective.objective, okr: okrRes[0].id, org };
			if (objective.id) data.id = objective.id;
			return data;
		});
		const objectivesRes = await createObjective(okrObjectives);
		if (typeof objectivesRes == 'string') {
			setSubmitOKRState(false);
			return toast.error('Unable to create OKR', { description: objectivesRes });
		}

		// create OKR objectives results, if any
		const results: TablesInsert<'okr_results'>[] = objectivesRes.flatMap(objective => {
			const matchingObjective = values.objectives.find(obj => obj.objective === objective.objective);
			return (matchingObjective?.results || []).map(res => {
				const data: TablesInsert<'okr_results'> = {
					okr_objective: objective.id,
					okr: objective.okr,
					org,
					result: res.result
				};
				if (res.id) data.id = res.id;
				return data;
			});
		});
		if (results.length) {
			const resultsRes = await createResults(results);
			if (typeof resultsRes == 'string') {
				setSubmitOKRState(false);
				return toast.error('Unable to create OKR', { description: resultsRes });
			}
		}

		toast.success('OKR created successfully');
		router.refresh();
		toggleSheet && toggleSheet(false);
	};

	const addObjective = () => {
		updatedOKRs([...okrs, { objective: '', results: [] }]);
		form.setValue('objectives', [...form.getValues('objectives'), { objective: '', results: [] }]);
	};

	const addResult = ({ okr, index }: { okr: any; index: number }) => {
		okrs[index] = { ...okr, results: [...okr.results, { result: '' }] };
		updatedOKRs([...okrs]);
	};

	const onDeleteObjective = async (index: number) => {
		const formObjectives = form.getValues('objectives');
		okrs[index].isDeleting = true;
		updatedOKRs([...okrs]);

		if (okr && formObjectives[index].id) {
			const res = await deleteObjective({ org, okr: okr.id, id: formObjectives[index].id });
			if (res !== true) return toast.error('Unable to delete objective', { description: res });
			router.refresh();
		}

		okrs.splice(index, 1);
		updatedOKRs([...okrs]);

		formObjectives.splice(index, 1);
		form.setValue('objectives', formObjectives);
	};

	const onDeleteOKR = async (id: number) => {
		setDeleteOKRState(true);
		const res = await deleteOKR({ org, id });
		setDeleteOKRState(false);
		if (res !== true) return toast.error('Unable to delete OKR', { description: res });

		router.refresh();
		toggleSheet && toggleSheet(false);
	};

	const onDeleteResult = async ({ index, objectiveIndex }: { index: number; objectiveIndex: number }) => {
		const result = form.getValues('objectives')[objectiveIndex].results;
		okrs[objectiveIndex].results[index].isDeleting = true;
		updatedOKRs([...okrs]);

		if (okr && result[index].id) {
			const res = await deleteResult({ org, okr: okr.id, id: result[index].id });
			if (res !== true) return toast.error('Unable to delete key result', { description: res });
			router.refresh();
		}

		okrs[objectiveIndex].results.splice(index, 1);
		updatedOKRs([...okrs]);

		result.splice(index, 1);
		form.setValue(`objectives.${objectiveIndex}.results`, result);
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="mt-10 space-y-12">
				<FormField
					control={form.control}
					name="title"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Title</FormLabel>
							<FormControl>
								<Input placeholder="Title this OKR" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div>
					<h3 className="mb-4 text-sm font-medium">Duration</h3>
					<div className="grid grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="start"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Effective from</FormLabel>
									<FormControl>
										<DatePicker selected={field.value ? new Date(field.value) : undefined} onSetDate={date => field.onChange(String(new Date(date).toISOString()))} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="end"
							render={({ field }) => (
								<FormItem>
									<FormLabel>To</FormLabel>
									<FormControl>
										<DatePicker disabled={date => date < new Date(form.getValues('start')) || date < new Date('1900-01-01')} selected={field.value ? new Date(field.value) : undefined} onSetDate={date => field.onChange(String(new Date(date).toISOString()))} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</div>

				<div>
					<div>
						<FormField
							control={form.control}
							name="objectives"
							render={() => (
								<FormItem>
									<FormLabel className="mb-4 text-sm font-medium text-foreground">Objectives</FormLabel>

									{okrs.length > 0 && (
										<div className="space-y-8">
											{okrs.map((okr, index) => (
												<div className="space-y-8" key={index}>
													<FormField
														control={form.control}
														name={`objectives.${index}`}
														render={() => (
															<FormItem>
																<FormField
																	control={form.control}
																	name={`objectives.${index}.objective`}
																	render={({ field }) => (
																		<FormItem>
																			<FormLabel className="flex items-center justify-between">
																				Objective {index + 1}
																				<Button type="button" disabled={okr.isDeleting} variant={'ghost_destructive'} onClick={() => onDeleteObjective(index)} className="h-6 w-6 p-0">
																					{!okr.isDeleting && <CircleMinus size={12} />}
																					{okr.isDeleting && <LoadingSpinner className="text-destructive" />}
																				</Button>
																			</FormLabel>
																			<FormControl>
																				<Textarea placeholder="Enter objective here" {...field} />
																			</FormControl>
																			<FormMessage />
																		</FormItem>
																	)}
																/>

																<div className="!mt-8">
																	<h4 className="mb-4 text-xs text-muted-foreground">Objective {index + 1} key results</h4>

																	<div className="space-y-4">
																		{okr.results.length > 0 && (
																			<>
																				{okr.results.map((result, idx) => (
																					<FormField
																						key={idx}
																						control={form.control}
																						name={`objectives.${index}.results.${idx}.result`}
																						render={({ field }) => (
																							<FormItem>
																								<FormLabel className="flex items-center justify-between">
																									Result {idx + 1}
																									<Button type="button" disabled={result.isDeleting} variant={'ghost_destructive'} onClick={() => onDeleteResult({ index: idx, objectiveIndex: index })} className="h-6 w-6 p-0">
																										{!result.isDeleting && <CircleMinus size={12} />}
																										{result.isDeleting && <LoadingSpinner className="text-destructive" />}
																									</Button>
																								</FormLabel>
																								<FormControl>
																									<Textarea placeholder="Enter objective result here" {...field} />
																								</FormControl>
																								<FormMessage />
																							</FormItem>
																						)}
																					/>
																				))}

																				<Button onClick={() => addResult({ okr, index })} type="button" variant={'secondary'} className="gap-3">
																					<Plus size={12} /> <Separator orientation="vertical" /> Add key result
																				</Button>
																			</>
																		)}
																	</div>

																	{okr.results.length == 0 && (
																		<Button type="button" onClick={() => addResult({ okr, index })} variant={'secondary'} className="w-full gap-3">
																			<Plus size={12} /> Add key result
																		</Button>
																	)}
																</div>

																<FormMessage />
															</FormItem>
														)}
													/>

													<Separator />
												</div>
											))}

											<FormMessage />

											<Button onClick={addObjective} type="button" variant={'outline'} className="w-full gap-3 text-xs">
												<Plus size={10} /> Add objective
											</Button>
										</div>
									)}

									{okrs.length == 0 && (
										<div className="flex h-36 w-full flex-col items-center justify-center gap-3 rounded-md bg-accent">
											<p className="text-xs font-light text-muted-foreground">No objective and key results added yet</p>
											<Button onClick={addObjective} type="button" variant={'outline'} className="gap-3 text-xs">
												<Plus size={10} /> <Separator orientation="vertical" /> Add objectives
											</Button>
										</div>
									)}
								</FormItem>
							)}
						/>
					</div>
				</div>

				<SheetFooter className="mt-10">
					{!!okr && (
						<Button type="button" disabled={isDeletingOKR} onClick={() => onDeleteOKR(okr.id)} variant={'secondary_destructive'}>
							{!isDeletingOKR && <Trash2 size={12} />}
							{isDeletingOKR && <LoadingSpinner className="text-destructive" />}
						</Button>
					)}

					<Button disabled={isSubmitingOKR} type="submit" className="w-full gap-2">
						{isSubmitingOKR && <LoadingSpinner />}
						Save changes
					</Button>
				</SheetFooter>
			</form>
		</Form>
	);
};
