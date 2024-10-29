import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface props {
	form: UseFormReturn<any>;
}

export const JobResponsibilities = ({ form }: props) => {
	const [resposibility, setResponsibility] = useState('');

	return (
		<FormField
			control={form.control}
			name="responsibilities"
			render={() => (
				<FormItem>
					<div className="grid w-full gap-3 rounded-lg bg-accent p-2">
						<FormLabel className="flex items-center gap-2">Job description</FormLabel>
						<div className="rounded-lg bg-background p-2">
							{form.getValues().responsibilities?.length ? (
								<ul className="ml-4 grid gap-2">
									{form.getValues().responsibilities?.map((offering: string, index: number) => (
										<li key={index} className="list-disc text-xs text-muted-foreground">
											<div className="flex w-full items-start justify-between gap-3">
												{offering}
												<button
													type="button"
													onClick={() => {
														const responsibilities = form.getValues('responsibilities');
														const newValue = responsibilities.filter((item: string) => item !== responsibilities[index]);
														form.setValue('responsibilities', newValue);
													}}>
													<Trash2 className="text-destructive" size={12} />
												</button>
											</div>
										</li>
									))}
								</ul>
							) : (
								<p className="text-xs font-light italic text-muted-foreground">No job descriptions added yet</p>
							)}
						</div>

						<div className="grid w-full gap-2">
							<FormControl>
								<Textarea value={resposibility} onChange={event => setResponsibility(event.target.value)} placeholder="Type job description" className="min-h-5 bg-background py-[10px] text-xs font-light" />
							</FormControl>
							<FormDescription className="text-xs font-thin text-muted-foreground">Type and add job descriptions one after the other</FormDescription>
							<Button
								type="button"
								className="w-full"
								disabled={!resposibility}
								size={'sm'}
								onClick={() => {
									form.setValue('responsibilities', [...form.getValues().responsibilities, resposibility]);
									setResponsibility('');
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
