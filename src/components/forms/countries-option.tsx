import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { ChevronDown, Check } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CommandInput, CommandList, CommandEmpty, Command, CommandGroup, CommandItem } from '@/components/ui/command';
import { Tables } from '@/type/database.types';
import { createClient } from '@/utils/supabase/client';

interface props {
	form: UseFormReturn<any>;
	disabled?: boolean;
	name: string;
	label: string;
	onSelectCountry?: (countryCode: string) => void;
}

const supabase = createClient();

export const SelectCountry = ({ form, disabled, name, label, onSelectCountry }: props) => {
	const [isOptionOpen, toggleOptionDropdown] = useState(false);
	const [countries, setCountries] = useState<Tables<'countries'>[]>([]);

	const getCountries = useCallback(async () => {
		const { data, error } = await supabase.from('countries').select();
		if (!error) setCountries(data);
	}, []);

	useEffect(() => {
		getCountries();
	}, [getCountries]);

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
									{field.value ? countries.find(country => country.country_code === field.value)?.name : `Select country`}
									<ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
								</Button>
							</FormControl>
						</PopoverTrigger>
						<PopoverContent side="bottom" align="start" className="w-[200px] p-0">
							<Command>
								<CommandInput placeholder="Search countries..." />
								<CommandList>
									<CommandEmpty>Country not found</CommandEmpty>
									<CommandGroup>
										{countries.map(country => (
											<CommandItem
												value={country?.name}
												key={country.country_code}
												onSelect={() => {
													form.setValue(name, country.country_code);
													toggleOptionDropdown(false);
													if (onSelectCountry) onSelectCountry(country.country_code);
												}}>
												<Check className={cn('mr-2 h-4 w-4', country.country_code === field.value ? 'opacity-100' : 'opacity-0')} />
												{country?.name}
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
