'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Tables, TablesInsert, TablesUpdate } from '@/type/database.types';
import { LoadingSpinner } from '@/components/ui/loader';
import { createLegalEntity } from './legal-entity.actions';

const supabase = createClient();

const nameAndRegionFormSchema = z.object({
	name: z.string().min(2, { message: 'Enter company legal name' }),
	incorporation_country: z.string(),
	address_state: z.number()
});

export const OnboardingForm = ({ org }: { data?: TablesUpdate<'legal_entities'>; org: string }) => {
	const [countries, setCountries] = useState<{ name: string; dial_code: string; country_code: string }[]>([]);
	const [states, setStates] = useState<Tables<'states'>[]>([]);
	const [isCountryOpen, toggleCountryState] = useState(false);
	const [isStateOpen, toggleStateState] = useState(false);
	const [isSubmiting, toggleSubmitState] = useState(false);

	const getCountries = async () => {
		const { data, error } = await supabase.from('countries').select().eq('can_legal_entity', true);
		if (!error) setCountries(data);
	};

	const nameAndRegionForm = useForm<z.infer<typeof nameAndRegionFormSchema>>({
		resolver: zodResolver(nameAndRegionFormSchema),
		defaultValues: {
			name: '',
			incorporation_country: 'US',
			address_state: undefined
		}
	});

	const getStates = useCallback(async () => {
		nameAndRegionForm.setValue('address_state', Number(undefined));
		const countryCode = nameAndRegionForm.getValues('incorporation_country') || 'US';
		if (!countryCode) return;

		const { data, error } = await supabase.from('states').select().eq('country_code', countryCode);
		if (!error) setStates(data);
	}, [nameAndRegionForm]);

	const onSubmit = async (values: z.infer<typeof nameAndRegionFormSchema>) => {
		toggleSubmitState(true);

		const legalData: TablesInsert<'legal_entities'> = {
			name: values?.name,
			incorporation_country: values.incorporation_country,
			address_state: values.address_state,
			org: org
		};

		const legalRes = await createLegalEntity({ ...legalData });
		toggleSubmitState(false);

		if (typeof legalRes == 'string') return toast.error(legalRes);
		if (legalRes?.error) return toast.error(legalRes.error.message);

		if (legalRes.status == 204) toast.success('🥂 Cheers', { description: 'Legal entity updated successfully' });
		if (legalRes.status == 201) toast.success('🎉 Yaay', { description: 'Legal entity created successfully' });

		toggleSubmitState(false);
	};

	useEffect(() => {
		getCountries();
		getStates();
	}, [getStates]);

	return (
		<Form {...nameAndRegionForm}>
			<form className="w-full space-y-8 rounded-xl border bg-background p-6" onSubmit={nameAndRegionForm.handleSubmit(onSubmit)}>
				<FormField
					control={nameAndRegionForm.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Legal entity name</FormLabel>
							<FormControl>
								<Input type="text" placeholder="Organisation legal name" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="grid grid-cols-2 gap-8">
					<FormField
						control={nameAndRegionForm.control}
						name="incorporation_country"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Country of incorporation</FormLabel>
								<Popover open={isCountryOpen} onOpenChange={toggleCountryState}>
									<PopoverTrigger asChild>
										<FormControl>
											<Button variant="outline" role="combobox" className={cn('w-full justify-between bg-input-bg', !field.value && 'text-muted-foreground')}>
												{field.value ? countries.find(country => country.country_code === field.value)?.name : `Select country of incorporation`}
												<ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
											</Button>
										</FormControl>
									</PopoverTrigger>
									<PopoverContent className="w-[200px] p-0">
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
																nameAndRegionForm.setValue('incorporation_country', country.country_code);
																getStates();
																toggleCountryState(false);
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

					<FormField
						control={nameAndRegionForm.control}
						name="address_state"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{nameAndRegionForm.getValues('incorporation_country') == 'US' || nameAndRegionForm.getValues('incorporation_country') == 'NG' ? 'State' : nameAndRegionForm.getValues('incorporation_country') == 'CA' ? 'Province' : 'City'}</FormLabel>
								<Popover open={isStateOpen} onOpenChange={toggleStateState}>
									<PopoverTrigger asChild>
										<FormControl>
											<Button variant="outline" role="combobox" className={cn('w-full justify-between bg-input-bg', !field.value && 'text-muted-foreground')}>
												{field.value ? states.find(state => state.id === field.value)?.name : `Select option`}
												<ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
											</Button>
										</FormControl>
									</PopoverTrigger>
									<PopoverContent className="w-[200px] p-0">
										<Command>
											<CommandInput placeholder="Search states..." />
											<CommandList>
												<CommandEmpty>State not found</CommandEmpty>
												<CommandGroup>
													{states.map(state => (
														<CommandItem
															value={String(state?.name)}
															key={state.id}
															onSelect={() => {
																nameAndRegionForm.setValue('address_state', state.id);
																toggleStateState(false);
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
				</div>

				<Button className="w-full gap-3 px-6 text-xs font-light" disabled={isSubmiting}>
					{isSubmiting && <LoadingSpinner />} Complete setup
				</Button>
			</form>
		</Form>
	);
};
