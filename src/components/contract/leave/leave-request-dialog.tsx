'use client';

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { HardHat, MinusCircle, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { addBusinessDays, addDays, differenceInBusinessDays, format, isWeekend } from 'date-fns';
import { ReactNode, useEffect, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Label, labelVariants } from '@/components/ui/label';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Tables, TablesInsert } from '@/type/database.types';
import { LoadingSpinner } from '@/components/ui/loader';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
	dates: z.object({ from: z.date(), to: z.date() }),
	leave_type: z.enum(['sick', 'paid', 'paternity', 'maternity', 'unpaid']),
	note: z.string().min(2, { message: 'Enter leave note' }),
	hand_over: z.string().optional(),
	hand_over_note: z.string().optional()
});

const supabase = createClient();

interface props {
	onCreateLeave?: () => void;
	contract: Tables<'contracts'>;
	children?: ReactNode;
	data?: Tables<'time_off'>;
	orgSettings: Tables<'org_settings'> | null;
}

export const LeaveRequestDialog = ({ onCreateLeave, contract, children, data, orgSettings }: props) => {
	const [creatingRequest, setCreatingState] = useState(false);
	const [isDialoagOpen, toggleDialog] = useState(false);
	const [showHandover, setHandoverState] = useState(!!data?.hand_over);
	const [employees, setEmployees] = useState<{ id: number; job_title: string; profile: { first_name: string; last_name: string } }[]>([]);
	const [approvalPolicy, setPolicyDetails] = useState<any[]>([]);
	const router = useRouter();
	const [selectedLeaveType, setLeaveType] = useState(data?.leave_type || 'paid');
	const [leaveDaysUsed, setLeaveDaysUsed] = useState(((contract as any)[`${selectedLeaveType}_leave_used`] as number) || 0);
	const [leaveDays, setLeaveDays] = useState(((contract as any)[`${selectedLeaveType}_leave`] as number) || ((orgSettings as any)[`${selectedLeaveType}_leave`] as number) || 0);

	const getNextBusinessDay = (date: Date) => {
		while (isWeekend(date)) {
			date = addBusinessDays(date, 1);
		}

		return date;
	};

	const [date, setDate] = useState<DateRange | undefined>({
		from: data?.from ? new Date(data?.from) : getNextBusinessDay(new Date()),
		to: data?.to ? new Date(data?.to) : getNextBusinessDay(addDays(new Date(), 5))
	});

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			leave_type: data?.leave_type || 'paid',
			note: data?.note || '',
			hand_over_note: data?.hand_over_note || '',
			hand_over: data?.hand_over ? String((data?.hand_over as any)?.id || data?.hand_over) : '',
			dates: {
				from: data?.from ? new Date(data?.from) : date?.from,
				to: data?.to ? new Date(data?.to) : date?.to
			}
		}
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		setCreatingState(true);

		const leaveRequestData: TablesInsert<'time_off'> = {
			from: values.dates.from as any,
			to: values.dates.to as any,
			contract: contract.id as number,
			org: (contract.org as any).subdomain,
			leave_type: values.leave_type,
			hand_over_note: values.hand_over_note,
			note: values.note,
			status: approvalPolicy.length ? 'pending' : 'approved',
			profile: (contract.profile as any)?.id,
			levels: approvalPolicy
		};
		showHandover && (leaveRequestData.hand_over = Number(values.hand_over));

		const { error } = await supabase.from('time_off').insert(leaveRequestData);
		setCreatingState(false);
		if (error) return toast('❌ Oooops', { description: error.message });

		if (leaveRequestData.status == 'approved')
			await supabase
				.from('contracts')
				.update({ [`${leaveRequestData.leave_type}_leave_used`]: differenceInBusinessDays(leaveRequestData.to, leaveRequestData.from) + 1 + (contract[`${leaveRequestData.leave_type}_leave_used`] || 0) })
				.eq('id', contract.id);

		if (onCreateLeave) onCreateLeave();
		toggleDialog(false);
		toast('😎 Leave request sent', { description: 'Fingers crossed now 🤞🏾' });
		router.refresh();
	};

	useEffect(() => {
		if (date) form.setValue('dates', date as any);
	}, [date, form]);

	useEffect(() => {
		setLeaveDaysUsed(contract[`${selectedLeaveType}_leave_used`] || 0);
		setLeaveDays(((contract as any)[`${selectedLeaveType}_leave`] as number) || ((orgSettings as any)[`${selectedLeaveType}_leave`] as number) || 0);
	}, [contract, orgSettings, selectedLeaveType]);

	useEffect(() => {
		const getEmployees = async () => {
			const { data, error } = await supabase
				.from('contracts')
				.select('id, job_title, profile:profiles!contracts_profile_fkey(first_name, last_name)')
				.match({ org: (contract.org as any).subdomain, status: 'signed' });
			if (!data || error) return toast('🥺 Error', { description: 'Unable to fetch list of colleagues for leave request form' });
			if (data.length) setEmployees(() => data as any);
		};

		const getPolicy = async () => {
			const { data, error } = await supabase
				.from('approval_policies')
				.select()
				.match({ org: (contract.org as any).subdomain, is_default: true, type: 'time_off' });
			if (!data || error) return toast('🥺 Error', { description: 'Unable to fetch list of colleagues for leave request form' });
			setPolicyDetails(() => data[0]?.levels || []);
		};

		if ((contract.org as any).subdomain) {
			getEmployees();
			getPolicy();
		}
	}, [contract.org]);

	return (
		<Sheet onOpenChange={toggleDialog} open={isDialoagOpen}>
			{!children && (
				<SheetTrigger asChild>
					<Button variant="secondary">Request leave</Button>
				</SheetTrigger>
			)}

			{children && <SheetTrigger asChild>{children}</SheetTrigger>}

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
										<Select
											onValueChange={value => {
												setLeaveType(value as any);
												field.onChange(value);
											}}
											defaultValue={field.value}>
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
										<Calendar disabled={{ before: new Date() }} max={leaveDays - leaveDaysUsed} className="!mt-10" mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={1} />
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="note"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="flex items-center justify-between">Leave note</FormLabel>
										<FormControl>
											<Textarea placeholder="A short note about the reason for your leave, for who will be approving this leave" className="resize-none" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

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
																	{employee.profile.first_name} {employee.profile.last_name} - {employee.job_title}
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
								{!showHandover && (
									<Button type="button" onClick={() => setHandoverState(true)} variant={'secondary'} className="gap-2">
										<Plus size={12} />
										<Separator orientation="vertical" />
										Hand over
										<HardHat size={12} />
									</Button>
								)}
							</div>

							<Button disabled={creatingRequest} type="submit" className="w-full gap-2">
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
