'use client';

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Tables, TablesInsert } from '@/type/database.types';
import { ReactNode, useCallback, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { ChevronRightIcon, CircleMinus, List, Plus, Trash2, TriangleAlert } from 'lucide-react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/ui/loader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { createBoarding, deleteBoarding, updateBoarding } from './boarding.action';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { generateRandomString } from '@/utils/generate-string';

interface props {
	data?: Tables<'boaring_check_list'>;
	children?: ReactNode;
	className?: string;
	org: string;
}

const formSchema = z.object({
	name: z.string().min(1, { message: 'Provide team name' }),
	description: z.string().optional(),
	type: z.enum(['off', 'on']),
	is_default: z.boolean().optional(),
	policy: z.string(),
	checklist: z.object({ item: z.string(), description: z.string().optional(), created_at: z.string().optional(), id: z.string() }).array().min(1, { message: 'Add at least one item' }),
	org: z.string()
});

const supabase = createClient();

export const Boarding = ({ data, children, className, org }: props) => {
	const [isUpdating, setUpdateState] = useState(false);
	const [isDeleting, setDeleteState] = useState(false);
	const [items, updateItems] = useState<{ item: string; description: string; created_at?: string }[]>([]);
	const [defaultBoarding, setDefaultBoarding] = useState<Tables<'boaring_check_list'>[]>();
	const [policies, setPolicies] = useState<Tables<'approval_policies'>[]>();
	const [isDialogOpen, toggleDialogState] = useState(false);
	const router = useRouter();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: { name: data?.name || '', org, description: data?.description || '', checklist: (data?.checklist as any) || [], type: data?.type, is_default: data?.is_default, policy: data?.policy ? String(data?.policy) : '' }
	});

	const getDefaultBoarding = useCallback(
		async (type: string) => {
			const { data, error } = await supabase.from('boaring_check_list').select().match({ type, org, is_default: true });
			if (error) toast.error('Error checking default on/off-boading', { description: error.message });
			if (data) setDefaultBoarding(data);
		},
		[org]
	);

	const getPolicies = useCallback(async () => {
		const { data, error } = await supabase.from('approval_policies').select().match({ type: 'boarding', org });
		if (error) toast.error('Error getting policies', { description: error.message });
		if (data) setPolicies(data);
	}, [org]);

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		setUpdateState(true);
		const payload: TablesInsert<'boaring_check_list'> = { ...values, is_default: !!values.is_default, policy: Number(values.policy) };
		const response = data ? await updateBoarding(payload, data.id, org) : await createBoarding(payload, org);
		setUpdateState(false);

		if (data && response !== 'Update') return toast.error('Error', { description: response });
		if (!data && response !== true) return toast.error('Error', { description: response });

		toggleDialogState(false);
		toast.success(`${values.type}boading items updated`);
		router.refresh();
	};

	const addChecklistItem = () => {
		updateItems([...items, { item: '', description: '' }]);
		form.setValue('checklist', [...form.getValues('checklist'), { item: '', description: '', id: generateRandomString(5) }]);
	};

	const removeChecklistItem = (index: number) => {
		items.splice(index, 1);
		updateItems([...items]);

		form.getValues('checklist').splice(index, 1);
	};

	const onDeleteBoarding = async (id: number) => {
		setDeleteState(true);

		const response = await deleteBoarding(org, id);
		setDeleteState(false);
		if (response !== true) return toast.error('Error deleting checklist', { description: response });

		toast.success(`Checklist deleted`, { description: `Checklist has been deleted successfully` });
		toggleDialogState(false);
		router.refresh();
	};

	return (
		<Sheet
			open={isDialogOpen}
			onOpenChange={state => {
				toggleDialogState(state);

				if (state == true) {
					getPolicies();

					if (data?.checklist) {
						updateItems([...structuredClone(data?.checklist as any[])]);
						form.setValue('checklist', data?.checklist as any[]);
					}
				}
			}}>
			<SheetTrigger asChild>
				<button type="button" className={cn('w-full', !data && !children && buttonVariants(), className)}>
					{data && !children && (
						<Card className="flex w-full items-center justify-between p-5 text-left transition-all duration-500 hover:bg-accent/60">
							<div className="space-y-1">
								<h4 className="text-xs font-semibold">{data?.name}</h4>
								<p className="text-xs font-light capitalize text-muted-foreground">{data.type}boarding</p>
							</div>

							<div className="flex items-center gap-2">
								{data.is_default && (
									<Badge className="py-px text-xs font-light text-muted-foreground" variant={'secondary'}>
										{data.is_default && 'default'}
									</Badge>
								)}
								<ChevronRightIcon size={12} />
							</div>
						</Card>
					)}

					{!data && !children && 'Add checklist'}

					{!!children && children}
				</button>
			</SheetTrigger>

			<SheetContent className="overflow-y-auto">
				<SheetHeader>
					<SheetTitle>Onboarding / Offboarding checklist</SheetTitle>
					<SheetDescription>Manage checklist items for employees here</SheetDescription>
				</SheetHeader>

				<section className="mt-10 grid gap-4 py-4">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
							<FormField
								control={form.control}
								name="type"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Type</FormLabel>
										<Select
											onValueChange={value => {
												field.onChange(value);
												getDefaultBoarding(value);
											}}
											defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select either onboarding or offboarding" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="on">Onboarding</SelectItem>
												<SelectItem value="off">Offboarding</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

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
								name="policy"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Approval policy</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select approval policy" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{policies?.map(policy => (
													<SelectItem key={policy.id} value={String(policy.id)}>
														{policy.name}
													</SelectItem>
												))}
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
											<FormLabel className="text-xs text-foreground">Make default</FormLabel>
											<FormDescription className="max-w-64 text-xs font-light">
												Enabling this will make this the default <span className="font-semibold">{form.getValues('type')}</span>boarding checklist for everyone
											</FormDescription>
										</div>

										<FormControl>
											<Switch disabled={defaultBoarding && defaultBoarding?.length > 0 && defaultBoarding[0].id !== data?.id} className="!m-0 scale-75" checked={field.value} onCheckedChange={field.onChange} />
										</FormControl>
									</FormItem>
								)}
							/>

							{defaultBoarding && defaultBoarding?.length > 0 && defaultBoarding[0].id !== data?.id && (
								<Alert className="text-xs">
									<TriangleAlert size={14} className="stroke-orange-400" />
									<AlertTitle>Current default</AlertTitle>
									<AlertDescription className="text-xs font-light text-muted-foreground">&quot;{defaultBoarding[0]?.name}&quot; is the current default. You&apos;ll have to remove it as default to set another default</AlertDescription>
								</Alert>
							)}

							<FormField
								control={form.control}
								name="checklist"
								render={() => (
									<FormItem>
										<FormLabel>
											<h2 className="mb-4 mt-16 text-sm font-medium text-foreground">Checklist</h2>
										</FormLabel>

										{items.length > 0 && (
											<ul className="w-full space-y-8">
												{items.map((_item, index) => (
													<li key={index} className="w-full space-y-4">
														<FormField
															control={form.control}
															name={`checklist.${index}.item`}
															render={({ field }) => (
																<FormItem>
																	<FormLabel className="flex items-center justify-between">
																		<div>Item {index + 1} *</div>

																		<Button type="button" onClick={() => removeChecklistItem(index)} variant={'ghost_destructive'} className="h-5 w-5 p-0">
																			<CircleMinus size={12} />
																		</Button>
																	</FormLabel>

																	<FormControl>
																		<Input {...field} value={form.getValues(`checklist.${index}.item`)} placeholder="E.g Return company laptop" />
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>

														<FormField
															control={form.control}
															name={`checklist.${index}.description`}
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Description</FormLabel>
																	<FormControl>
																		<Textarea {...field} value={form.getValues(`checklist.${index}.description`)} placeholder="You can explain how to get this item done here" />
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
													</li>
												))}
											</ul>
										)}

										{items.length == 0 && (
											<div className="flex min-h-32 flex-col items-center justify-center gap-3 rounded-md bg-accent/70 text-xs text-muted-foreground">
												<p>No items added yet</p>
												<Button type="button" className="gap-2" variant={'outline'} onClick={addChecklistItem}>
													<Plus size={12} />
													Add item
												</Button>
											</div>
										)}

										<FormMessage />
									</FormItem>
								)}
							/>

							{items.length > 0 && (
								<Button type="button" variant={'secondary'} className="gap-2" onClick={addChecklistItem}>
									<Plus size={12} />
									<Separator orientation="vertical" />
									Add item
									<List size={12} />
								</Button>
							)}

							<div className="flex items-center gap-4">
								{data?.id && (
									<Button type="button" onClick={() => onDeleteBoarding(data?.id)} variant={'secondary_destructive'} size={'icon'} className="w-16 gap-3">
										{!isDeleting && <Trash2 size={12} />}
										{isDeleting && <LoadingSpinner className="text-inherit" />}
									</Button>
								)}

								<Button type="submit" disabled={isUpdating} size={'sm'} className="w-full gap-3 px-4 text-xs font-light">
									{isUpdating && <LoadingSpinner />}
									{isUpdating ? (data ? 'Updating checklist' : 'Creating checklist') : data ? 'Update checklist' : 'Create checklist'}
								</Button>
							</div>
						</form>
					</Form>
				</section>
			</SheetContent>
		</Sheet>
	);
};
