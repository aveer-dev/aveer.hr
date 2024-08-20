'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { DatePicker } from '@/components/ui/date-picker';
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
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/loader';

const supabase = createClient();

const formSchema = z.object({
	name: z.string(),
	incorporation_country: z.string(),
	company_type: z.string().optional(),
	tax_no: z.string().optional(),
	sic: z.string().optional(),
	rn: z.string().optional(),
	address_state: z.number().optional(),
	address_code: z.string().optional(),
	street_address: z.string().optional(),
	formation_date: z.date().optional()
});

export const LegalEntityForm = ({ data, org }: { data?: TablesUpdate<'legal_entities'>; org: string }) => {
	const [countries, setCountries] = useState<{ name: string; dial_code: string; country_code: string }[]>([]);
	const [states, setStates] = useState<Tables<'states'>[]>([]);
	const [isCountryOpen, toggleCountryState] = useState(false);
	const [isStateOpen, toggleStateState] = useState(false);
	const [isSubmiting, toggleSubmitState] = useState(false);
	const router = useRouter();

	const getCountries = async () => {
		const { data, error } = await supabase.from('countries').select().eq('can_legal_entity', true);
		if (!error) setCountries(data);
	};

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: data?.name || '',
			incorporation_country: data?.incorporation_country || 'US',
			company_type: data?.company_type || '',
			tax_no: data?.tax_no || '',
			sic: data?.sic || '',
			rn: data?.rn || '',
			address_state: data?.address_state || undefined,
			address_code: data?.address_code || '',
			street_address: data?.street_address || '',
			formation_date: data?.formation_date ? new Date(data?.formation_date) : new Date()
		}
	});

	const getStates = useCallback(async () => {
		form.setValue('address_state', undefined);
		const countryCode = form.getValues('incorporation_country') || 'US';
		if (!countryCode) return;

		const { data, error } = await supabase.from('states').select().eq('country_code', countryCode);
		if (!error) setStates(data);
	}, [form]);

	const createLegalEntity = async (payload: TablesInsert<'legal_entities'>) => await supabase.from('legal_entities').insert(payload).select('id').single();
	const updateLegalEntity = async (payload: TablesUpdate<'legal_entities'>) => await supabase.from('legal_entities').update(payload).match({ org: org, id: data?.id });

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		toggleSubmitState(true);

		const legalData: TablesInsert<'legal_entities'> = {
			name: values.name,
			incorporation_country: values.incorporation_country,
			company_type: values.company_type,
			tax_no: values.tax_no,
			sic: values.sic,
			rn: values.rn,
			address_state: values.address_state,
			address_code: values.address_code,
			street_address: values.street_address,
			formation_date: values.formation_date as unknown as string,
			org: org
		};

		const legalRes = data ? await updateLegalEntity(legalData) : await createLegalEntity({ ...legalData });
		if (legalRes.error) {
			toggleSubmitState(false);
			return toast.error(legalRes.error.message);
		}

		if (legalRes.status == 204) toast.success('🥂 Cheers', { description: 'Legal entity updated successfully' });
		if (legalRes.status == 201) toast.success('🎉 Yaay', { description: 'Legal entity created successfully' });
		if (!data) router.push(`/${org}/`);
		toggleSubmitState(false);
	};

	const companyRequiredIds: { [key: string]: { tax_no: { label: string; placeholder: string; description: string }; rn?: { label: string; placeholder: string; description: string } } } = {
		US: { tax_no: { label: 'EIN', placeholder: 'Enter EIN here', description: `EIN is a nine-digit number assigned by the IRS to identify businesses for tax purposes. It's like a Social Security number for a business.` } },
		CA: { tax_no: { label: 'BN', placeholder: 'Enter BN here', description: `Business Number (BN) is the Canadian equivalent of an EIN. It's a nine-digit number assigned by the Canada Revenue Agency (CRA) to identify businesses.` } },
		GB: {
			tax_no: { label: 'UTR', placeholder: 'Enter UTL here', description: `UTR is a unique 10-digit number assigned by HMRC to identify individuals and businesses for tax purposes in the UK.` },
			rn: { label: 'Company Registration Number', placeholder: 'Enter CRN here', description: `Company Registration Number (CRN) is a unique number assigned to a UK company upon incorporation for identification purposes.` }
		},
		NG: {
			tax_no: { label: 'TIN', placeholder: 'Enter TIN here', description: `TIN is a unique number assigned by the Federal Inland Revenue Service (FIRS) to identify individuals and businesses for tax purposes in Nigeria.` },
			rn: { label: 'RC number', placeholder: 'Enter RC number here', description: `Registration Number (RC) is a unique number assigned to a registered company in Nigeria by the Corporate Affairs Commission (CAC).` }
		}
	};

	useEffect(() => {
		getCountries();
		getStates();
	}, [data, getStates]);

	return (
		<Form {...form}>
			<form className="grid w-full gap-6" onSubmit={form.handleSubmit(onSubmit)}>
				{/* legal entity details */}
				<div className="grid grid-cols-2 border-t border-t-border pb-10 pt-10">
					<div className="flex flex-col justify-between">
						<div>
							<h2 className="mb-1 font-normal">Company Details</h2>
							<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">These are the legal details you provided while registering your company at the time of setup.</p>
						</div>

						<div>
							<ul className="grid max-w-xs gap-4 text-xs font-light text-muted-foreground">
								<li className="text-balance leading-5">
									*<span className="font-medium text-foreground">{companyRequiredIds[form.getValues('incorporation_country')]?.tax_no?.label} - </span> {companyRequiredIds[form.getValues('incorporation_country')]?.tax_no?.description}
								</li>
								{companyRequiredIds[form.getValues('incorporation_country')]?.rn && (
									<li className="text-balance leading-5">
										*<span className="font-medium text-foreground">{companyRequiredIds[form.getValues('incorporation_country')]?.rn?.label} - </span> {companyRequiredIds[form.getValues('incorporation_country')]?.rn?.description}
									</li>
								)}
							</ul>
						</div>
					</div>

					<div className="grid gap-8">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Legal entity name</FormLabel>
									<FormControl>
										<Input type="text" placeholder="Organisation legal name" {...field} required />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-2 gap-8">
							<FormField
								control={form.control}
								name="incorporation_country"
								render={({ field }) => (
									<FormItem className={cn(field.value == 'US' ? '' : 'col-span-2')}>
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
																	value={country.name}
																	key={country.country_code}
																	onSelect={() => {
																		form.setValue('incorporation_country', country.country_code);
																		getStates();
																		toggleCountryState(false);
																	}}>
																	<Check className={cn('mr-2 h-4 w-4', country.country_code === field.value ? 'opacity-100' : 'opacity-0')} />
																	{country.name}
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

							{form.getValues('incorporation_country') == 'US' && (
								<FormField
									control={form.control}
									name="address_state"
									render={({ field }) => (
										<FormItem>
											<FormLabel>State</FormLabel>
											<Popover open={isStateOpen} onOpenChange={toggleStateState}>
												<PopoverTrigger asChild>
													<FormControl>
														<Button variant="outline" role="combobox" className={cn('w-full justify-between bg-input-bg', !field.value && 'text-muted-foreground')}>
															{field.value ? states.find(state => state.id === field.value)?.name : `Select organisation state`}
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
																		value={String(state.name)}
																		key={state.id}
																		onSelect={() => {
																			form.setValue('address_state', state.id);
																			toggleStateState(false);
																		}}>
																		<Check className={cn('mr-2 h-4 w-4', state.id === field.value ? 'opacity-100' : 'opacity-0')} />
																		{state.name}
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
							)}

							<FormField
								control={form.control}
								name="formation_date"
								render={({ field }) => (
									<FormItem className="flex flex-col justify-between">
										<FormLabel>Formation date</FormLabel>
										<DatePicker selected={field.value} onSetDate={field.onChange} />
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="company_type"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Entity type</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select entity type" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="llc">Limited Liability Company</SelectItem>
												<SelectItem value="llp">Limited Liability Partnership</SelectItem>
												<SelectItem value="b-corp">B Corp</SelectItem>
												<SelectItem value="c-corp">C Corp</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							{companyRequiredIds[form.getValues('incorporation_country')]?.tax_no && (
								<FormField
									control={form.control}
									name="tax_no"
									render={({ field }) => (
										<FormItem className={companyRequiredIds[form.getValues('incorporation_country')]?.rn ? '' : '!col-span-2'}>
											<FormLabel>{companyRequiredIds[form.getValues('incorporation_country')]?.tax_no.label}</FormLabel>
											<FormControl>
												<Input type="text" placeholder={companyRequiredIds[form.getValues('incorporation_country')]?.tax_no.placeholder} {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}

							{companyRequiredIds[form.getValues('incorporation_country')]?.rn && (
								<FormField
									control={form.control}
									name="rn"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{companyRequiredIds[form.getValues('incorporation_country')].rn?.label}</FormLabel>
											<FormControl>
												<Input type="text" placeholder={companyRequiredIds[form.getValues('incorporation_country')]?.rn?.placeholder} {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}
						</div>
					</div>
				</div>

				{/* contact details */}
				<div className="grid grid-cols-2 border-t border-t-border pt-10">
					<div>
						<h2 className="mb-1 font-normal">Address details</h2>
						<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">This should mirror details as on your incorporation/legal documents of your company.</p>
					</div>

					<div className="grid gap-10">
						<div className="grid grid-cols-2 gap-6">
							{form.getValues('incorporation_country') !== 'US' && (
								<FormField
									control={form.control}
									name="address_state"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{form.getValues('incorporation_country') == 'US' || form.getValues('incorporation_country') == 'NG' ? 'State' : form.getValues('incorporation_country') == 'CA' ? 'Province' : 'City'}</FormLabel>
											<Popover open={isStateOpen} onOpenChange={toggleStateState}>
												<PopoverTrigger asChild>
													<FormControl>
														<Button variant="outline" role="combobox" className={cn('w-full justify-between bg-input-bg', !field.value && 'text-muted-foreground')}>
															{field.value ? states.find(state => state.id === field.value)?.name : `Select organisation state`}
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
																		value={String(state.name)}
																		key={state.id}
																		onSelect={() => {
																			form.setValue('address_state', state.id);
																			toggleStateState(false);
																		}}>
																		<Check className={cn('mr-2 h-4 w-4', state.id === field.value ? 'opacity-100' : 'opacity-0')} />
																		{state.name}
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
							)}

							<FormField
								control={form.control}
								name="address_code"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Post code / Zip code</FormLabel>
										<FormControl>
											<Input type="text" autoComplete="postal-code" placeholder="Enter organisation address code" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="street_address"
								render={({ field }) => (
									<FormItem className={cn(form.getValues('incorporation_country') !== 'US' ? 'col-span-2' : '')}>
										<FormLabel>Street address</FormLabel>
										<FormControl>
											<Input type="text" autoComplete="address-level1" placeholder="Enter organisation street address" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>
				</div>

				<div className="mt-16 flex justify-end border-t border-t-border pt-10">
					<Button size={'sm'} disabled={isSubmiting} className="gap-3 px-6 text-xs font-light">
						{isSubmiting && <LoadingSpinner />}
						{isSubmiting ? (data ? 'Updating entity' : 'Creating entity') : data ? 'Update entity' : 'Create entity'}
					</Button>
				</div>
			</form>
		</Form>
	);
};
