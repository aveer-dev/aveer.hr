'use client';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { createAppraisalSettings, updateAppraisalSettings } from '@/components/appraisal-forms/appraisal.actions';
import { Tables, TablesInsert, TablesUpdate } from '@/type/database.types';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loader';
import { useRouter } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { Input } from '../ui/input';

const formSchema = z.object({
	frequency: z.string().min(2, { message: 'Select how often employees will answer appraisal questions' }),
	start_date: z.string().optional(),
	timeline: z.number()
});

interface props {
	org: string;
	settings?: Tables<'appraisal_settings'>;
}

export const AppraisalSettingsForm = ({ org, settings }: props) => {
	const [isSettingupAppraisal, setAppraisalState] = useState(false);
	const [isUpdatingAppraisal, setAppraisalUpdateState] = useState(false);
	const [appraisalSettings, setAppraisalSettings] = useState(settings);
	const [showStartDate, setStartDateState] = useState(!!appraisalSettings?.start_date);
	const router = useRouter();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			frequency: settings?.frequency || 'annually',
			start_date: settings?.start_date || '',
			timeline: settings?.timeline || 2
		}
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		if (!appraisalSettings) return;
		setAppraisalUpdateState(true);
		const payload: TablesUpdate<'appraisal_settings'> = values;
		const response = await updateAppraisalSettings(payload, appraisalSettings?.id, org);
		setAppraisalUpdateState(false);

		if (typeof response == 'string') return toast.error('Error updating appraisal settings', { description: response });

		toast.success('Appraisal settings updated successfully');
	};

	const createAppraisal = async () => {
		setAppraisalState(true);
		const payload: TablesInsert<'appraisal_settings'> = { frequency: 'annually', org };
		const response = await createAppraisalSettings(payload);
		setAppraisalState(false);
		if (typeof response == 'string') return toast.error('Error setting up appraisal', { description: response });

		toast.success('Appraisal has been setup successfully');
		setAppraisalSettings(response[0]);
		form.setValue('frequency', response[0].frequency);
		form.setValue('timeline', response[0].timeline);
		router.refresh();
	};

	return (
		<Form {...form}>
			{!appraisalSettings && (
				<div className="absolute bottom-0 left-0 right-0 top-0 z-10 bg-background/30 text-center backdrop-blur-md">
					<p className="mb-4 mt-[max(200px,20vh)] text-xs">Appraisal not enabled</p>
					<Button className="gap-3" onClick={createAppraisal}>
						{isSettingupAppraisal && <LoadingSpinner />}
						Enable appraisal
					</Button>
				</div>
			)}

			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="frequency"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Appraisal frequency</FormLabel>
							<FormControl>
								<Select onValueChange={field.onChange} defaultValue={field.value}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select frequency" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="annually">Annually</SelectItem>
										<SelectItem value="biannually">Biannually (Twice a year)</SelectItem>
										<SelectItem value="quarterly">Quarterly</SelectItem>
										<SelectItem value="monthly">Monthly</SelectItem>
									</SelectContent>
								</Select>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="space-y-6 rounded-md bg-accent/70 p-4">
					<div className="flex items-center justify-between">
						<Label htmlFor="start_date">Custom start date</Label>
						<Switch checked={showStartDate} onCheckedChange={setStartDateState} className="scale-75" id="start_date" />
					</div>

					{showStartDate && (
						<FormField
							control={form.control}
							name="start_date"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Appraisal frequency</FormLabel>
									<FormControl>
										<DatePicker selected={field.value ? new Date(field.value) : undefined} onSetDate={date => field.onChange(new Date(date).toISOString())} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					)}
				</div>

				<FormField
					control={form.control}
					name="timeline"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center gap-2">
								Appraisal span
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<button>
												<Info size={10} />
											</button>
										</TooltipTrigger>
										<TooltipContent>
											<p className="max-w-[200px]">How long appraisal form will be open to employees</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</FormLabel>

							<div className="relative">
								<FormControl>
									<Input type="number" placeholder="Enter appraisal timeline" {...field} />
								</FormControl>

								<p className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">weeks</p>
							</div>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit">{isUpdatingAppraisal && <LoadingSpinner />} Save changes</Button>
			</form>
		</Form>
	);
};
