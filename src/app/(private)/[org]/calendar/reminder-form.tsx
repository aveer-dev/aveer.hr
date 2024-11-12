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
import { Clock, Text, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tables, TablesInsert, TablesUpdate } from '@/type/database.types';
import { createReminder, updateReminder, deleteReminder } from './reminder.actions';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loader';
import { useRouter } from 'next/navigation';

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
			router.refresh();
			onCreateReminder();
			return;
		}

		const payload: TablesInsert<'reminders'> = { ...values, datetime, org, contract, profile };

		const response = await createReminder({ payload });
		setCreatingState(false);
		if (typeof response == 'string') return toast.error(response);

		toast.success('Reminder created successfully 🎉');
		router.refresh();
		onCreateReminder();
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
						<FormItem>
							<FormControl>
								<Input aria-label="Title" className="rounded-none border-0 border-b bg-transparent pl-0 font-medium outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0" placeholder="Reminder title" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem className="flex flex-row flex-wrap gap-2">
							<FormLabel>
								<Text size={14} className="mt-4" />
							</FormLabel>
							<FormControl>
								<Textarea className="w-[90%]" placeholder="Note, description or reason" {...field} />
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
									<DatePicker disabled={{ before: new Date() }} selected={field.value} onSetDate={field.onChange}>
										<button className="border-b border-dashed text-xs">{format(field.value, 'PPP')}</button>
									</DatePicker>
									<input min={getTime()} className="border-b border-dashed text-xs" value={time} onChange={event => setTime(event.target.value)} type="time" />
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="!mt-6 flex w-full justify-end space-x-4 text-right">
					{!!reminder && (
						<Button type="button" variant={'secondary_destructive'} onClick={() => onDeleteReminder()} className="mr-auto">
							{isDeleting ? <LoadingSpinner className="text-destructive" /> : <Trash2 size={14} />}
						</Button>
					)}

					{!date && (
						<Button type="button" variant={'outline'} onClick={() => onClose && onClose()}>
							Cancel
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
