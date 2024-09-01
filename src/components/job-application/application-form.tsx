'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FormSection, FormSectionDescription, InputsContainer } from '@/components/forms/form-section';
import { Textarea } from '@/components/ui/textarea';
import { ChangeEvent, useState } from 'react';
import { SelectCountry } from '@/components/forms/countries-option';
import { SelectCountryState } from '@/components/forms/states-option';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Json, Tables, TablesInsert } from '@/type/database.types';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';
import { useFormStatus } from 'react-dom';
import { LoadingSpinner } from '@/components/ui/loader';
import { ApplicationSuccessDialog } from './application-success-dialog';

const formSchema = z.object({
	first_name: z.string().min(1, 'Please enter first name'),
	last_name: z.string().min(1, 'Please enter last name'),
	email: z.string().email(),
	phone_number: z.string().min(8, 'Please enter mobile number'),
	resume: z.string().optional(),
	cover_letter: z.string().optional(),
	country_location: z.string().min(1, 'Please select your country'),
	state_location: z.number(),
	work_authorization: z.boolean(),
	require_sponsorship: z.boolean(),
	race_ethnicity: z.string(),
	veterian_status: z.string(),
	gender: z.string().optional(),
	disability: z.string().optional(),
	links: z.array(z.object({ name: z.string(), link: z.string() })),
	documents: z.array(z.object({ name: z.string(), path: z.string(), file: z.any() }))
});
const supabase = createClient();

interface props {
	org: string;
	roleId: number;
	submit: (application: TablesInsert<'job_applications'>) => Promise<string | number>;
}

export function JobApplicationForm({ org, roleId, submit }: props) {
	const [selectedCountry, selectCountry] = useState<Tables<'countries'>>();
	const [showManualResume, toggleManualResumeState] = useState(false);
	const [showSuccessDialog, toggleSuccessDialog] = useState(false);
	const [isSubmiting, toggleSubmitState] = useState(false);
	const [showManualCoverLetter, toggleManualCoverLetterState] = useState(false);
	const [applicationId, setApplicationId] = useState<number>();
	// const [filesToUpload, updateFilesToUpload] = useState<{ name: string; path: string; file: File }[]>([]);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			first_name: '',
			last_name: '',
			email: '',
			phone_number: '',
			resume: '',
			cover_letter: '',
			country_location: '',
			state_location: undefined,
			work_authorization: undefined,
			require_sponsorship: undefined,
			race_ethnicity: '',
			veterian_status: '',
			disability: '',
			links: [],
			gender: '',
			documents: []
		}
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		try {
			toggleSubmitState(true);
			const files = await uploadFiles();

			const application: TablesInsert<'job_applications'> = {
				...form.getValues(),
				role: roleId,
				require_sponsorship: values.require_sponsorship,
				org,
				documents: files as Json[]
			};

			if (!application.resume && !application.documents?.length) return toast('😬 One more thing', { description: 'Please be sure you provided you attached your resume' });

			const response = await submit(application);
			toggleSubmitState(false);

			if (typeof response == 'number') {
				setApplicationId(response);
				return toggleSuccessDialog(true);
			}
			toast('❌ Ooops', { description: response });
		} catch (error) {
			toggleSubmitState(false);
		}
	};

	const uploadFiles = async () => {
		const uploadedFiles: { name: string; path: string }[] = [];
		return await new Promise<{ name: string; path: string }[] | void>(async (resolve, reject) => {
			const filesToUpload = form.getValues('documents');
			if (!filesToUpload.length) return resolve();

			for (let i = 0; i < filesToUpload.length; i++) {
				const { data, error } = await supabase.storage.from('job-applications').upload(filesToUpload[i].path, filesToUpload[i].file, { upsert: true });
				if (error) {
					toast('🗂️ Error', { description: error.message });
					return reject(error);
				}
				uploadedFiles.push({ name: filesToUpload[i].name, path: data.path });
			}

			return resolve(uploadedFiles);
		});
	};

	const SubmitButton = () => {
		const { pending } = useFormStatus();

		return (
			<Button type="submit" disabled={pending || isSubmiting} size={'sm'} className="gap-3 px-4 text-xs font-light">
				{(pending || isSubmiting) && <LoadingSpinner />}
				{pending || isSubmiting ? 'Submiting application' : 'Submit application'}
			</Button>
		);
	};

	const pickFile = (event: ChangeEvent<HTMLInputElement>, name: string) => {
		if (!event?.target?.files) return;
		const file = event.target?.files[0];
		const reader = new FileReader();
		reader.onloadend = async () => {
			const path = `applications/${org}/${roleId}/${file.name}`;
			// updateFilesToUpload([...filesToUpload, { name, file, path }]);
			form.setValue('documents', [...form.getValues('documents'), { name, file, path }]);
		};

		if (file) reader.readAsDataURL(file);
	};

	return (
		<section className="mx-auto mt-16 grid max-w-4xl gap-4 p-6 pt-24" id="application-form">
			<h1 className="text-2xl font-bold">Application Form</h1>

			<ApplicationSuccessDialog org={org} applicationId={applicationId} isOpen={showSuccessDialog} toggle={toggleSuccessDialog} />

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<FormSection>
						<FormSectionDescription>
							<h2 className="font-medium">Personal Details</h2>
							<p className="text-xs font-light text-muted-foreground">Your personal information here</p>
						</FormSectionDescription>

						<InputsContainer>
							<div className="grid grid-cols-2 gap-x-6 gap-y-8">
								<FormField
									control={form.control}
									name="first_name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>First name</FormLabel>
											<FormControl>
												<Input placeholder="Enter first name here" {...field} />
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
												<Input placeholder="Enter last name here" {...field} />
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
												<Input placeholder="Enter email here" inputMode="email" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="phone_number"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Mobile number</FormLabel>
											<FormControl>
												<Input placeholder="Enter mobile number here" type="tel" inputMode="tel" {...field} />
											</FormControl>
											<FormDescription className="!mt-1 text-xs font-thin text-muted-foreground">Please include country code</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</InputsContainer>
					</FormSection>

					<FormSection>
						<FormSectionDescription>
							<h2 className="font-medium">Resume and documents</h2>
							<p className="text-balance text-xs font-light text-muted-foreground">Upload your resume and every document you&apos;d like to provide</p>
						</FormSectionDescription>

						<InputsContainer>
							<div className="grid gap-x-6 gap-y-8">
								{!showManualResume && (
									<FormField
										control={form.control}
										name="documents"
										render={() => (
											<FormItem>
												<FormLabel>Resume</FormLabel>
												<FormControl>
													<Input accept="application/pdf,image/png,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={event => pickFile(event, 'resume')} type="file" />
												</FormControl>
												<FormDescription>
													Or{' '}
													<button type="button" onClick={() => toggleManualResumeState(!showManualResume)} className="rounded-md bg-secondary p-1 px-2">
														enter manually
													</button>
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
								)}

								{showManualResume && (
									<FormField
										control={form.control}
										name="resume"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Resume, text</FormLabel>
												<FormControl>
													<Textarea placeholder="Enter resume details here" className="placeholder:font-light" {...field} />
												</FormControl>
												<FormDescription>
													Or{' '}
													<button type="button" onClick={() => toggleManualResumeState(!showManualResume)} className="rounded-md bg-secondary p-1 px-2">
														upload document
													</button>
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
								)}

								{!showManualCoverLetter && (
									<FormField
										control={form.control}
										name="documents"
										render={() => (
											<FormItem>
												<FormLabel>Cover letter</FormLabel>
												<FormControl>
													<Input accept="application/pdf,image/png,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={event => pickFile(event, 'cover letter')} type="file" />
												</FormControl>
												<FormDescription>
													Or{' '}
													<button type="button" onClick={() => toggleManualCoverLetterState(!showManualCoverLetter)} className="rounded-md bg-secondary p-1 px-2">
														enter manually
													</button>
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
								)}

								{showManualCoverLetter && (
									<FormField
										control={form.control}
										name="cover_letter"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Cover letter, text</FormLabel>
												<FormControl>
													<Textarea placeholder="Enter resume details here" className="placeholder:font-light" {...field} />
												</FormControl>
												<FormDescription>
													Or{' '}
													<button type="button" onClick={() => toggleManualCoverLetterState(!showManualCoverLetter)} className="rounded-md bg-secondary p-1 px-2">
														upload document
													</button>
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
								)}
							</div>
						</InputsContainer>
					</FormSection>

					<FormSection>
						<FormSectionDescription>
							<h2 className="font-medium">Location details</h2>
							<p className="text-balance text-xs font-light text-muted-foreground">Help us understand where you&apos;re currently resided, so we can know how to prepare for you.</p>
						</FormSectionDescription>

						<InputsContainer>
							<div className="grid gap-x-6 gap-y-8">
								<SelectCountry onSelectCountry={event => selectCountry(event)} name="country_location" label="Where do you reside?" form={form} />

								<SelectCountryState country={selectedCountry?.country_code} form={form} name="state_location" label="State / City / Province" />

								<FormField
									control={form.control}
									name="work_authorization"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Do you have work authorization in the country where this job is located?</FormLabel>
											<Select onValueChange={value => form.setValue('work_authorization', value == 'yes' ? true : false)} defaultValue={field.value == undefined ? '' : field.value == true ? 'yes' : 'no'}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select an option" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="yes">Yes</SelectItem>
													<SelectItem value="no">No</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="require_sponsorship"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Do you require sponsorship to work in the country where this job is located?</FormLabel>
											<Select onValueChange={value => form.setValue('require_sponsorship', value == 'yes' ? true : false)} defaultValue={field.value == undefined ? '' : field.value == true ? 'yes' : 'no'}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select an option" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="yes">Yes</SelectItem>
													<SelectItem value="no">No</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</InputsContainer>
					</FormSection>

					<FormSection>
						<FormSectionDescription>
							<h2 className="font-medium">Links</h2>
							<p className="text-balance text-xs font-light text-muted-foreground">You can add links to any information you think we might find useful to learn about you.</p>
						</FormSectionDescription>

						<InputsContainer>
							<div className="grid gap-x-6 gap-y-8">
								<FormField
									control={form.control}
									name="links"
									render={() => (
										<FormItem>
											<FormLabel>Linkedin</FormLabel>
											<FormControl>
												<Input type="url" onChange={event => form.setValue('links', [...form.getValues('links'), { name: 'linkedin', link: event.target.value }])} inputMode="url" placeholder="Enter linkedin profile link" />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</InputsContainer>
					</FormSection>

					<FormSection>
						<FormSectionDescription className="gap-3">
							<h2 className="font-medium">Voluntary Self-Identification</h2>
							<p className="text-balance text-xs font-light text-muted-foreground">For government reporting purposes, we ask candidates to respond to the below self-identification survey.</p>
							<p className="text-balance text-xs font-light text-muted-foreground">As set forth in our Equal Employment Opportunity policy, we do not discriminate on the basis of any protected group status under any applicable law.</p>
						</FormSectionDescription>

						<InputsContainer>
							<div className="grid gap-x-6 gap-y-8">
								<FormField
									control={form.control}
									name="gender"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Gender</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select a gender" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="male">Male</SelectItem>
													<SelectItem value="female">Female</SelectItem>
													<SelectItem value="decline">Decline to self identify</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="race_ethnicity"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Race / Ethnicity</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select a race/ethnic group" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="hispanic-latino">Hispanic/Latino</SelectItem>
													<SelectItem value="american-indian">American Indian / Alaskan Native</SelectItem>
													<SelectItem value="asian">Asian</SelectItem>
													<SelectItem value="black-african-american">Black or African American</SelectItem>
													<SelectItem value="white">White</SelectItem>
													<SelectItem value="native-hawaiian-pacific-islands">Native Hawaiian or Other Pacific Islands</SelectItem>
													<SelectItem value="decline">Decline to self identify</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="veterian_status"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Veterian Status</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select an option" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="not-veterian">I am not a protected veterian</SelectItem>
													<SelectItem value="veterian">I am a protected veterian</SelectItem>
													<SelectItem value="decline">I do not wish to answer</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="disability"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Disability status</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select an option" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="not-disabled">I do not have a disability, or had one in the past</SelectItem>
													<SelectItem value="disabled">I have a disability, or had one in the past</SelectItem>
													<SelectItem value="decline">I do not wish to answer</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</InputsContainer>
					</FormSection>

					<FormSection className="flex w-full justify-end">
						<SubmitButton />
					</FormSection>
				</form>
			</Form>
		</section>
	);
}
