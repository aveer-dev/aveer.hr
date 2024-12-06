'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Tables, TablesUpdate } from '@/type/database.types';
import { LoadingSpinner } from '@/components/ui/loader';
import { AdditionalOffering } from '@/components/forms/additional-offering';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const formSchema = z.object({
	work_schedule: z.string().optional(),
	work_shedule_interval: z.string().optional(),
	probation: z.number(),
	paid_leave: z.number(),
	sick_leave: z.number(),
	maternity_leave: z.number(),
	paternity_leave: z.number(),
	additional_offerings: z.array(z.string())
});

export const EmployeeBenefitsForm = ({ data, updateBenefits }: { data?: Tables<'org_settings'> | null; updateBenefits: (benefits: TablesUpdate<'org_settings'>) => Promise<string | true> }) => {
	const [showAdditionalOffering, toggleAdditionalOffering] = useState(!!data?.additional_offerings);
	const [isSubmiting, toggleSubmitState] = useState(false);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			additional_offerings: (data?.additional_offerings as string[]) || [],
			probation: data?.probation || 90,
			paid_leave: data?.paid_leave || 20,
			sick_leave: data?.sick_leave || 20,
			work_schedule: data?.work_schedule || '8',
			maternity_leave: data?.maternity_leave || 60,
			paternity_leave: data?.paternity_leave || 20,
			work_shedule_interval: data?.work_shedule_interval || 'daily'
		}
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		toggleSubmitState(true);

		const benefits: TablesUpdate<'org_settings'> = { ...values };

		const response = await updateBenefits(benefits);
		toggleSubmitState(false);
		if (response == true) toast('✅ Awesome', { description: 'Company wide benefits updated successfully' });
		else toast('😬 Ooops', { description: response });
	};

	return (
		<>
			<Form {...form}>
				<form className="grid w-full gap-6" onSubmit={form.handleSubmit(onSubmit)}>
					{/* job schedule */}
					<div className="grid gap-6">
						<div>
							<h2 className="font-semibold">Leave schedule</h2>
							<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">How many leave days are empployees eligible for</p>
						</div>

						<div className="mb-10 grid gap-8">
							<div className="grid grid-cols-2 gap-6">
								<FormField
									control={form.control}
									name="paid_leave"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Annual leave</FormLabel>
											<FormControl>
												<div className="relative h-fit w-full">
													<Input type="number" inputMode="numeric" placeholder="20" {...field} onChange={event => form.setValue('paid_leave', Number(event.target.value))} required />
													<div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-thin text-foreground">days/year</div>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="sick_leave"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Sick leave</FormLabel>
											<FormControl>
												<div className="relative h-fit w-full">
													<Input type="number" inputMode="numeric" placeholder="20" {...field} onChange={event => form.setValue('sick_leave', Number(event.target.value))} required />
													<div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-thin text-foreground">days/year</div>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="maternity_leave"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Maternity leave</FormLabel>
											<div className="relative h-fit w-full">
												<FormControl>
													<Input type="number" inputMode="numeric" placeholder="20" {...field} onChange={event => form.setValue('maternity_leave', Number(event.target.value))} required />
												</FormControl>
												<div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-thin text-foreground">days/year</div>
											</div>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="paternity_leave"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Paternity leave</FormLabel>
											<div className="relative h-fit w-full">
												<FormControl>
													<Input type="number" inputMode="numeric" placeholder="20" {...field} onChange={event => form.setValue('paternity_leave', Number(event.target.value))} required />
												</FormControl>
												<div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-thin text-foreground">days/year</div>
											</div>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>
					</div>

					<div className="grid gap-6">
						<div>
							<h2 className="font-semibold">Schedule</h2>
							<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">These settings describes permitted periods and work schedule</p>
						</div>

						<div className="mb-10 grid gap-8">
							<div className="grid w-full gap-3">
								<Label>Work schedule</Label>
								<div className="grid w-full grid-cols-2 gap-6">
									<FormField
										control={form.control}
										name="work_schedule"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<div className="relative h-fit w-full">
														<Input type="text" placeholder="40" {...field} required />
														<div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-thin text-foreground">hours</div>
													</div>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="work_shedule_interval"
										render={({ field }) => (
											<FormItem>
												<Select onValueChange={field.onChange} defaultValue={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Daily, weekly or monthly?" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="weekly">Weekly</SelectItem>
														<SelectItem value="monthly">Monthly</SelectItem>
														<SelectItem value="daily">Daily</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>

							<FormField
								control={form.control}
								name="probation"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Probation period</FormLabel>
										<FormControl>
											<div className="relative h-fit w-full">
												<Input type="number" placeholder="90" {...field} onChange={event => form.setValue('probation', Number(event.target.value))} required />
												<div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-thin text-foreground">days</div>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>

					{/* compensation */}
					<div className="grid gap-6">
						<div>
							<h2 className="font-semibold">Compensation</h2>
							<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">These settings describes those additional benefits available company wide.</p>
						</div>

						<div className="mb-8 grid gap-8">
							<AdditionalOffering toggle={toggleAdditionalOffering} isToggled={showAdditionalOffering} form={form} />
						</div>
					</div>

					<Button disabled={isSubmiting} type="submit" size={'sm'} className="w-full gap-3 text-sm font-light">
						{isSubmiting && <LoadingSpinner />}
						{isSubmiting ? 'Updating benefits' : 'Update benefits'}
					</Button>
				</form>
			</Form>
		</>
	);
};
