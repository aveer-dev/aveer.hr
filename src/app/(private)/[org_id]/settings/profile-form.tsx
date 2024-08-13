'use client';

import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';

import { TablesUpdate } from '@/type/database.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export const ProfileForm = ({ data }: { data?: TablesUpdate<'profiles'> }) => {
	const [countries, setCountries] = useState<{ name: string; dial_code: string; country_code: string }[]>([]);

	const getCountries = async () => {
		const { data, error } = await supabase.from('countries').select();
		if (!error) setCountries(data);
	};

	const formSchema = z.object({
		first_name: z.string(),
		last_name: z.string(),
		email: z.string().email(),
		nationality: z.string()
	});

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			first_name: data?.first_name || '',
			last_name: data?.last_name || '',
			email: data?.email || '',
			nationality: data?.nationality || ''
		}
	});

	useEffect(() => {
		getCountries();
	}, []);

	const onSubmit = async (values: z.infer<typeof formSchema>) => {};

	return (
		<Form {...form}>
			<form className="grid w-full gap-6" onSubmit={form.handleSubmit(onSubmit)}>
				{/* employee details */}
				<div className="grid grid-cols-2 border-t border-t-border pt-10">
					<div>
						<h2 className="font-semibold">Personal details</h2>
						<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">Your personal information, like your name and email. Changes here might reflex on all your contracts</p>
					</div>

					<div className="mb-10 grid gap-8">
						<div className="grid grid-cols-2 gap-6">
							<FormField
								control={form.control}
								name="first_name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>First name</FormLabel>
										<FormControl>
											<Input disabled={!!data} type="text" placeholder="Enter first name" {...field} required />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="last_name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Last name</FormLabel>
										<FormControl>
											<Input disabled={!!data} type="text" placeholder="Enter last name" {...field} required />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input disabled={!!data} type="email" placeholder="Enter email" {...field} required />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="nationality"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Nationalty</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button disabled={!!data} variant="outline" role="combobox" className={cn('w-full justify-between bg-input-bg', !field.value && 'text-muted-foreground')}>
														{field.value ? countries.find(country => country.country_code === field.value)?.name : `Select employee's nationality`}
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
																		form.setValue('nationality', country.country_code);
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
						</div>

						<Alert>
							<Info size={12} />
							<AlertDescription className="grid gap-4 text-xs">
								<div>Your current profile detail were set by your first employee. You'd require an ID verication process to update them</div>
								<div className="flex w-full justify-end">
									<Button disabled className="self-end" size={'sm'}>
										Update Personal Detail
									</Button>
								</div>
							</AlertDescription>
						</Alert>
					</div>
				</div>
			</form>
		</Form>
	);
};
