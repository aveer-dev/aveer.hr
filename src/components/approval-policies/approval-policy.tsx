'use client';

import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { ChartNoAxesGantt, Plus, Trash2 } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Tables } from '@/type/database.types';
import { format } from 'date-fns';
import { updatePolicy } from './policy-actions';
import { toast } from 'sonner';
import { useFormStatus } from 'react-dom';
import { LoadingSpinner } from '../ui/loader';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const formSchema = z.object({
	name: z.string().min(1),
	description: z.string().min(1).optional(),
	type: z.enum(['time_off']),
	levels: z.array(z.object({ type: z.string(), id: z.string(), level: z.number() }))
});

const supabase = createClient();

export const ApprovalPolicy = ({ data }: { data: Tables<'approval_policies'> }) => {
	const [levels, updateLevels] = useState<{ type: string; id: string; level: number }[]>(data.levels as any);
	const [isUpdating, setUpdateState] = useState(false);
	const [isDialogOpen, toggleDialogState] = useState(false);
	const [employees, setEmployees] = useState<{ id: number; profile: { first_name: string; last_name: string } }[]>([]);
	const router = useRouter();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: { ...data, levels: data.levels as any, description: data.description || '' }
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		setUpdateState(true);
		const response = await updatePolicy(data.org, data.id, { ...values, updated_at: new Date() as any });
		setUpdateState(false);
		if (response !== true) toast.error('Error', { description: response });

		toast.success('Policy Updated', { description: 'Policy has been updated successfully' });
		toggleDialogState(false);
		router.refresh();
	};

	const SubmitButton = () => {
		const { pending } = useFormStatus();

		return (
			<Button type="submit" disabled={pending || isUpdating} size={'sm'} className="w-full gap-3 px-4 text-xs font-light">
				{(pending || isUpdating) && <LoadingSpinner />}
				{pending || isUpdating ? 'Updating policy' : 'Update policy'}
			</Button>
		);
	};

	useEffect(() => {
		const getEmployees = async (org: string) => {
			const { data, error } = await supabase.from('contracts').select('id, profile:profiles!contracts_profile_fkey(first_name, last_name)').match({ org });
			if (!data || error) return toast('🥺 Error', { description: 'Unable to fetch list of colleagues for leave request form' });
			if (data.length) setEmployees(data as any);
		};

		if (data.org) getEmployees(data.org);
	}, [data]);

	return (
		<Sheet open={isDialogOpen} onOpenChange={toggleDialogState}>
			<SheetTrigger asChild>
				<button className="h-fit">
					<Card className="flex w-full items-center justify-between p-4">
						<div className="space-y-1 text-left">
							<h4 className="text-xs font-semibold">{data.name}</h4>
							<p className="text-xs capitalize text-muted-foreground">{data.type.replace('_', '-')} policy</p>
						</div>

						<div className="space-y-px text-right text-xs font-light text-muted-foreground">
							<div>Last updated</div>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<a className="underline decoration-dashed">{format(data.updated_at as string, 'PP')}</a>
									</TooltipTrigger>
									<TooltipContent>
										<p className="text-xs">
											{format(data.updated_at as string, 'PP')} | {format(data.updated_at as string, 'p')}
										</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>
					</Card>
				</button>
			</SheetTrigger>

			<SheetContent className="overflow-y-auto">
				<SheetHeader>
					<SheetTitle>Approval Policy</SheetTitle>
					<SheetDescription>Setup and manage your approval policy here.</SheetDescription>
				</SheetHeader>

				<section className="grid gap-4 py-4">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Name*</FormLabel>
										<FormControl>
											<Input placeholder="What would you like to call this policy" {...field} />
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
											<Textarea placeholder="How would you describe this policy" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="type"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Policy type</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="What policy is this?" />
												</SelectTrigger>
											</FormControl>

											<SelectContent>
												<SelectItem value="time_off">Time-Off</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="!mt-12 space-y-8">
								<h2 className="-mb-4 text-sm font-semibold">Approval levels</h2>

								{levels.map((level, index) => (
									<div key={index} className="mt-4 space-y-4 rounded-md bg-accent p-2">
										<div className="flex items-center justify-between">
											<h3 className="text-sm font-semibold text-muted-foreground">Level {index + 1}</h3>
											<Button
												type="button"
												variant={'ghost'}
												onClick={() => {
													const newLevels = levels.splice(index, 1);
													updateLevels(newLevels);
												}}
												className="h-6 w-6 p-0 text-destructive hover:text-destructive focus:ring-destructive focus-visible:ring-destructive">
												<Trash2 size={12} />
											</Button>
										</div>

										<div className="space-y-6">
											<FormField
												control={form.control}
												name={`levels.${index}.type`}
												render={({ field }) => (
													<FormItem>
														<FormLabel>Employee type</FormLabel>
														<Select
															onValueChange={event => {
																field.onChange(event);
																const newLevels = [...levels];
																newLevels[index].type = event;
																updateLevels(newLevels);
															}}
															defaultValue={field.value}>
															<FormControl>
																<SelectTrigger>
																	<SelectValue placeholder="Select the kind of employee for approval" />
																</SelectTrigger>
															</FormControl>

															<SelectContent>
																<SelectItem value="manager">Managers</SelectItem>
																<SelectItem value="employee">Employee</SelectItem>
																<SelectItem value="admin">Admins</SelectItem>
															</SelectContent>
														</Select>
														<FormMessage />
													</FormItem>
												)}
											/>

											{levels[index].type == 'employee' && (
												<FormField
													control={form.control}
													name={`levels.${index}.id`}
													render={({ field }) => (
														<FormItem>
															<FormLabel>Employee</FormLabel>
															<Select onValueChange={field.onChange} defaultValue={field.value}>
																<FormControl>
																	<SelectTrigger>
																		<SelectValue placeholder="Select an employee" />
																	</SelectTrigger>
																</FormControl>

																<SelectContent>
																	{employees.map(employee => (
																		<SelectItem key={employee.id} value={String(employee.id)}>
																			{employee.profile.first_name} {employee.profile.last_name}
																		</SelectItem>
																	))}
																</SelectContent>
															</Select>
															<FormMessage />
														</FormItem>
													)}
												/>
											)}
										</div>
									</div>
								))}

								<Button
									type="button"
									onClick={() => {
										updateLevels([...levels, { type: 'manager', id: '', level: levels.length + 1 }]);
										form.setValue('levels', [...form.getValues('levels'), { type: 'manager', id: '', level: levels.length + 1 }]);
									}}
									variant={'secondary'}
									className="mt-8 gap-3">
									<Plus size={12} />
									<Separator orientation="vertical" />
									Add level
									<ChartNoAxesGantt size={12} />
								</Button>
							</div>

							<SubmitButton />
						</form>
					</Form>
				</section>
			</SheetContent>
		</Sheet>
	);
};
