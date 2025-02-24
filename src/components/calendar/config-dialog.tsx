import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Fragment, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CalendarRange, Check, Info, Power, Settings2 } from 'lucide-react';
import { addEmployeeToCalendar, getAuthLink, removeEmployeeFromCalendar, updateEmployeeCalendarEvents } from './calendar-actions';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loader';

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
import { Separator } from '../ui/separator';

interface props {
	isOpen?: boolean;
	org: string;
	orgCalendarConfig: { enable_thirdparty_calendar: boolean; calendar_employee_events: string[] | null } | null;
	employeeCalendarConfig?: Tables<'contract_calendar_config'>[] | null;
	role?: ROLE;
	contractId?: number;
	calendar?: Tables<'calendars'> | null;
}

const FormSchema = z.object({
	items: z.array(z.string()).refine(value => value.some(item => item), {
		message: 'You have to select at least one item.'
	})
});

export const CalendarConfigDialog = ({ org, isOpen, orgCalendarConfig, employeeCalendarConfig, role = 'admin', contractId, calendar }: props) => {
	const [isAddOpen, toggleAdd] = useState(isOpen || false);
	const [isConnecting, setConnectingState] = useState(false);
	const [isLoading, setLoading] = useState(false);
	const [enableGoogleCalendar, setEnableGoogleCalendar] = useState(!!employeeCalendarConfig?.find(config => config.platform === 'google'));

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
		if (!employeeCalendarConfig || !calendar?.calendar_id) return;
		setLoading(true);
		setEnableGoogleCalendar(state);

		try {
			await (state
				? addEmployeeToCalendar({ org, platform: 'google', platform_id: '', contract: contractId, calendar_id: calendar.calendar_id })
				: removeEmployeeFromCalendar({ org, platform: 'google', platformId: employeeCalendarConfig[0].platform_id, calendarId: calendar.calendar_id }));
			setLoading(false);
		} catch (error) {
			toast.error((error as any)?.message || error);
			setEnableGoogleCalendar(!state);
			setLoading(false);
		}
	};

	const connectGoogleCalendar = async () => {
		setConnectingState(true);
		const response = await getAuthLink(org);
		window.open(response, '_self');
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
						<AlertDialogTitle>Calendar configurations</AlertDialogTitle>
						<AlertDialogDescription className="sr-only">Calendar thrid-party connections and settings</AlertDialogDescription>

						<div className="mt-6 flex items-center justify-between">
							<div className="text-sm text-support">Connect Google Calendar</div>
							<Button disabled={!!(calendar && calendar.platform == 'google' && calendar?.calendar_id)} className="gap-3" onClick={connectGoogleCalendar}>
								{!!(calendar && calendar.platform == 'google' && calendar?.calendar_id) ? <>{isConnecting ? <LoadingSpinner /> : <Check size={12} />} Connected</> : 'Connect'}
							</Button>
						</div>

						<Separator />

						<p className="mb-3 mt-6 text-xs font-light leading-6 text-label">Set events employees are allowed to see.</p>
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
								<FormField
									control={form.control}
									name="items"
									render={() => (
										<FormItem className="space-y-4">
											{items.map((item, index) => (
												<Fragment key={index}>
													<FormField
														key={item.id}
														control={form.control}
														name="items"
														render={({ field }) => {
															return (
																<FormItem key={item.id} className="flex flex-row items-start justify-between space-x-3 space-y-0">
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

													{index !== items.length - 1 && <Separator />}
												</Fragment>
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
