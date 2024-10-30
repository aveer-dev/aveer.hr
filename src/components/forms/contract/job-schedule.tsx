'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { UseFormReturn } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

interface props {
	form: UseFormReturn<any>;
	isDialogOpen: boolean;
	openDialog: (state: boolean) => void;
}

export const JobScheduleDialog = ({ isDialogOpen, openDialog, form }: props) => {
	return (
		<Sheet open={isDialogOpen} onOpenChange={openDialog}>
			<SheetContent className="w-full overflow-auto pb-24 sm:max-w-sm">
				<SheetHeader className="mb-6">
					<SheetTitle>Update Additional Offering</SheetTitle>

					<Alert className="!mt-10 bg-accent">
						<AlertDescription>
							<SheetDescription className="text-xs">
								This form values are set from organisation policy details in{' '}
								<Link className="inline-flex items-center rounded-md bg-background px-1" href={'../settings?type=org#employee-policies'}>
									settings <ArrowUpRight size={12} />
								</Link>
								, editing them here will update it just for this role/job. Edit organisation policies here{' '}
							</SheetDescription>
						</AlertDescription>
					</Alert>
				</SheetHeader>

				<div className="grid gap-4 py-6">
					<Form {...form}>
						<form className="space-y-8">
							<div className="grid w-full gap-3">
								<Label htmlFor="work-schedule">Work schedule</Label>
								<div className="grid w-full grid-cols-2 gap-6">
									<FormField
										control={form.control}
										name="work_schedule"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<div className="relative h-fit w-full">
														<Input id="work-schedule" type="text" placeholder="40" {...field} required />
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

							<div className="grid grid-cols-2 gap-6">
								<FormField
									control={form.control}
									name="paid_leave"
									render={({ field }) => (
										<FormItem>
											<FormLabel htmlFor="paid_leave">Annual leave</FormLabel>
											<div className="relative h-fit w-full">
												<FormControl>
													<Input id="paid_leave" type="number" placeholder="20" {...field} onChange={event => form.setValue('paid_leave', Number(event.target.value))} required />
												</FormControl>
												<div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-thin text-foreground">days/year</div>
											</div>
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
											<div className="relative h-fit w-full">
												<FormControl>
													<Input type="number" placeholder="20" {...field} onChange={event => form.setValue('sick_leave', Number(event.target.value))} required />
												</FormControl>
												<div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-thin text-foreground">days/year</div>
											</div>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="probation_period"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Probation period</FormLabel>
										<div className="relative h-fit w-full">
											<FormControl>
												<Input type="number" placeholder="90" {...field} onChange={event => form.setValue('probation_period', Number(event.target.value))} required />
											</FormControl>
											<div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-thin text-foreground">days</div>
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button onClick={() => openDialog(false)} type="button" size={'sm'} className="mt-8 w-full gap-2">
								Update
							</Button>
						</form>
					</Form>
				</div>
			</SheetContent>
		</Sheet>
	);
};
