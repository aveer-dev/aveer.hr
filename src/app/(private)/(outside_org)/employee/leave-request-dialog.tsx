import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { HardHat, MinusCircle, NotebookPen, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { addDays, format } from 'date-fns';
import { useEffect, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Label, labelVariants } from '@/components/ui/label';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { TablesInsert } from '@/type/database.types';
import { LoadingSpinner } from '@/components/ui/loader';

const formSchema = z.object({
	dates: z.object({ from: z.date(), to: z.date() }),
	leave_type: z.enum(['sick', 'paid', 'paternity', 'maternity', 'unpaid']),
	note: z.string().optional(),
	hand_over: z.string().optional(),
	hand_over_note: z.string().optional()
});

const supabase = createClient();

interface props {
	org: string;
	onCreateLeave?: () => void;
	contractId?: number;
	profileId?: string | null;
}

export const LeaveRequestDialog = ({ org, onCreateLeave, contractId, profileId }: props) => {
	const [creatingRequest, setCreatingState] = useState(false);
	const [isDialoagOpen, toggleDialog] = useState(false);
	const [showNote, setNoteState] = useState(false);
	const [showHandover, setHandoverState] = useState(false);
	const [employees, setEmployees] = useState<{ id: number; profile: { first_name: string; last_name: string } }[]>([]);
	const [date, setDate] = useState<DateRange | undefined>({
		from: new Date(),
		to: addDays(new Date(), 5)
	});

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			leave_type: 'paid',
			note: '',
			hand_over_note: ''
		}
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		setCreatingState(true);
		const leaveRequestData: TablesInsert<'time_off'> = {
			from: values.dates.from as any,
			to: values.dates.to as any,
			contract_id: contractId as number,
			org,
			leave_type: values.leave_type,
			hand_over: values.hand_over,
			hand_over_note: values.hand_over_note,
			note: values.note,
			status: 'pending',
			employee_id: profileId as string
		};

		const { error } = await supabase.from('time_off').insert(leaveRequestData);
		setCreatingState(false);
		if (error) return toast('❌ Oooops', { description: error.message });
		if (onCreateLeave) onCreateLeave();
		toggleDialog(false);
		toast('😎 Leave request sent', { description: 'Fingers crossed now 🤞🏾' });
	};

	useEffect(() => {
		if (date) form.setValue('dates', date as any);
	}, [date, form]);

	useEffect(() => {
		const getEmployees = async () => {
			const { data, error } = await supabase.from('contracts').select('id, profile:profiles!contracts_profile_fkey(first_name, last_name)').match({ org });
			if (!data || error) return toast('🥺 Error', { description: 'Unable to fetch list of colleagues for leave request form' });
			if (data.length) setEmployees(data as any);
		};

		if (org) getEmployees();
	}, [org]);

	return (
		<Sheet onOpenChange={toggleDialog} open={isDialoagOpen}>
			<SheetTrigger asChild>
				<Button variant="secondary">Request leave</Button>
			</SheetTrigger>

			<SheetContent className="overflow-auto">
				<SheetHeader>
					<SheetTitle>Leave request form</SheetTitle>
					<SheetDescription>Fill this form to request leave</SheetDescription>
				</SheetHeader>

				<section className="grid gap-4 py-10">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
							<FormField
								control={form.control}
								name="leave_type"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Leave type</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select a verified email to display" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="paid">Paid leave</SelectItem>
												<SelectItem value="sick">Sick leave</SelectItem>
												<SelectItem value="unpaid">Unpaid leave</SelectItem>
												<SelectItem value="maternity">Maternity leave</SelectItem>
												<SelectItem value="paternity">Paternity leave</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="dates"
								render={({ field }) => (
									<FormItem className="flex flex-col">
										<div className={cn(labelVariants())}>Leave schedule</div>
										<FormControl>
											<div className="mt-4 text-xs">
												{date?.from ? (
													date.to ? (
														<>
															{format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
														</>
													) : (
														format(date.from, 'LLL dd, y')
													)
												) : (
													<span>Pick a date</span>
												)}
											</div>
										</FormControl>
										<Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={1} />
										{/* <FormDescription>Select the date range you'll like to have your leave</FormDescription> */}
										<FormMessage />
									</FormItem>
								)}
							/>

							{showNote && (
								<FormField
									control={form.control}
									name="note"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="flex items-center justify-between">
												Leave note
												<Button onClick={() => setNoteState(false)} type="button" variant={'secondary'} className="h-6 w-6 text-muted-foreground" size={'icon'}>
													<MinusCircle size={12} />
												</Button>
											</FormLabel>
											<FormControl>
												<Textarea placeholder="A short note for who will be approving this leave" className="resize-none" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}

							{showHandover && (
								<div className="grid gap-3">
									<Label htmlFor="handover" className={cn('flex items-center justify-between')}>
										Handover details
										<Button id="handover" onClick={() => setHandoverState(false)} type="button" variant={'secondary'} className="h-6 w-6 text-muted-foreground" size={'icon'}>
											<MinusCircle size={12} />
										</Button>
									</Label>

									<div id="hand-over" className="space-y-6 rounded-md bg-accent p-2">
										<FormField
											control={form.control}
											name="hand_over"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Handover to </FormLabel>
													<Select onValueChange={field.onChange} defaultValue={field.value}>
														<FormControl>
															<SelectTrigger className="bg-background">
																<SelectValue placeholder="Select a colleague you'll like to handover to" />
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

										<FormField
											control={form.control}
											name="hand_over_note"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Handover note</FormLabel>
													<FormControl>
														<Textarea placeholder="A short note for the person you'll be handing over to" className="resize-none bg-background" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</div>
							)}

							<div className="flex gap-4">
								{!showNote && (
									<Button type="button" onClick={() => setNoteState(true)} variant={'secondary'} className="gap-2">
										<Plus size={12} />
										<Separator orientation="vertical" />
										Leave note
										<NotebookPen size={12} />
									</Button>
								)}

								{!showHandover && (
									<Button type="button" onClick={() => setHandoverState(true)} variant={'secondary'} className="gap-2">
										<Plus size={12} />
										<Separator orientation="vertical" />
										Hand over
										<HardHat size={12} />
									</Button>
								)}
							</div>

							<Button disabled={creatingRequest} type="submit" className="w-full">
								{creatingRequest && <LoadingSpinner />}
								{creatingRequest ? 'Requesting leave' : 'Request leave'}
							</Button>
						</form>
					</Form>
				</section>
			</SheetContent>
		</Sheet>
	);
};
