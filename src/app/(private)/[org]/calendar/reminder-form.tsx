import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Textarea } from '@/components/ui/textarea';
import { getTime } from '@/lib/utils';
import { useState } from 'react';
import { format } from 'date-fns';
import { Clock, LetterText, Text, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tables, TablesInsert, TablesUpdate } from '@/type/database.types';
import { createReminder, updateReminder, deleteReminder } from './reminder.actions';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loader';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { ReminderSync } from './reminder-sync';

const formSchema = z.object({
	title: z.string().min(2, { message: 'Enter reminder title' }),
	description: z.string().min(2, { message: 'Enter reminder description' }),
	datetime: z.date({ message: 'Select reminder date' })
});

export const ReminderForm = ({ date, org, contract, profile, onCreateReminder, onClose, reminder }: { onClose?: () => void; date?: Date; org: string; contract: number; profile: string; onCreateReminder: () => void; reminder?: Tables<'reminders'> }) => {
	const [isCreating, setCreatingState] = useState(false);
	const [isDeleting, setDeletingState] = useState(false);
	const [time, setTime] = useState(getTime(reminder?.datetime));
	const router = useRouter();
	const [activeReminder, setActiveReminder] = useState<Tables<'reminders'> | undefined>(reminder);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: reminder?.title || '',
			description: reminder?.description || '',
			datetime: reminder?.datetime ? new Date(reminder.datetime) : date || new Date()
		}
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		setCreatingState(true);
		const datetime = new Date(`${format(values.datetime, 'yyyy-MM-dd')} ${time}`).toISOString();

		if (reminder) {
			const payload: TablesUpdate<'reminders'> = { ...values, datetime, org };

			const response = await updateReminder({ payload, id: reminder.id });
			setCreatingState(false);
			if (typeof response == 'string') return toast.error(response);

			toast.success('Reminder updated successfully 🎉');
			setActiveReminder(response);
			return;
		}

		const payload: TablesInsert<'reminders'> = { ...values, datetime, org, contract, profile };

		const response = await createReminder({ payload });
		setCreatingState(false);
		if (typeof response == 'string') return toast.error(response);

		toast.success('Reminder created successfully 🎉');
		setActiveReminder(response);
	};

	const onDeleteReminder = async () => {
		setDeletingState(true);

		const response = await deleteReminder({ id: reminder?.id as number, org: reminder?.org as string });
		setCreatingState(false);
		if (typeof response == 'string') return toast.error(response);

		toast.success('Reminder deleted successfully');
		router.refresh();
		onCreateReminder();
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="title"
					render={({ field }) => (
						<FormItem className="flex flex-row items-center gap-2">
							<FormLabel>
								<LetterText size={14} className="mt-4" />
							</FormLabel>

							<FormControl>
								<Input aria-label="Title" className="" placeholder="Reminder title" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem className="flex flex-row gap-2">
							<FormLabel>
								<Text size={14} className="mt-4" />
							</FormLabel>

							<FormControl>
								<Textarea placeholder="Note, description or reason" {...field} />
							</FormControl>
							<FormMessage className="w-full" />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="datetime"
					render={({ field }) => (
						<FormItem className="flex flex-row items-center gap-2.5">
							<FormLabel>
								<Clock size={14} className="mt-2" />
							</FormLabel>

							<FormControl>
								<div className="flex items-center gap-6">
									<DatePicker disabled={{ before: new Date() }} selected={field.value} onSetDate={date => field.onChange(new Date(`${format(date, 'yyyy-MM-dd')} ${time}`))}>
										<button className="border-b border-dashed text-xs">{format(field.value, 'PPP')}</button>
									</DatePicker>

									<input className="border-b border-dashed text-xs" value={time} onChange={event => setTime(event.target.value)} type="time" />
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{activeReminder && activeReminder?.title == form.getValues('title') && activeReminder?.description == form.getValues('description') && new Date(activeReminder?.datetime).toString() == form.getValues('datetime').toString() && (
					<>
						<Separator className="!mt-6" />
						<ReminderSync reminder={activeReminder} />
						<Separator />
					</>
				)}

				<div className="!mt-6 flex w-full justify-end space-x-4 text-right">
					{!!reminder && (
						<Button type="button" variant={'secondary_destructive'} onClick={() => onDeleteReminder()} className="mr-auto">
							{isDeleting ? <LoadingSpinner className="text-destructive" /> : <Trash2 size={14} />}
						</Button>
					)}

					{!date && (
						<Button type="button" variant={'outline'} onClick={() => onClose && onClose()}>
							Close
						</Button>
					)}

					<Button className="gap-3" disabled={isCreating} type="submit">
						{isCreating && <LoadingSpinner />}
						{reminder ? 'Update' : 'Create'} reminder
					</Button>
				</div>
			</form>
		</Form>
	);
};
