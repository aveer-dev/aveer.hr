import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CalendarRange, Info, Power, Settings2 } from 'lucide-react';
import { addEmployeeToCalendar, createOrgCalendar, enableOrganisationCalendar, removeEmployeeFromCalendar, updateEmployeeCalendarEvents } from './calendar-actions';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loader';
import { TextLoop } from '@/components/ui/text-loop';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { items } from './data';
import { ROLE } from '@/type/contract.types';
import { Label } from '@/components/ui/label';
import { Switch } from '../ui/switch';
import { Tables } from '@/type/database.types';
import { Alert, AlertDescription } from '../ui/alert';

interface props {
	isOpen?: boolean;
	org: string;
	orgCalendarConfig: { enable_calendar: boolean; calendar_employee_events: string[] | null } | null;
	employeeCalendarConfig?: Tables<'contract_calendar_config'>[] | null;
	role?: ROLE;
	contractId?: number;
	calendarId?: string;
}

const FormSchema = z.object({
	items: z.array(z.string()).refine(value => value.some(item => item), {
		message: 'You have to select at least one item.'
	})
});

export const CalendarConfigDialog = ({ org, isOpen, orgCalendarConfig, employeeCalendarConfig, role = 'admin', contractId, calendarId }: props) => {
	const [isAddOpen, toggleAdd] = useState(isOpen || false);
	const [isLoading, setLoading] = useState(false);
	const [animationIndex, setAnimationIndex] = useState(orgCalendarConfig?.enable_calendar ? 1 : 0);
	const [enableGoogleCalendar, setEnableGoogleCalendar] = useState(!!employeeCalendarConfig?.find(config => config.platform === 'google'));

	const enableOrgCalendar = async () => {
		setLoading(true);
		try {
			await Promise.all([enableOrganisationCalendar(org), createOrgCalendar(org)]);
			setAnimationIndex(1);
			setLoading(false);
		} catch (error: any) {
			setLoading(false);
			setAnimationIndex(0);
			toast.error(error.message);
		}
	};

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			items: [...(orgCalendarConfig?.calendar_employee_events || [])]
		}
	});

	const onSubmit = async (data: z.infer<typeof FormSchema>) => {
		try {
			await updateEmployeeCalendarEvents({ org, events: data.items });
			toggleAdd(false);
		} catch (error: any) {
			toast.error(error.message);
		}
	};

	const toggleCalendarAccess = async (state: boolean) => {
		if (!employeeCalendarConfig || !calendarId) return;
		setLoading(true);
		setEnableGoogleCalendar(state);

		try {
			await (state ? addEmployeeToCalendar({ org, platform: 'google', platform_id: '', contract: contractId, calendar_id: calendarId }) : removeEmployeeFromCalendar({ org, platform: 'google', platformId: employeeCalendarConfig[0].platform_id, calendarId: calendarId }));
			setLoading(false);
		} catch (error) {
			toast.error((error as any)?.message || error);
			setEnableGoogleCalendar(!state);
			setLoading(false);
		}
	};

	return (
		<AlertDialog open={isAddOpen} onOpenChange={state => toggleAdd(state)}>
			<AlertDialogTrigger asChild>
				<Button variant="ghost">
					<Settings2 size={16} />
				</Button>
			</AlertDialogTrigger>

			<AlertDialogContent className="pt-0">
				<CalendarRange size={24} />
				{role === 'admin' && (
					<>
						<TextLoop auto={false} activeIndex={animationIndex} className="whitespace-normal">
							<div>
								<AlertDialogTitle>Synchronize calendar</AlertDialogTitle>
								<AlertDialogDescription className="mt-3 text-sm leading-6">Enable employees see organisation wide events/meetings and automatically connect to their personal calendars so that nobody will ever miss anything.</AlertDialogDescription>
							</div>
							<div>
								<AlertDialogTitle>Calendar configurations</AlertDialogTitle>
								<AlertDialogDescription className="text-sm font-light leading-6">Set events employees are allowed to see.</AlertDialogDescription>
							</div>
						</TextLoop>

						<TextLoop auto={false} activeIndex={animationIndex} className="whitespace-normal">
							<AlertDialogFooter className="mt-4 items-start sm:justify-start">
								<Button className="w-fit min-w-24" disabled={isLoading} onClick={enableOrgCalendar}>
									Enable {isLoading ? <LoadingSpinner className="ml-3" /> : <Power size={12} className="ml-3" />}
								</Button>

								<AlertDialogCancel>Cancel</AlertDialogCancel>
							</AlertDialogFooter>

							<Form {...form}>
								<form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-8">
									<FormField
										control={form.control}
										name="items"
										render={() => (
											<FormItem className="space-y-4">
												{items.map(item => (
													<FormField
														key={item.id}
														control={form.control}
														name="items"
														render={({ field }) => {
															return (
																<FormItem key={item.id} className="flex flex-row items-start justify-between space-x-3 space-y-0 rounded-md bg-secondary p-2">
																	<FormLabel className="text-sm font-normal">{item.label}</FormLabel>
																	<FormControl>
																		<Checkbox
																			checked={field.value?.includes(item.id)}
																			onCheckedChange={checked => {
																				return checked ? field.onChange([...field.value, item.id]) : field.onChange(field.value?.filter(value => value !== item.id));
																			}}
																		/>
																	</FormControl>
																</FormItem>
															);
														}}
													/>
												))}
												<FormMessage />
											</FormItem>
										)}
									/>

									<AlertDialogFooter className="mt-4 items-start sm:justify-start">
										<Button type="submit" className="min-w-24" disabled={form.formState.isSubmitting}>
											{form.formState.isSubmitting ? 'Updating' : 'Update'} {form.formState.isSubmitting && <LoadingSpinner className="ml-3" />}
										</Button>

										<AlertDialogCancel>Cancel</AlertDialogCancel>
									</AlertDialogFooter>
								</form>
							</Form>
						</TextLoop>
					</>
				)}

				{role !== 'admin' && (
					<>
						<AlertDialogTitle>Connect to personal calendar</AlertDialogTitle>
						<AlertDialogDescription className="-mt-2 text-sm leading-6">Connect company&apos;s calendar of general calendar occasions within the company.</AlertDialogDescription>

						<ul>
							<li className="flex flex-row items-start justify-between space-x-3 space-y-0 rounded-md bg-secondary p-2">
								<Label className="text-sm font-normal">Google calendar</Label>

								<div className="flex items-center gap-3">
									{isLoading && <LoadingSpinner />}
									<Switch disabled={isLoading} className="scale-75" checked={enableGoogleCalendar} onCheckedChange={checked => toggleCalendarAccess(checked)} />
								</div>
							</li>
						</ul>

						{enableGoogleCalendar && (
							<Alert>
								<Info className="h-4 w-4" />
								<AlertDescription className="text-xs text-muted-foreground">Look out for an email from aveer.calendar@gmail.com to accept calendar invite after enabling Google calendar.</AlertDescription>
							</Alert>
						)}

						<AlertDialogFooter className="mt-4 items-start sm:justify-start">
							<AlertDialogCancel disabled={isLoading}>Close</AlertDialogCancel>
						</AlertDialogFooter>
					</>
				)}
			</AlertDialogContent>
		</AlertDialog>
	);
};
