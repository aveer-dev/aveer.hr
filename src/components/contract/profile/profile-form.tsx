'use client';

import { Button } from '@/components/ui/button';
import { UserRoundCog } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Tables, TablesUpdate } from '@/type/database.types';
import { SelectCountry } from '../../forms/countries-option';
import { useState } from 'react';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loader';
import { useRouter } from 'next/navigation';
import { updateProfile } from './profile.actions';

const formSchema = z.object({
	first_name: z.string().min(2, { message: 'Enter first name' }),
	last_name: z.string().min(2, { message: 'Enter last name' }),
	email: z.string().email({ message: 'Enter email address' }),
	nationality: z.string({ message: 'Select your country of origin' }),
	mobile: z.string().min(8, { message: 'Provide mobile number' }),
	gender: z.string({ message: 'Select your gender' }),
	emergency_contact: z.object({
		first_name: z.string().min(2, { message: 'Provide emergency contact first name' }),
		last_name: z.string().min(2, { message: 'Provide emergency contact last name' }),
		email: z.string().optional(),
		mobile: z.string().min(8, { message: 'Provide emergency contact mobile number' }),
		relationship: z.string().min(2, { message: 'Select your relationship with emergency contact' })
	}),
	medical: z.object({ blood_type: z.string(), gentype: z.string(), allergies: z.string(), medical_condition: z.string(), note: z.string() }),
	address: z.object({
		street_address: z.string().min(2, { message: 'Enter your street address' }),
		state: z.string().min(2, { message: 'Enter your state' }),
		code: z.string().min(2, { message: 'Enter your postcode/zipcode' }),
		country: z.string().min(2, { message: 'Select your country' })
	})
});

interface props {
	data: Tables<'profiles'> & { nationality: Tables<'countries'> };
}

export const ProfileForm = ({ data }: props) => {
	const [isUpdating, setUpdateState] = useState(false);
	const [isDialogOpen, toggleDialog] = useState(false);
	const router = useRouter();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			medical: (data.medical as any) || { blood_type: '', gentype: '', allergies: '', medical_condition: '', note: '' },
			address: (data.address as any) || { street_address: '', state: '', code: '', country: '' },
			emergency_contact: (data.emergency_contact as any) || { first_name: '', last_name: '', mobile: '', email: '', relationship: '' },
			gender: data.gender || '',
			mobile: data.mobile || '',
			nationality: data.nationality?.country_code || '',
			email: data.email || '',
			first_name: data.first_name || '',
			last_name: data.last_name || ''
		}
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		setUpdateState(true);

		const payload: TablesUpdate<'profiles'> = { ...values };
		const response = await updateProfile({ payload, id: data.id });
		setUpdateState(false);

		if (typeof response == 'string') return toast.error('Unable to update details', { description: response });
		toast.success('Updated!', { description: 'Profile information updated successfully' });
		toggleDialog(false);
		router.refresh();
	};

	return (
		<Sheet open={isDialogOpen} onOpenChange={toggleDialog}>
			<SheetTrigger asChild>
				<Button variant={'secondary'} className="h-9 gap-3">
					Update
					<UserRoundCog className="stroke-1" size={14} />
				</Button>
			</SheetTrigger>

			<SheetContent className="space-y-10 overflow-y-auto pb-20 sm:max-w-2xl">
				<SheetHeader>
					<SheetTitle>Profile Information</SheetTitle>
					<SheetDescription>Make changes to your profile here. Click save when you&apos;re done.</SheetDescription>
				</SheetHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
						<div className="space-y-4">
							<h2 className="text-sm font-medium">Personal Information</h2>
							<div className="grid grid-cols-2 gap-6">
								<FormField
									control={form.control}
									name="first_name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>First name</FormLabel>
											<FormControl>
												<Input placeholder="Enter first name" {...field} />
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
												<Input placeholder="Enter last name" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<SelectCountry form={form} label="Country of origin" name="nationality" />

								<FormField
									control={form.control}
									name="gender"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Gender</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select your gender" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="male">Male</SelectItem>
													<SelectItem value="female">Female</SelectItem>
													<SelectItem value="gay">Gay</SelectItem>
													<SelectItem value="lesbian">Lesbian</SelectItem>
													<SelectItem value="Queer">Queer</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email address</FormLabel>
											<FormControl>
												<Input type="email" inputMode="email" placeholder="Enter email address" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="mobile"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Mobile number</FormLabel>
											<FormControl>
												<Input inputMode="tel" type="tel" placeholder="Enter phone number" {...field} />
											</FormControl>
											<FormDescription>Include dial country code</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						<div className="space-y-4">
							<h2 className="text-sm font-medium">Address</h2>
							<div className="grid grid-cols-2 gap-6">
								<SelectCountry form={form} label="Country" name="address.country" />

								<FormField
									control={form.control}
									name="address.street_address"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Street address</FormLabel>
											<FormControl>
												<Input placeholder="Enter your " {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="address.state"
									render={({ field }) => (
										<FormItem>
											<FormLabel>State / City / Province</FormLabel>
											<FormControl>
												<Input placeholder="Enter your state or city or province" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="address.code"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Post code / zip code</FormLabel>
											<FormControl>
												<Input placeholder="Enter your address code" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						<div className="space-y-4">
							<h2 className="text-sm font-medium">Medical Details</h2>
							<div className="grid grid-cols-2 gap-6">
								<FormField
									control={form.control}
									name="medical.blood_type"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Blood type</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select your blood type" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="A+">A+</SelectItem>
													<SelectItem value="A-">A-</SelectItem>
													<SelectItem value="B-">B-</SelectItem>
													<SelectItem value="B+">B+</SelectItem>
													<SelectItem value="AB+">AB+</SelectItem>
													<SelectItem value="O-">O-</SelectItem>
													<SelectItem value="O+">O+</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="medical.gentype"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Genotype</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select your genotype" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="AA">AA</SelectItem>
													<SelectItem value="BB">BB</SelectItem>
													<SelectItem value="AB">AB</SelectItem>
													<SelectItem value="OO">OO</SelectItem>
													<SelectItem value="SS">SS</SelectItem>
													<SelectItem value="Ss">Ss</SelectItem>
													<SelectItem value="ss">ss</SelectItem>
													<SelectItem value="CC">CC</SelectItem>
													<SelectItem value="Cc">Cc</SelectItem>
													<SelectItem value="cc">cc</SelectItem>
													<SelectItem value="RR">RR</SelectItem>
													<SelectItem value="Rr">Rr</SelectItem>
													<SelectItem value="rr">rr</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="medical.allergies"
									render={({ field }) => (
										<FormItem className="col-span-2">
											<FormLabel>Allergies</FormLabel>
											<FormControl>
												<Textarea placeholder="Tell us about any allergy you might have" className="resize-none" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="medical.medical_condition"
									render={({ field }) => (
										<FormItem className="col-span-2">
											<FormLabel>Medical condition</FormLabel>
											<FormControl>
												<Textarea placeholder="Tell us about any medical condition you might have" className="resize-none" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="medical.allergies"
									render={({ field }) => (
										<FormItem className="col-span-2">
											<FormLabel>Note</FormLabel>
											<FormControl>
												<Textarea placeholder="Express any other detail you might want to share with your employers" className="resize-none" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						<div className="space-y-4">
							<h2 className="text-sm font-medium">Emergency Contact</h2>
							<div className="grid grid-cols-2 gap-6">
								<FormField
									control={form.control}
									name="emergency_contact.first_name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>First name</FormLabel>
											<FormControl>
												<Input placeholder="Enter first name" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="emergency_contact.last_name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Last name</FormLabel>
											<FormControl>
												<Input placeholder="Enter last name" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="emergency_contact.relationship"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Relation with contact</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select your relation type" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="sibling">Sibling</SelectItem>
													<SelectItem value="partner">Partner</SelectItem>
													<SelectItem value="parent">Parent</SelectItem>
													<SelectItem value="child">Child</SelectItem>
													<SelectItem value="extended-family">Extended family</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="emergency_contact.mobile"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Mobile number</FormLabel>
											<FormControl>
												<Input inputMode="tel" type="tel" placeholder="Enter phone number" {...field} />
											</FormControl>
											<FormDescription>Include dial country code</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="emergency_contact.email"
									render={({ field }) => (
										<FormItem className="col-span-2">
											<FormLabel>Email address</FormLabel>
											<FormControl>
												<Input type="email" inputMode="email" placeholder="Enter email address" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						<SheetFooter>
							<SheetClose asChild>
								<Button type="button" variant={'outline'}>
									Close
								</Button>
							</SheetClose>

							<Button type="submit" disabled={isUpdating} className="w-36">
								{isUpdating && <LoadingSpinner />} Submit
							</Button>
						</SheetFooter>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	);
};
