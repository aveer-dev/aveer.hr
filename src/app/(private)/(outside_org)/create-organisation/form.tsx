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

const supabase = createClient();

const formSchema = z.object({
	name: z.string(),
	website: z.string().url().optional(),
	legal_name: z.string(),
	incorporation_country: z.string().optional(),
	company_type: z.string().optional(),
	ein: z.string().optional(),
	sic: z.string().optional(),
	address_state: z.number().optional(),
	address_code: z.string().optional(),
	street_address: z.string().optional(),
	formation_date: z.string().or(z.date()).optional()
});

export const CreateOrgForm = ({ data }: { data?: TablesUpdate<'organisations'> }) => {
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
			website: data?.website || '',
			legal_name: '',
			incorporation_country: '',
			company_type: '',
			ein: '',
			sic: '',
			address_state: undefined,
			address_code: '',
			street_address: '',
			formation_date: ''
		}
	});

	const createOrganisation = async (payload: TablesInsert<'organisations'>) => await supabase.from('organisations').insert(payload).select('id').single();
	const createLegalEntity = async (payload: TablesInsert<'legal_entities'>) => await supabase.from('legal_entities').insert(payload).select('id').single();
	const createUserRole = async (payload: TablesInsert<'profiles_roles'>) => await supabase.from('profiles_roles').insert(payload);

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		toggleSubmitState(true);

		const orgData: TablesInsert<'organisations'> = {
			name: values.name,
			website: values.website
		};
		const orgRes = await createOrganisation(orgData);
		if (orgRes.error) {
			toggleSubmitState(false);
			return toast.error(orgRes.error.message);
		}

		const legalData: TablesInsert<'legal_entities'> = {
			name: values.legal_name,
			incorporation_country: values.incorporation_country,
			company_type: values.company_type,
			ein: values.ein,
			sic: values.sic,
			address_state: values.address_state,
			address_code: values.address_code,
			street_address: values.street_address,
			formation_date: values.formation_date as string,
			org: orgRes.data.id
		};

		const legalRes = await createLegalEntity({ ...legalData });
		if (legalRes.error) {
			toggleSubmitState(false);
			return toast.error(legalRes.error.message);
		}

		await createUserRole({ organisation: orgRes.data.id, role: 'admin' });

		router.push(`/${orgRes.data.id}/`);
	};

	useEffect(() => {
		getCountries();
	}, []);

	return (
		<Form {...form}>
			<form className="grid w-full gap-6" onSubmit={form.handleSubmit(onSubmit)}>
				{/* organisation details */}
				<div className="grid grid-cols-2 border-t border-t-border pt-10">
					<div>
						<h2 className="font-semibold">Organisation details</h2>
						<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">This should be the public name of your entire organisation. This is mostly an organisation identifier.</p>
					</div>

					<div className="mb-10 grid gap-8">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Organisation name</FormLabel>
									<FormControl>
										<Input type="text" placeholder="Enter organisation name" {...field} required />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="website"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Organisation website</FormLabel>
									<FormControl>
										<Input type="url" placeholder="Enter organisation website url" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</div>

				{/* legal entity details */}
				<div className="grid grid-cols-2 border-t border-t-border pt-10">
					<div>
						<h2 className="mb-1 font-normal">Legal Entity</h2>
						<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">This should be the public name of your entire organisation. This is mostly an organisation identifier.</p>
					</div>

					<div className="mb-10 grid gap-8">
						<FormField
							control={form.control}
							name="legal_name"
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
										<DatePicker onSetDate={field.onChange} />
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
						<h2 className="mb-1 font-normal">Organisation contact details</h2>
						<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">This should be the public name of your entire organisation. This is mostly an organisation identifier.</p>
					</div>

					<div className="grid grid-cols-2 gap-10">
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
				</div>

				<div className="mt-16 flex justify-end border-t border-t-border pt-10">
					<Button size={'sm'}>{isSubmiting ? 'Setting up organisation...' : 'Setup organisation'}</Button>
				</div>
			</form>
		</Form>
	);
};
