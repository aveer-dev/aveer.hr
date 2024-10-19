'use client';

import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';

import { TablesUpdate } from '@/type/database.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import { FormSection, FormSectionDescription, InputsContainer } from '@/components/forms/form-section';
import { updateProfile } from '@/components/contract/profile/profile.actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/loader';

const supabase = createClient();

export const ProfileForm = ({ data }: { data?: TablesUpdate<'profiles'> }) => {
	return (
		<FormSection>
			<FormSectionDescription>
				<h2 className="font-semibold">Personal details</h2>
				<p className="mt-3 text-xs font-thin text-muted-foreground sm:max-w-72">Your personal information, like your name and email. Changes here might reflex on all your contracts</p>
			</FormSectionDescription>

			<InputsContainer>
				<ProfileFormComponent data={data} />
			</InputsContainer>
		</FormSection>
	);
};

export const ProfileFormComponent = ({ data }: { data?: TablesUpdate<'profiles'> }) => {
	const [countries, setCountries] = useState<{ name: string; dial_code: string; country_code: string }[]>([]);
	const [isUpdating, setUpdateState] = useState(false);
	const router = useRouter();

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

	useEffect(() => {
		getCountries();
	}, []);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			first_name: data?.first_name || '',
			last_name: data?.last_name || '',
			email: data?.email || '',
			nationality: (data?.nationality as any).country_code || data?.nationality || ''
		}
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		setUpdateState(true);
		const payload: TablesUpdate<'profiles'> = { ...values };

		const response = await updateProfile({ payload, id: data?.id as string });
		setUpdateState(false);

		if (typeof response == 'string') return toast.error('Unable to update details', { description: response });
		toast.success('Updated!', { description: 'Profile information updated successfully' });
		router.refresh();
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<div className="mb-10 grid gap-8">
					<div className="grid grid-cols-2 gap-6">
						<FormField
							control={form.control}
							name="first_name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>First name</FormLabel>
									<FormControl>
										<Input type="text" placeholder="Enter first name" {...field} required />
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
										<Input type="text" placeholder="Enter last name" {...field} required />
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
										<Input type="email" placeholder="Enter email" {...field} required />
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
												<Button variant="outline" role="combobox" className={cn('w-full justify-between bg-input-bg', !field.value && 'text-muted-foreground')}>
													{field.value ? countries.find(country => country.country_code === field.value)?.name : `Select employee's country`}
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
																	form.setValue('nationality', country.country_code);
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
					</div>

					<div className="flex justify-end">
						<Button className="gap-3 self-end" disabled={isUpdating} type="submit" size={'sm'}>
							{isUpdating && <LoadingSpinner />}
							Update Personal Detail
						</Button>
					</div>
				</div>
			</form>
		</Form>
	);
};
