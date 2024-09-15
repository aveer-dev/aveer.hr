import { FormField, FormLabel } from '@/components/ui/form';
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface props {
	form: UseFormReturn<any>;
	isToggled?: boolean;
	toggle: (action: boolean) => void;
	currency?: string;
}

export const FixedAllowance = ({ form, isToggled, toggle, currency }: props) => {
	const [allowance, updateAllowance] = useState({ name: '', amount: '', frequency: '' });

	return (
		<FormField
			control={form.control}
			name="fixed_allowance"
			render={() => (
				<div className="grid w-full gap-3 rounded-lg bg-accent p-2">
					<div className="flex items-center justify-between space-x-2">
						<FormLabel htmlFor="fixed_allowance" className="flex items-center gap-2">
							Fixed allowance
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<button type="button">
											<Info size={10} />
										</button>
									</TooltipTrigger>
									<TooltipContent side="right" className="max-w-44">
										<p>Predetermined payments made to employees in addition to their base salary.</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</FormLabel>
						<Switch id="fixed_allowance" checked={isToggled} onCheckedChange={event => toggle(event)} className="scale-75" />
					</div>

					{isToggled && (
						<>
							<div className="rounded-lg bg-background p-2">
								{form.getValues().fixed_allowance?.length ? (
									<ul className="grid list-disc gap-2">
										{form.getValues().fixed_allowance?.map((allowance: { name: string; amount: string; frequency: string }, index: number) => (
											<li key={index} className="flex list-disc items-center justify-between p-1 text-xs font-light">
												<div>
													{allowance?.name} •{' '}
													<span className="text-xs font-light text-muted-foreground">
														{new Intl.NumberFormat(
															'en-US',
															currency
																? {
																		style: 'currency',
																		currency: currency
																	}
																: {}
														).format(Number(allowance.amount) || 0)}
													</span>
												</div>
												<div className="text-muted-foreground">{allowance.frequency}</div>
											</li>
										))}
									</ul>
								) : (
									<p className="text-xs font-light italic text-muted-foreground">No fixed allowance added yet</p>
								)}
							</div>

							<div className="grid grid-cols-3 gap-3">
								<Input type="text" placeholder="Enter name" value={allowance?.name} onChange={event => updateAllowance({ ...allowance, name: event.target.value })} />
								<Input type="number" placeholder="Enter amount" value={allowance.amount} onChange={event => updateAllowance({ ...allowance, amount: event.target.value })} />

								<Select onValueChange={event => updateAllowance({ ...allowance, frequency: event })}>
									<SelectTrigger className="w-full">
										<SelectValue className="text-left" placeholder="Frequency" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="one-off">One off</SelectItem>
										<SelectItem value="monthly">Monthly</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<Button
								type="button"
								disabled={!allowance.amount || !allowance?.name || !allowance.frequency}
								onClick={() => {
									form.setValue('fixed_allowance', [...(form.getValues()?.fixed_allowance || []), allowance]);
									updateAllowance({ name: '', amount: '', frequency: allowance.frequency });
								}}>
								Add allowance
							</Button>
						</>
					)}
				</div>
			)}
		/>
	);
};
