import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';

interface props {
	form: UseFormReturn<any>;
}

export const JobRequirements = ({ form }: props) => {
	const [requirement, setRequirement] = useState('');

	return (
		<FormField
			control={form.control}
			name="requirements"
			render={() => (
				<div className="grid w-full gap-3 rounded-lg bg-accent p-2">
					<FormLabel className="flex items-center gap-2">
						Job requirements
						{/* <TooltipProvider>
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
							</TooltipProvider> */}
					</FormLabel>

					<div className="rounded-lg bg-background p-2">
						{form.getValues().requirements?.length ? (
							<ul className="ml-4 grid gap-2">
								{form.getValues().requirements?.map((requirement: string, index: number) => (
									<li key={index} className="list-disc text-xs text-muted-foreground">
										{requirement}
									</li>
								))}
							</ul>
						) : (
							<p className="text-xs font-light italic text-muted-foreground">No job requirement added yet</p>
						)}
					</div>

					<div className="grid w-full gap-2">
						<FormItem>
							<FormControl>
								<Textarea value={requirement} onChange={event => setRequirement(event.target.value)} placeholder="Type additional offer" className="min-h-5 py-[10px] text-xs font-light" />
							</FormControl>
							<FormDescription className="text-xs font-thin text-muted-foreground">Type and add job responsibility one after the other</FormDescription>
							<Button
								type="button"
								className="w-full"
								disabled={!requirement}
								size={'sm'}
								onClick={() => {
									form.setValue('requirements', [...form.getValues().requirements, requirement]);
									setRequirement('');
								}}>
								Add
							</Button>
						</FormItem>
					</div>
				</div>
			)}
		/>
	);
};
