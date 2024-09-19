'use client';

import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, buttonVariants } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { BriefcaseBusiness, Check, ChevronRightIcon, ChevronsUpDown, CircleMinus, Plus } from 'lucide-react';
import { Tables, TablesInsert } from '@/type/database.types';
import { toast } from 'sonner';
import { useFormStatus } from 'react-dom';
import { LoadingSpinner } from '@/components/ui/loader';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { createTeam, deleteManager, updateTeam } from './team-actions';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';

const formSchema = z.object({
	name: z.string().min(1, { message: 'Provide team name' }),
	description: z.string().optional(),
	managers: z
		.object({ id: z.number().optional(), person: z.string(), role: z.number(), org: z.string(), team: z.number().nullable(), profile: z.string() })
		.refine(input => input.person && input.role && input.team && input.profile, { message: 'Selete an employee' })
		.array()
		.refine(
			inputs => {
				if (inputs.length <= 1) return true;

				const items = inputs.map(input => !!inputs.find(finder => finder.person == input.person));

				return !items?.find(item => item == true);
			},
			{ message: 'You can mot make an employee a manager twice' }
		),
	org: z.string()
});

const supabase = createClient();

export const Team = ({ data, org, onCreate, children, className }: { org: string; data?: Tables<'teams'>; onCreate?: () => void; children?: ReactNode; className?: string }) => {
	const [isUpdating, setUpdateState] = useState(false);
	const [isDialogOpen, toggleDialogState] = useState(false);
	const [teamMembers, setTeamMembers] = useState(0);
	const [employees, setEmployees] = useState<{ id: number; profile: { first_name: string; last_name: string; id: string } }[]>([]);
	const [managers, setManagers] = useState<{ isOpen?: boolean; isDeleting?: boolean; id: number }[]>([]);
	const router = useRouter();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: { name: data?.name || '', org, description: data?.description || '', managers: [] }
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		setUpdateState(true);

		const team: TablesInsert<'teams'> = { name: values.name, description: values.description, org: values.org };
		const managersPayload: TablesInsert<'managers'>[] = values.managers?.map(manager => ({ ...manager, person: Number(manager.person), team: manager.team || 0 })) || [];
		const response = data ? await updateTeam(org, data.id, { ...team, updated_at: new Date() as any }, managersPayload) : await createTeam(org, team, managersPayload);
		setUpdateState(false);

		if (response !== true) return toast.error('Error', { description: response });
		toast.success('Teams updated');
		toggleDialogState(false);

		if (!onCreate) router.refresh();
		if (onCreate) onCreate();
	};

	const SubmitButton = () => {
		const { pending } = useFormStatus();

		return (
			<Button type="submit" disabled={pending || isUpdating} size={'sm'} className="w-full gap-3 px-4 text-xs font-light">
				{(pending || isUpdating) && <LoadingSpinner />}
				{pending || isUpdating ? (data ? 'Updating team' : 'Creating team') : data ? 'Update team' : 'Create team'}
			</Button>
		);
	};

	const getManagers = useCallback(
		async (team: number, org: string) => {
			const { data, error } = await supabase.from('managers').select().match({ org, team });
			if (error) toast.error('Unable to fetch managers', { description: error.message });

			if (data) {
				setManagers(() => data.map(manager => ({ id: manager.id })));
				form.setValue('managers', data.map(manager => ({ ...manager, team: manager.team, person: String(manager.person) })) as any);
			}
		},
		[form]
	);

	const getTeamMembersCount = useCallback(async (team: number, org: string, name: string) => {
		const { count, error } = await supabase.from('contracts').select('*', { count: 'estimated', head: true }).match({ org, team, status: 'signed' });
		if (error) toast.error(`Unable to fetch team count for ${name} team`, { description: error.message });

		if (count) setTeamMembers(() => count);
	}, []);

	const getEmployees = useCallback(async (org: string) => {
		const { data, error } = await supabase.from('contracts').select('id, profile:profiles!contracts_profile_fkey(id, first_name, last_name)').match({ org, status: 'signed' });
		if (!data || error) return toast('🥺 Error', { description: 'Unable to fetch list of colleagues for leave request form' });
		if (data.length) setEmployees(() => data as any);
	}, []);

	useEffect(() => {
		if (org) getEmployees(org);
		if (data?.org && data?.id) getManagers(data.id, data.org);
		if (data?.org && data?.id && data?.name) getTeamMembersCount(data.id, data.org, data.name);
	}, [data, getEmployees, getManagers, getTeamMembersCount, org]);

	const getEmployeeFullname = (index: number) => {
		const selectedEmployeeId = form.getValues(`managers.${index}.person`);
		if (!selectedEmployeeId) return 'Select employee type';

		const employeeDetails = employees.find(employee => employee.id === Number(form.getValues(`managers.${index}.person`)))?.profile;
		const employeeFullName = `${employeeDetails?.first_name} ${employeeDetails?.last_name}`;

		return employeeFullName;
	};

	const onDeleteManager = async (manager: number, index: number) => {
		managers[index].isDeleting = true;
		setManagers([...managers]);
		const response = await deleteManager(org, [manager]);
		managers[index].isDeleting = false;
		setManagers([...managers]);

		if (response !== true) return toast.error('Error removing manager', { description: response });

		managers.splice(index, 1);
		setManagers([...managers]);

		const formManagers = form.getValues('managers');
		formManagers.splice(index, 1);
		form.setValue('managers', formManagers);
	};

	return (
		<Sheet open={isDialogOpen} onOpenChange={toggleDialogState}>
			<SheetTrigger asChild>
				<button type="button" className={cn('w-full', !data && !children && buttonVariants(), className)}>
					{data && !children && (
						<Card className="flex w-full items-center justify-between p-3 text-left transition-all duration-500 hover:bg-accent/60">
							<div className="space-y-1">
								<h4 className="text-xs font-semibold">{data?.name}</h4>
								<p className="text-xs text-muted-foreground">
									{managers.length} manager{managers.length > 1 && 's'} • {teamMembers} members
								</p>
							</div>

							<ChevronRightIcon size={12} />
						</Card>
					)}

					{!data && !children && 'Add team'}

					{!!children && children}
				</button>
			</SheetTrigger>

			<SheetContent className="overflow-y-auto">
				<SheetHeader>
					<SheetTitle>Team</SheetTitle>
					<SheetDescription>Manage team details here</SheetDescription>
				</SheetHeader>

				<section className="mt-10 grid gap-4 py-4">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Name*</FormLabel>
										<FormControl>
											<Input placeholder="What would you like to call this team" {...field} />
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
											<Textarea placeholder="How would you describe this team" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="managers"
								render={() => (
									<FormItem>
										<FormLabel>
											<h2 className="mb-4 text-sm font-medium text-foreground">Managers</h2>
										</FormLabel>

										<div className="space-y-8">
											{managers.map((manager, index) => (
												<FormField
													key={index}
													control={form.control}
													name={`managers.${index}`}
													render={() => (
														<FormItem>
															<FormField
																control={form.control}
																key={index}
																name={`managers.${index}.person`}
																render={() => (
																	<FormItem>
																		<FormLabel className="flex items-center justify-between">
																			Manager {index + 1}
																			<Button disabled={manager.isDeleting} type="button" onClick={() => onDeleteManager(manager.id, index)} variant={'ghost_destructive'} className="h-6 w-6 p-0">
																				{!manager.isDeleting && <CircleMinus size={12} />}
																				{manager.isDeleting && <LoadingSpinner />}
																			</Button>
																		</FormLabel>

																		<Popover
																			open={manager.isOpen}
																			onOpenChange={state => {
																				manager.isOpen = state;
																				managers[index] = manager;
																				setManagers([...managers]);
																			}}>
																			<PopoverTrigger asChild>
																				<FormControl>
																					<Button variant="outline" role="combobox" className={cn('w-full justify-between bg-input-bg', !form.getValues(`managers.${index}.person`) && 'text-muted-foreground')}>
																						{getEmployeeFullname(index)}
																						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
																					</Button>
																				</FormControl>
																			</PopoverTrigger>

																			<PopoverContent className="w-[300px] p-0">
																				<Command>
																					<CommandList>
																						<CommandGroup>
																							{employees.map(employee => (
																								<CommandItem
																									value={String(employee.id)}
																									onSelect={value => {
																										const managerDetails = employees.find(employee => employee.id == Number(value));
																										if (!managerDetails) return;

																										form.setValue(`managers.${index}`, { team: (data?.id as number) || null, person: String(managerDetails?.id), profile: managerDetails?.profile.id, org, role: 1 });
																										managers[index] = { id: managerDetails?.id, isOpen: false };
																										setManagers([...managers]);
																									}}>
																									<Check className={cn('mr-2 h-4 w-4', employee.id === Number(form.getValues(`managers.${index}.person`)) ? 'opacity-100' : 'opacity-0')} />
																									{employee.profile.first_name} {employee.profile.first_name}
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

															<FormMessage />
														</FormItem>
													)}
												/>
											))}
										</div>

										<FormMessage />
									</FormItem>
								)}
							/>

							<Button
								type="button"
								variant={'secondary'}
								className="gap-2"
								onClick={() => {
									setManagers([...managers, { id: managers.length + 1 }]);
									form.setValue('managers', [...form.getValues('managers'), { team: (data?.id as number) || null, person: '', profile: '', org, role: 1 }]);
								}}>
								<Plus size={12} />
								<Separator orientation="vertical" />
								Add manager
								<BriefcaseBusiness size={12} />
							</Button>

							<SubmitButton />
						</form>
					</Form>
				</section>
			</SheetContent>
		</Sheet>
	);
};
