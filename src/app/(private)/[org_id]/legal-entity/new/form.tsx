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
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Tables, TablesInsert, TablesUpdate } from '@/type/database.types';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/loader';

const supabase = createClient();

const formSchema = z.object({
	name: z.string(),
	incorporation_country: z.string().optional(),
	company_type: z.string().optional(),
	ein: z.string().optional(),
	sic: z.string().optional(),
	address_state: z.number().optional(),
	address_code: z.string().optional(),
	street_address: z.string().optional(),
	formation_date: z.date().optional()
});

export const LegalEntityForm = ({ data, orgId }: { data?: TablesUpdate<'legal_entities'>; orgId: number }) => {
	const [countries, setCountries] = useState<{ name: string; dial_code: string; country_code: string }[]>([]);
	const [states, setStates] = useState<Tables<'states'>[]>([]);
	const [isSubmiting, toggleSubmitState] = useState(false);
	const router = useRouter();

	const getCountries = async () => {
		const { data, error } = await supabase.from('countries').select();
		if (!error) setCountries(data);
	};

	const getStates = async () => {
		const countryCode = form.getValues('incorporation_country');
		if (!countryCode) return;

		const { data, error } = await supabase.from('states').select().eq('country_code', countryCode);
		if (!error) setStates(data);
	};

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: data?.name || '',
			incorporation_country: data?.incorporation_country || '',
			company_type: data?.company_type || '',
			ein: data?.ein || '',
			sic: data?.sic || '',
			address_state: data?.address_state || undefined,
			address_code: data?.address_code || '',
			street_address: data?.street_address || '',
			formation_date: data?.formation_date ? new Date(data?.formation_date) : new Date()
		}
	});

	const createLegalEntity = async (payload: TablesInsert<'legal_entities'>) => await supabase.from('legal_entities').insert(payload).select('id').single();
	const updateLegalEntity = async (payload: TablesUpdate<'legal_entities'>) => await supabase.from('legal_entities').update(payload).match({ org: orgId, id: data?.id });

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		toggleSubmitState(true);

		const legalData: TablesInsert<'legal_entities'> = {
			name: values.name,
			incorporation_country: values.incorporation_country,
			company_type: values.company_type,
			ein: values.ein,
			sic: values.sic,
			address_state: values.address_state,
			address_code: values.address_code,
			street_address: values.street_address,
			formation_date: values.formation_date as unknown as string,
			org: orgId
		};

		const legalRes = data ? await updateLegalEntity(legalData) : await createLegalEntity({ ...legalData });
		if (legalRes.error) {
			toggleSubmitState(false);
			return toast.error(legalRes.error.message);
		}

		if (data) toast.success('Legal entity updated successfully');
		if (!data) router.push(`/${orgId}/`);
		toggleSubmitState(false);
	};

	useEffect(() => {
		getCountries().then(() => {
			if (data?.incorporation_country) getStates();
		});
	}, []);

	return (
		<Form {...form}>
			<form className="grid w-full gap-6" onSubmit={form.handleSubmit(onSubmit)}>
				{/* legal entity details */}
				<div className="grid grid-cols-2 border-t border-t-border pt-10">
					<div>
						<h2 className="mb-1 font-normal">Company Details</h2>
						<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">These are the legal details you provided while registering your company at the time of setup.</p>
					</div>

					<div className="mb-10 grid gap-8">
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

						<FormField
							control={form.control}
							name="incorporation_country"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Country of incorporation</FormLabel>
									<Popover>
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

						<div className="grid grid-cols-2 gap-6">
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
						</div>

						<div className="grid grid-cols-2 gap-6">
							<FormField
								control={form.control}
								name="ein"
								render={({ field }) => (
									<FormItem>
										<FormLabel>EIN</FormLabel>
										<FormControl>
											<Input type="text" placeholder="Enter employer identification number" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="sic"
								render={({ field }) => (
									<FormItem>
										<FormLabel>SIC</FormLabel>
										<FormControl>
											<Input type="text" placeholder="Enter SIC number" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>
				</div>

				{/* contact details */}
				<div className="grid grid-cols-2 border-t border-t-border pt-10">
					<div>
						<h2 className="mb-1 font-normal">Contact details</h2>
						<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">These should be the company's contact information as provided while registeing your company and on legal documents</p>
					</div>

					<div className="grid gap-10">
						<div className="grid grid-cols-2 gap-6">
							<FormField
								control={form.control}
								name="address_state"
								render={({ field }) => (
									<FormItem>
										<FormLabel>State</FormLabel>
										<Popover>
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
						</div>

						<FormField
							control={form.control}
							name="street_address"
							render={({ field }) => (
								<FormItem>
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
