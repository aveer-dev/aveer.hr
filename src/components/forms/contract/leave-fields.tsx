import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

export const LeaveDays = ({ form, isEnabled }: { form: UseFormReturn<any>; isEnabled: boolean }) => {
	const [enableCustomLeave, setCustomLeaveState] = useState(isEnabled);

	useEffect(() => {
		setCustomLeaveState(isEnabled);
	}, [isEnabled]);

	return (
		<div>
			<h3 className="mb-2 text-xs font-light text-label">Enable custom leave days</h3>

			<div className="grid grid-cols-2 gap-8 rounded-lg bg-accent p-2">
				<FormItem className="col-span-2 flex items-center justify-between space-y-0">
					<FormLabel className="flex items-center gap-2">
						Enable
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<button>
										<Info size={12} />
									</button>
								</TooltipTrigger>
								<TooltipContent>
									<p className="max-w-[200px]">If disabled or set to 0, leave details will default to organisation settings</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</FormLabel>
					<FormControl>
						<Switch
							checked={enableCustomLeave}
							className="scale-75"
							onCheckedChange={state => {
								setCustomLeaveState(state);

								if (!state) {
									form.setValue('paid_leave', 0);
									form.setValue('sick_leave', 0);
								}
							}}
							aria-readonly
						/>
					</FormControl>
				</FormItem>

				{enableCustomLeave && (
					<>
						<FormField
							control={form.control}
							name="paid_leave"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Annual leave</FormLabel>
									<FormControl>
										<Input type="number" placeholder="20" {...field} onChange={event => field.onChange(Number(event.target.value))} />
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
										<Input type="number" placeholder="20" {...field} onChange={event => field.onChange(Number(event.target.value))} />
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
									<FormControl>
										<Input type="number" placeholder="20" {...field} onChange={event => field.onChange(Number(event.target.value))} />
									</FormControl>
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
									<FormControl>
										<Input type="number" placeholder="20" {...field} onChange={event => field.onChange(Number(event.target.value))} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</>
				)}
			</div>
		</div>
	);
};
