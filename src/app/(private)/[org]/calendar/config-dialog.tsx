import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CalendarRange, Power, Settings2 } from 'lucide-react';
import { createOrgCalendar, enableOrganisationCalendar, updateEmployeeCalendarEvents } from './calendar-actions';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loader';
import { TextLoop } from '@/components/ui/text-loop';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface props {
	onClose?: () => void;
	isOpen?: boolean;
	org: string;
	calendar: { enable_calendar: boolean; calendar_employee_events: string[] | null } | null;
}

const items = [
	{
		id: 'time-off',
		label: 'Leave/time-off days'
	},
	{
		id: 'birthdays',
		label: 'Birthdays'
	},
	{
		id: 'employment-aniversaries',
		label: 'Employment aniversaries'
	}
];

const FormSchema = z.object({
	items: z.array(z.string()).refine(value => value.some(item => item), {
		message: 'You have to select at least one item.'
	})
});

export const CalendarConfigDialog = ({ org, isOpen, onClose, calendar }: props) => {
	const [isAddOpen, toggleAdd] = useState(isOpen || false);
	const [isLoading, setLoading] = useState(false);
	const [animationIndex, setAnimationIndex] = useState(calendar?.enable_calendar ? 1 : 0);

	const enableOrgCalendar = async () => {
		setLoading(true);
		try {
			const [_, calendarRes] = await Promise.all([enableOrganisationCalendar(org), createOrgCalendar(org)]);
			console.log('🚀 ~ enableOrgCalendar ~ calendarRes:', JSON.parse(calendarRes));
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
			items: [...(calendar?.calendar_employee_events || [])]
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

	return (
		<AlertDialog
			open={isAddOpen}
			onOpenChange={state => {
				toggleAdd(state);
				onClose && onClose();
			}}>
			<AlertDialogTrigger asChild>
				<Button variant="ghost">
					<Settings2 size={16} />
				</Button>
			</AlertDialogTrigger>

			<AlertDialogContent className="pt-0">
				<CalendarRange size={24} />
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
						<Button className="w-fit" onClick={enableOrgCalendar}>
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
								<AlertDialogCancel>Cancel</AlertDialogCancel>

								<Button type="submit" className="min-w-24" disabled={form.formState.isSubmitting}>
									{form.formState.isSubmitting ? 'Updating' : 'Update'} {form.formState.isSubmitting && <LoadingSpinner className="ml-3" />}
								</Button>
							</AlertDialogFooter>
						</form>
					</Form>
				</TextLoop>
			</AlertDialogContent>
		</AlertDialog>
	);
};
