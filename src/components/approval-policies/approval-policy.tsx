'use client';

import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { ChartNoAxesGantt, Plus, Trash2, TriangleAlert } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Database, Tables } from '@/type/database.types';
import { format } from 'date-fns';
import { createPolicy, deletePolicy, updatePolicy } from './policy-actions';
import { toast } from 'sonner';
import { useFormStatus } from 'react-dom';
import { LoadingSpinner } from '@/components/ui/loader';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
	name: z.string().min(1),
	description: z.string().optional(),
	type: z.enum(['time_off', 'role_application']),
	levels: z.array(z.object({ type: z.string(), id: z.string(), level: z.number() })),
	is_default: z.boolean()
});

const supabase = createClient();

interface props {
	type?: Database['public']['Enums']['policy_types'];
	data?: Tables<'approval_policies'>;
	children?: ReactNode;
	org: string;
	className?: string;
	onCreate?: (policy: Tables<'approval_policies'>) => void;
}

export const ApprovalPolicy = ({ data, org, children, className, onCreate, type }: props) => {
	const [levels, updateLevels] = useState<{ type: string; id: string; level: number }[]>((data?.levels as any) || []);
	const [isUpdating, setUpdateState] = useState(false);
	const [isDeleting, setDeleteState] = useState(false);
	const [isDialogOpen, toggleDialogState] = useState(false);
	const [employees, setEmployees] = useState<{ id: number; job_title: string; profile: { first_name: string; last_name: string } }[]>([]);
	const [defaultPolicy, setDefaultPolicy] = useState<Tables<'approval_policies'>[]>();
	const router = useRouter();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: { ...data, type: data?.type || type, is_default: data?.is_default, name: data?.name || '', levels: (data?.levels as any) || [], description: data?.description || '' }
	});

	const getDefaultPolicy = useCallback(
		async (type: string) => {
			const { data, error } = await supabase.from('approval_policies').select().match({ type, org, is_default: true });
			if (error) toast.error('Error checking default policy', { description: error.message });
			if (data) setDefaultPolicy(data);
		},
		[org]
	);

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		setUpdateState(true);

		const response = data ? await updatePolicy(org, data.id, { ...values, updated_at: new Date() as any }) : await createPolicy(org, { ...values, org });
		setUpdateState(false);
		if (typeof response == 'string') return toast.error('Error', { description: response });

		toast.success(`Policy ${data ? 'Updated' : 'Created'}`, { description: `Policy has been ${data ? 'updated' : 'created'} successfully` });
		toggleDialogState(false);
		!onCreate && router.refresh();
		response !== true && !!onCreate && onCreate(response);
	};

	const SubmitButton = () => {
		const { pending } = useFormStatus();

		return (
			<Button
				type="submit"
				onClick={() => {
					console.log(form.formState);
					console.log(form.getValues());
				}}
				disabled={pending || isUpdating}
				size={'sm'}
				className="w-full gap-3 px-4 text-xs font-light">
				{(pending || isUpdating) && <LoadingSpinner />}
				{pending || isUpdating ? (data ? 'Updating' : 'Creating') : data ? 'Update' : 'Create'} policy
			</Button>
		);
	};

	const onDeletePolicy = async (id: number) => {
		setDeleteState(true);

		const response = await deletePolicy(org, id);
		setDeleteState(false);
		if (response !== true) return toast.error('Error deleting process', { description: response });

		toast.success(`Policy deleted`, { description: `Policy has been deleted successfully` });
		toggleDialogState(false);
		router.refresh();
	};

	useEffect(() => {
		const getEmployees = async (org: string) => {
			const { data, error } = await supabase.from('contracts').select('id, job_title, profile:profiles!contracts_profile_fkey(first_name, last_name)').match({ org, status: 'signed' });
			if (!data || error) return toast('🥺 Error', { description: 'Unable to fetch list of colleagues for leave request form' });
			if (data.length) setEmployees(data as any);
		};

		if (org) getEmployees(org);
		if (data?.type) getDefaultPolicy(data?.type);
	}, [data, getDefaultPolicy, org]);

	return (
		<Sheet open={isDialogOpen} onOpenChange={toggleDialogState}>
			<SheetTrigger asChild>
				<button className={cn('h-fit', className)}>
					{!children && data && (
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
					)}

					{!!children && children}
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
										<Select
											onValueChange={value => {
												field.onChange(value);
												getDefaultPolicy(value);
											}}
											defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="What policy is this?" />
												</SelectTrigger>
											</FormControl>

											<SelectContent>
												<SelectItem value="time_off">Time-Off</SelectItem>
												<SelectItem value="role_application">Role applications</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="is_default"
								render={({ field }) => (
									<FormItem className="flex flex-row justify-between">
										<div className="space-y-2">
											<FormLabel className="text-xs text-foreground">Default policy</FormLabel>
											<FormDescription className="max-w-64 text-xs font-light">
												Enabling this will make this the default <span className="font-semibold">{form.getValues('type')?.replace('_', ' ')}</span> policy for every one
											</FormDescription>
										</div>

										<FormControl>
											<Switch disabled={defaultPolicy && defaultPolicy?.length > 0 && defaultPolicy[0].id !== data?.id} className="!m-0 scale-75" checked={field.value} onCheckedChange={field.onChange} />
										</FormControl>
									</FormItem>
								)}
							/>

							{defaultPolicy && defaultPolicy?.length > 0 && defaultPolicy[0].id !== data?.id && (
								<Alert className="text-xs">
									<TriangleAlert size={14} className="stroke-orange-400" />
									<AlertTitle>Current default</AlertTitle>
									<AlertDescription className="text-xs font-light text-muted-foreground">&quot;{defaultPolicy[0]?.name}&quot; is the current default. You&apos;ll have to remove it as default to set another default</AlertDescription>
								</Alert>
							)}

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
																			{employee.profile.first_name} {employee.profile.last_name} • {employee.job_title}
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

							<div className="flex items-center gap-4">
								{data?.id && (
									<Button type="button" onClick={() => onDeletePolicy(data?.id)} variant={'secondary_destructive'} size={'icon'} className="w-16 gap-3">
										{!isDeleting && <Trash2 size={12} />}
										{isDeleting && <LoadingSpinner className="text-inherit" />}
									</Button>
								)}

								<SubmitButton />
							</div>
						</form>
					</Form>
				</section>
			</SheetContent>
		</Sheet>
	);
};
