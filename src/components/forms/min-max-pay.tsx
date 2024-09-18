import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Dispatch, SetStateAction } from 'react';
import { cn, currencyFormat } from '@/lib/utils';

interface props {
	form: UseFormReturn<any>;
	name: string;
	label: string;
	formLabel: string;
	tooltip?: string;
	showToggle?: boolean;
	isToggled?: boolean;
	toggle?: Dispatch<SetStateAction<boolean>>;
	currency?: string;
}

export const MinMaxPay = ({ form, name, label, formLabel, tooltip, showToggle, isToggled, toggle, currency }: props) => {
	return (
		<FormField
			control={form.control}
			name={name}
			render={() => (
				<FormItem className="grid gap-3 rounded-lg bg-accent p-2">
					<FormLabel className={cn('flex items-center', showToggle ? 'justify-between' : '')}>
						<div className="flex items-center gap-2">
							{formLabel}
							{tooltip && (
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<button type="button">
												<Info size={10} />
											</button>
										</TooltipTrigger>
										<TooltipContent side="right" className="max-w-44">
											<p>{tooltip}</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							)}
						</div>
						{showToggle && <Switch checked={isToggled} onCheckedChange={event => (toggle ? toggle(event) : false)} id="signin-bonus" className="scale-75" />}
					</FormLabel>

					{isToggled && (
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name={`${name}.min`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Min {label}</FormLabel>
										<FormControl>
											<Input type="number" {...field} onChange={(event: { target: { value: any } }) => form.setValue(`${name}.min`, Number(event.target.value))} placeholder="Min amount" />
										</FormControl>
										<FormDescription className="!mt-1 text-xs font-light text-muted-foreground">{currencyFormat({ value: Number(field.value), currency })}</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name={`${name}.max`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Max {label}</FormLabel>
										<FormControl>
											<Input type="number" {...field} onChange={event => form.setValue(`${name}.max`, Number(event.target.value))} placeholder="Max amount" />
										</FormControl>
										<FormDescription className="!mt-1 text-xs font-light text-muted-foreground">{currencyFormat({ value: Number(field.value), currency })}</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					)}
					<FormMessage className="!-mt-2" />
				</FormItem>
			)}
		/>
	);
};
