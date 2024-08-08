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

const supabase = createClient();

const formSchema = z.object({
	name: z.string(),
	website: z.string(),
	legal_name: z.string().email(),
	incorporation_country: z.string(),
	company_type: z.string(),
	ein: z.string(),
	sic: z.string(),
	address_state: z.string(),
	address_code: z.string(),
	street_address: z.array(z.string()),
	formation_date: z.date()
});

export const CreateOrgForm = () => {
	const [countries, setCountries] = useState<{ name: string; dial_code: string; country_code: string }[]>([]);
	const [states, setStates] = useState<{ name: string; short_code: string; country_code: string }[]>([]);

	const getCountries = async () => {
		const { data, error } = await supabase.from('countries').select();
		if (!error) setCountries(data);
	};

	const getStates = async () => {
		const { data, error } = await supabase.from('states').select().eq('country_code', form.getValues('incorporation_country'));
		if (!error) setStates(data);
	};

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {}
	});

	function onSubmit(values: z.infer<typeof formSchema>) {
		console.log(values);
	}

	useEffect(() => {
		getCountries();
	}, []);

	return (
		<Form {...form}>
			<form className="mx-auto grid w-full max-w-4xl gap-6" onSubmit={form.handleSubmit(onSubmit)}>
				{/* organisation details */}
				<h1 className="text-xl font-semibold">Organisation Setup</h1>

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
										<Input type="text" placeholder="Enter organisation website url" {...field} />
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
																value={country.country_code}
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
													{field.value ? countries.find(country => country.country_code === field.value)?.name : `Select organisation state`}
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
																value={state.short_code}
																key={state.short_code}
																onSelect={() => {
																	form.setValue('address_state', state.short_code);
																}}>
																<Check className={cn('mr-2 h-4 w-4', state.short_code === field.value ? 'opacity-100' : 'opacity-0')} />
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
									<FormLabel>SIC</FormLabel>
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

				<div className="mt-16 flex justify-end">
					<Button size={'sm'}>Setup Organisation</Button>
				</div>
			</form>
		</Form>
	);
};
