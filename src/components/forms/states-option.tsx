import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { ChevronDown, Check } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CommandInput, CommandList, Command, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Tables } from '@/type/database.types';
import { createClient } from '@/utils/supabase/client';

interface props {
	form: UseFormReturn<any>;
	disabled?: boolean;
	name: string;
	label: string;
	country: string;
}

const supabase = createClient();

export const SelectCountryState = ({ form, disabled, name, label, country }: props) => {
	const [isOptionOpen, toggleOptionDropdown] = useState(false);
	const [states, setStates] = useState<Tables<'states'>[]>([]);

	const getStates = useCallback(async () => {
		const { data, error } = await supabase.from('states').select().eq('country_code', country);
		if (!error) setStates(data);
	}, [country]);

	useEffect(() => {
		if (country) getStates();
	}, [country, getStates]);

	return (
		<FormField
			control={form.control}
			name={name}
			render={({ field }) => (
				<FormItem>
					<FormLabel>{label}</FormLabel>
					<Popover open={isOptionOpen} onOpenChange={toggleOptionDropdown}>
						<PopoverTrigger asChild>
							<FormControl>
								<Button disabled={disabled} variant="outline" role="combobox" className={cn('w-full justify-between bg-input-bg', !field.value && 'text-muted-foreground')}>
									{field.value ? states.find(state => state.id === field.value)?.name : `Select employee's nationality`}
									<ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
								</Button>
							</FormControl>
						</PopoverTrigger>
						<PopoverContent className="w-[200px] p-0" side="bottom" align="start">
							<Command>
								<CommandInput placeholder="Search countries..." />
								<CommandList>
									<CommandEmpty>State not found</CommandEmpty>
									<CommandGroup>
										{states.map(state => (
											<CommandItem
												value={state?.name}
												key={state.id}
												onSelect={() => {
													form.setValue(name, state.id);
													toggleOptionDropdown(false);
												}}>
												<Check className={cn('mr-2 h-4 w-4', state.id === field.value ? 'opacity-100' : 'opacity-0')} />
												{state?.name}
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};
