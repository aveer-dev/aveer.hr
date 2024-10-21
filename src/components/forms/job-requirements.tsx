import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

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
				<FormItem>
					<div className="grid w-full gap-3 rounded-lg bg-accent p-2">
						<FormLabel className="flex items-center gap-2">Job requirements</FormLabel>

						<div className="rounded-lg bg-background p-2">
							{form.getValues().requirements?.length ? (
								<ul className="ml-4 space-y-3">
									{form.getValues().requirements?.map((requirement: string, index: number) => (
										<li key={index} className="list-disc text-xs text-muted-foreground">
											<div className="flex w-full items-start justify-between gap-3">
												{requirement}
												<button
													type="button"
													onClick={() => {
														const requirements = form.getValues('requirements');
														const newValue = requirements.filter((item: string) => item !== requirements[index]);
														form.setValue('requirements', newValue);
													}}>
													<Trash2 className="text-destructive" size={12} />
												</button>
											</div>
										</li>
									))}
								</ul>
							) : (
								<p className="text-xs font-light italic text-muted-foreground">No job requirement added yet</p>
							)}
						</div>

						<div className="grid w-full gap-2">
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
						</div>
					</div>
				</FormItem>
			)}
		/>
	);
};
