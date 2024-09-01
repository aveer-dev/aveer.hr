import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Dispatch, SetStateAction, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { generateRandomString } from '@/utils/generate-string';

interface props {
	form: UseFormReturn<any>;
	isToggled?: boolean;
	toggle: Dispatch<SetStateAction<boolean>>;
	label?: string;
	benefits?: string[];
	readonly?: boolean;
}

export const AdditionalOffering = ({ form, isToggled, toggle, label, benefits, readonly = false }: props) => {
	const [offering, updateOffering] = useState('');
	const randomString = generateRandomString(4);

	return (
		<FormField
			control={form.control}
			name="additional_offerings"
			render={() => (
				<div className="grid w-full gap-3 rounded-lg bg-accent p-2">
					<div className="flex items-center justify-between space-x-2">
						<FormLabel htmlFor={'additional_offerings' + randomString} className="flex items-center gap-2">
							{label ? label : 'Additional offerings'}
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<button type="button">
											<Info size={10} />
										</button>
									</TooltipTrigger>
									<TooltipContent side="right" className="max-w-44">
										<p>Extra perks or benefits provided to employees beyond their base salary and standard benefits.</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</FormLabel>
						{!readonly && <Switch id={'additional_offerings' + randomString} checked={isToggled} onCheckedChange={event => toggle(event)} className="scale-75" />}
					</div>

					{isToggled && (
						<>
							<div className="rounded-lg bg-background p-2">
								{benefits?.length || form.getValues().additional_offerings?.length ? (
									<ul className="ml-4 grid gap-2">
										{(benefits || form.getValues().additional_offerings)?.map((offering: string, index: number) => (
											<li key={index} className="list-disc text-xs text-muted-foreground">
												{offering}
											</li>
										))}
									</ul>
								) : (
									<p className="text-xs font-light italic text-muted-foreground">No additional offering added yet</p>
								)}
							</div>

							{!readonly && (
								<div className="grid w-full gap-2">
									<FormItem>
										<FormControl>
											<Textarea rows={1} value={offering} onChange={event => updateOffering(event.target.value)} placeholder="Type additional offer" className="min-h-5 py-[10px] text-xs font-light" />
										</FormControl>
										<FormDescription className="text-xs font-thin text-muted-foreground">Type and add additional offer one after the other</FormDescription>
										<Button
											type="button"
											className="w-full"
											disabled={!offering}
											size={'sm'}
											onClick={() => {
												form.setValue('additional_offerings', [...form.getValues().additional_offerings, offering]);
												updateOffering('');
											}}>
											Add
										</Button>
									</FormItem>
								</div>
							)}
						</>
					)}
				</div>
			)}
		/>
	);
};
