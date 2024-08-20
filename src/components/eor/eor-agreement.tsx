'use client';

import { Button } from '@/components/ui/button';
import './style.scss';
import { toast } from 'sonner';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tables, TablesUpdate } from '@/type/database.types';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/utils/supabase/client';
import { LoadingSpinner } from '@/components/ui/loader';
import { signContract } from './eor-agreement.action';

const supabase = createClient();

const formSchema = z.object({
	entity: z.string().optional(),
	eor_entity: z.string(),
	profile: z.string().optional(),
	signature_text: z.string()
});

export const EORAgreementDrawer = ({
	eorEntities,
	entities,
	entity,
	eor_entity,
	isAlertOpen,
	toggleAgreementDialog,
	completeContract,
	onCancel,
	agreementId
}: {
	isAlertOpen: boolean;
	toggleAgreementDialog: Dispatch<SetStateAction<boolean>>;
	eorEntities: Tables<'legal_entities'>[];
	eor_entity: number;
	entity: string;
	entities: Tables<'legal_entities'>[];
	completeContract: () => void;
	onCancel: () => void;
	agreementId?: number;
}) => {
	const [profile, setProfile] = useState<Tables<'profiles'>>();
	const [isSigning, toggleSigningState] = useState(false);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			entity: String(entity) || String(entities[0]?.id) || undefined,
			eor_entity: String(eor_entity) || String(eorEntities[0]?.id) || undefined,
			profile: '',
			signature_text: ''
		}
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		toggleSigningState(true);

		if (!agreementId) return toast.error('Agreement id not found');

		const signatureUpdate: TablesUpdate<'org_documents'> = {
			entity: values.entity ? Number(values.entity) : null,
			eor_entity: Number(values.eor_entity),
			signature_text: values.signature_text,
			signed_by: profile?.id
		};

		const response = await signContract(signatureUpdate, agreementId);

		if (!response?.error && response.data) {
			toast.success('Agreement has been signed successfully');
			completeContract();
			toggleSigningState(false);
			toggleAgreementDialog(false);
		}

		if (response.error) toast.error(response.error.message);
	};

	useEffect(() => {
		const getProfileId = async () => {
			const { data, error } = await supabase.auth.getSession();
			if (error || !data.session?.user) return;

			const { data: profileData, error: profileError } = await supabase.from('profiles').select().eq('id', data.session.user.id).single();
			if (profileError) return;
			if (profileData) setProfile(profileData);
			if (entities.length == 0) form.setValue('profile', profileData.id);
		};

		getProfileId();
	}, [entities, form, setProfile]);

	return (
		<>
			<AlertDialog open={isAlertOpen} onOpenChange={toggleAgreementDialog}>
				<AlertDialogContent className="max-w-3xl">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="grid w-full gap-8">
							<div>
								<AlertDialogTitle className="">Sign Employer of Record Agreement</AlertDialogTitle>
								<AlertDialogDescription className="mt-1 text-balance text-xs font-light leading-5">This is an agreement between your organisation and aveer.hr, that enables us to hire on your behalf.</AlertDialogDescription>
							</div>

							<div>
								<h1 className="mb-2 text-sm font-bold">Parties</h1>
								<ul className="grid grid-cols-2 gap-10 border-t border-t-border pt-4">
									<li>
										<h2 className="text-xs font-light text-muted-foreground">You</h2>
										<div className="mt-4 grid gap-2 text-xs font-light">
											{entities.length > 0 && (
												<FormField
													control={form.control}
													name="entity"
													render={({ field }) => (
														<FormItem className="-mt-2">
															<Select onValueChange={field.onChange} defaultValue={field.value}>
																<FormControl>
																	<SelectTrigger>
																		<SelectValue placeholder="Select legal entity you'd like to hire under" />
																	</SelectTrigger>
																</FormControl>
																<SelectContent>
																	<SelectGroup>
																		<SelectLabel>Your Legal Entities</SelectLabel>
																		{entities.map(entity => (
																			<SelectItem key={entity.id} value={String(entity.id)}>
																				{entity?.name} • <span className="text-muted-foreground">{entity.incorporation_country}</span>
																			</SelectItem>
																		))}
																	</SelectGroup>
																</SelectContent>
															</Select>
															<FormMessage />
														</FormItem>
													)}
												/>
											)}
											{entities.length == 0 && profile && <Input disabled={true} className="-mt-2" type="text" defaultValue={`${profile?.first_name} ${profile?.last_name}`} required />}
										</div>
									</li>

									<li>
										<h2 className="text-xs font-light text-muted-foreground">Aveer.hr</h2>
										<div className="mt-4 grid gap-2 text-xs font-light">
											<FormField
												control={form.control}
												name="eor_entity"
												render={({ field }) => (
													<FormItem className="-mt-2">
														<Select onValueChange={field.onChange} defaultValue={field.value}>
															<FormControl>
																<SelectTrigger>
																	<SelectValue placeholder="Select legal entity you'd like to hire under" />
																</SelectTrigger>
															</FormControl>
															<SelectContent>
																<SelectGroup>
																	<SelectLabel>Aveer.hr Entities</SelectLabel>
																	{eorEntities.map(entity => (
																		<SelectItem key={entity.id} value={String(entity.id)}>
																			{entity?.name} • <span className="text-muted-foreground">{entity.incorporation_country}</span>
																		</SelectItem>
																	))}
																</SelectGroup>
															</SelectContent>
														</Select>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
									</li>
								</ul>
							</div>

							<Card>
								<CardContent className="min-h-64 w-full"></CardContent>
							</Card>

							<div className="flex items-end justify-between">
								<div className="flex items-center gap-6">
									<div className="grid gap-2">
										<FormField
											control={form.control}
											name="signature_text"
											render={({ field }) => (
												<FormItem>
													<FormControl>
														<input
															type="text"
															placeholder="Enter your legal full name"
															autoComplete="off"
															required
															id="signature-string"
															aria-label="Signature text"
															className="signature m-0 mt-7 w-48 border-b border-b-secondary bg-transparent pb-2 text-sm font-light outline-none placeholder:font-karla"
															{...field}
															onChange={field.onChange}
														/>
													</FormControl>
													<FormLabel>Client Signature</FormLabel>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									<div className="grid gap-2">
										<input
											type="text"
											placeholder="Enter your legal full name"
											name="signature-string"
											autoComplete="off"
											required
											defaultValue={'Emmanuel Aina'}
											id="signature-string"
											aria-label="Signature text"
											className="signature m-0 mt-7 w-48 border-b border-b-secondary bg-transparent pb-2 text-sm font-light outline-none placeholder:font-karla"
										/>
										<Label>Aveer.hr Signature</Label>
									</div>
								</div>

								<div className="flex items-center gap-2">
									<AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>

									<Button type="submit" disabled={isSigning} size={'sm'} className="px-8 text-xs font-light">
										{isSigning && <LoadingSpinner />}
										{isSigning ? 'Signing' : 'Sign'}
									</Button>
								</div>
							</div>
						</form>
					</Form>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};
