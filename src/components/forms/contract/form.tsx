'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { DatePicker } from '@/components/ui/date-picker';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/type/database.types';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/loader';
import { createLevel, inviteUser, updateContract } from './invite-user.action';
import { EORAgreementDrawer } from '@/components/eor/eor-agreement';
import { createEORAgreement, doesUserHaveAdequatePermissions, getEORAgreementByCountry } from '@/utils/api';
import { NewContractDialog } from '../../../app/(private)/[org]/people/new/new-contract-dialog';
import { PayInput } from '@/components/forms/pay-input';
import { FixedAllowance } from '@/components/forms/fixed-allowance';
import { AdditionalOffering } from '@/components/forms/additional-offering';
import { SelectLegalEntity } from '@/components/forms/legal-entity';
import { SelectLevel } from '@/components/forms/level-option';
import { JobResponsibilities } from '@/components/forms/job-responsibilities';
import { JobRequirements } from '@/components/forms/job-requirements';
import { createOpenRole, updateRole } from './role.action';

const supabase = createClient();

interface props {
	orgBenefits?: Tables<'org_settings'> | null;
	contractData?: TablesUpdate<'contracts'>;
	openRoleData?: TablesUpdate<'open_roles'>;
	contractDuplicate?: TablesUpdate<'contracts'>;
	openRoleDuplicate?: TablesUpdate<'open_roles'>;
	formType?: 'role' | 'contract';
}

export const ContractForm = ({ contractData, openRoleData, contractDuplicate, openRoleDuplicate, orgBenefits, formType = 'contract' }: props) => {
	const [countries, setCountries] = useState<{ name: string; dial_code: string; country_code: string }[]>([]);
	const [entities, setEntities] = useState<Tables<'legal_entities'>[]>([]);
	const [eorEntities, setEorEntities] = useState<Tables<'legal_entities'>[]>([]);
	const [showSigningBonus, toggleShowSigningBonus] = useState(!!contractData?.signing_bonus || !!contractDuplicate?.signing_bonus || !!openRoleData?.signing_bonus || !!openRoleDuplicate?.signing_bonus);
	const [showFixedIncome, toggleShowFixedIncome] = useState(!!contractData?.fixed_allowance || !!contractDuplicate?.fixed_allowance || !!openRoleData?.fixed_allowance || !!openRoleDuplicate?.fixed_allowance);
	const [showAdditionalOffering, toggleAdditionalOffering] = useState(
		!!contractData?.additional_offerings?.length || !!contractDuplicate?.additional_offerings?.length || !!openRoleData?.additional_offerings?.length || !!openRoleDuplicate?.additional_offerings?.length || !!orgBenefits?.additional_offerings?.length
	);
	const [indefiniteEndDate, toggleIndefiniteEndDate] = useState(!contractData?.end_date);
	const [isSubmiting, toggleSubmitState] = useState(false);
	const params = useParams<{ org: string }>();
	const [isAlertOpen, toggleAgreementDialog] = useState(false);
	const [agreementId, setAgreementId] = useState<number>();
	const [isNationalityOpen, toggleNationalityDropdown] = useState(false);
	const [isNewContractDialogOpen, toggleNewContractDialog] = useState(false);
	const [newContractId, setNewContractId] = useState(0);
	const [isLevelCreated, setLevelCreationState] = useState(false);
	const [showSalaryCostomError, toggleSalaryCustomError] = useState(false);
	const [showSigningCostomError, toggleSigningCustomError] = useState(false);
	const [selectedLevel, setActiveLevel] = useState<{ level: TablesInsert<'employee_levels'>; isOrgs: boolean }>();

	const formSchema = z.object({
		first_name: formType == 'contract' ? z.string() : z.string().optional(),
		last_name: formType == 'contract' ? z.string() : z.string().optional(),
		email: formType == 'contract' ? z.string().email() : z.string().email().optional(),
		nationality: formType == 'contract' ? z.string() : z.string().optional(),
		job_title: z.string(),
		level: z.string(),
		employment_type: z.enum(['full-time', 'part-time', 'contract']),
		work_schedule: z.string().optional(),
		work_shedule_interval: z.string().optional(),
		responsibilities: z.array(z.string()),
		salary: z.string(),
		signing_bonus: z.string().optional(),
		fixed_allowance: z.array(z.object({ name: z.string(), amount: z.string(), frequency: z.string() })).optional(),
		start_date: formType == 'contract' ? z.date() : z.date().optional(),
		end_date: formType == 'contract' ? z.date() : z.date().optional(),
		probation_period: z.number(),
		paid_leave: z.number(),
		sick_leave: z.number(),
		years_of_experience: z.number().optional(),
		additional_offerings: z.array(z.string()),
		requirements: z.array(z.string()).optional(),
		work_location: z.enum(['remote', 'hybrid', 'on-site']),
		entity: z.string()
	});

	const getCountries = async () => {
		const { data, error } = await supabase.from('countries').select();
		if (!error) setCountries(data);
	};

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			first_name: (contractData?.profile as any)?.first_name || formType == 'contract' ? '' : undefined,
			last_name: (contractData?.profile as any)?.last_name || formType == 'contract' ? '' : undefined,
			email: (contractData?.profile as any)?.email || formType == 'contract' ? '' : undefined,
			additional_offerings:
				(contractData?.additional_offerings as string[]) ||
				(contractDuplicate?.additional_offerings as string[]) ||
				(openRoleData?.additional_offerings as string[]) ||
				(openRoleDuplicate?.additional_offerings as string[]) ||
				(orgBenefits?.additional_offerings as string[]) ||
				[],
			nationality: (contractData?.profile as any)?.nationality || formType == 'contract' ? '' : undefined,
			responsibilities: (contractData?.responsibilities as string[]) || (contractDuplicate?.responsibilities as string[]) || (openRoleData?.responsibilities as string[]) || (openRoleDuplicate?.responsibilities as string[]) || [],
			fixed_allowance: (contractData?.fixed_allowance as any) || (contractDuplicate?.fixed_allowance as any) || (openRoleData?.fixed_allowance as any) || (openRoleDuplicate?.fixed_allowance as any) || [],
			start_date: contractData?.start_date ? new Date(contractData?.start_date) : new Date(),
			end_date: contractData?.end_date ? new Date(contractData?.end_date) : contractDuplicate?.end_date ? new Date(contractDuplicate?.end_date) : new Date(),
			probation_period: contractData?.probation_period || contractDuplicate?.probation_period || openRoleData?.probation_period || openRoleDuplicate?.probation_period || orgBenefits?.probation || 90,
			paid_leave: contractData?.paid_leave || contractDuplicate?.paid_leave || openRoleData?.paid_leave || openRoleDuplicate?.paid_leave || orgBenefits?.paid_time_off || 20,
			sick_leave: contractData?.sick_leave || contractDuplicate?.sick_leave || openRoleData?.sick_leave || openRoleDuplicate?.sick_leave || orgBenefits?.sick_leave || 20,
			work_schedule: contractData?.work_schedule || contractDuplicate?.work_schedule || openRoleData?.work_schedule || openRoleDuplicate?.work_schedule || orgBenefits?.work_schedule || '8',
			work_shedule_interval: contractData?.work_shedule_interval || contractDuplicate?.work_shedule_interval || openRoleData?.work_shedule_interval || openRoleDuplicate?.work_shedule_interval || orgBenefits?.work_shedule_interval || 'daily',
			salary:
				formType == 'contract'
					? contractData?.salary
						? String(contractData?.salary)
						: contractDuplicate?.salary
							? String(contractDuplicate?.salary)
							: ''
					: openRoleData?.salary
						? String(openRoleData?.salary)
						: openRoleDuplicate?.salary
							? String(openRoleDuplicate?.salary)
							: '',
			signing_bonus:
				formType == 'contract'
					? contractData?.signing_bonus
						? String(contractData?.signing_bonus)
						: contractDuplicate?.signing_bonus
							? String(contractDuplicate?.signing_bonus)
							: undefined
					: openRoleData?.signing_bonus
						? String(openRoleData?.signing_bonus)
						: openRoleDuplicate?.signing_bonus
							? String(openRoleDuplicate?.signing_bonus)
							: undefined,
			employment_type: contractData?.employment_type || contractDuplicate?.employment_type || openRoleData?.employment_type || openRoleDuplicate?.employment_type || undefined,
			job_title: contractData?.job_title || contractDuplicate?.job_title || openRoleData?.job_title || openRoleDuplicate?.job_title || '',
			entity:
				formType == 'contract'
					? contractData?.entity
						? String(contractData?.entity)
						: contractDuplicate?.entity
							? String(contractDuplicate?.entity)
							: undefined
					: openRoleData?.entity
						? String(openRoleData?.entity)
						: openRoleDuplicate?.entity
							? String(openRoleDuplicate?.entity)
							: undefined,
			level:
				formType == 'contract'
					? contractData?.level
						? String(contractData?.level)
						: contractDuplicate?.level
							? String(contractDuplicate?.level)
							: undefined
					: openRoleData?.level
						? String(openRoleData?.level)
						: openRoleDuplicate?.level
							? String(openRoleDuplicate?.level)
							: undefined,
			work_location: contractData?.work_location || contractDuplicate?.work_location || openRoleData?.work_location || openRoleDuplicate?.work_location || undefined,
			requirements: (contractData?.requirements as string[]) || (contractDuplicate?.requirements as string[]) || (openRoleData?.requirements as string[]) || (openRoleDuplicate?.requirements as string[]) || [],
			years_of_experience: openRoleData?.years_of_experience || openRoleDuplicate?.years_of_experience || Number('')
		}
	});

	const getEntities = useCallback(async () => {
		const { data, error } = await supabase.from('legal_entities').select().eq('org', params.org);
		const { data: eorData, error: eorError } = await supabase.from('legal_entities').select().eq('is_eor', true);

		if (!error) setEntities(data);
		if (!eorError) setEorEntities(eorData);
	}, [params.org]);

	const isEntityEOR = async (entityId: number) => {
		const entity = eorEntities.find(entity => entity.id === Number(entityId));
		return entity;
	};

	const createEmployeeLevel = async (level: TablesInsert<'employee_levels'>) => {
		const response = await createLevel(level);
		if (typeof response == 'string') {
			toggleSubmitState(false);
			return toast.error('😔 Error', { description: response });
		}

		setLevelCreationState(true);
		form.setValue('level', String(response));
		return true;
	};

	const createRole = async (values: z.infer<typeof formSchema>) => {
		const role: TablesInsert<'open_roles'> = {
			employment_type: values.employment_type,
			salary: Number(values.salary),
			sick_leave: values.sick_leave,
			paid_leave: values.paid_leave,
			probation_period: values.probation_period,
			work_schedule: values.work_schedule,
			work_shedule_interval: values.work_shedule_interval,
			job_title: values.job_title,
			level: Number(form.getValues('level')),
			responsibilities: values.responsibilities,
			requirements: values.requirements,
			entity: Number(values.entity),
			org: params.org,
			work_location: values.work_location,
			years_of_experience: values.years_of_experience,
			state: 'open'
		};
		if (showSigningBonus) role.signing_bonus = Number(values.signing_bonus);
		if (showFixedIncome) role.fixed_allowance = values.fixed_allowance;
		if (showAdditionalOffering) role.additional_offerings = values.additional_offerings;

		const responseMessage = openRoleData ? await updateRole(role, params.org) : await createOpenRole(role, params.org);

		toggleSubmitState(false);
		if (responseMessage == 'update') return toast.success('Role details updated successfully');
		if (responseMessage) return toast.error(responseMessage);
	};

	const createEmployeeContract = async (values: z.infer<typeof formSchema>) => {
		const profile: TablesInsert<'profiles'> = {
			first_name: values.first_name as string,
			last_name: values.last_name as string,
			nationality: values.nationality,
			email: values.email as string,
			id: ''
		};
		const contract: TablesInsert<'contracts'> = {
			employment_type: values.employment_type,
			start_date: values.start_date as unknown as string,
			salary: Number(values.salary),
			sick_leave: values.sick_leave,
			paid_leave: values.paid_leave,
			probation_period: values.probation_period,
			work_schedule: values.work_schedule,
			work_shedule_interval: values.work_shedule_interval,
			job_title: values.job_title,
			level: Number(form.getValues('level')),
			responsibilities: values.responsibilities,
			profile: contractData ? (contractData?.profile as any).id : '',
			entity: Number(values.entity),
			org: params.org
		};
		if (showSigningBonus) contract.signing_bonus = Number(values.signing_bonus);
		if (showFixedIncome) contract.fixed_allowance = values.fixed_allowance;
		if (showAdditionalOffering) contract.additional_offerings = values.additional_offerings;
		if (!indefiniteEndDate) contract.end_date = values.end_date as any;

		const responseMessage = contractData ? await updateContract(JSON.stringify(contract)) : await inviteUser(JSON.stringify(contract), JSON.stringify(profile));

		toggleSubmitState(false);
		if (responseMessage == 'update') return toast.success('Contract details updated successfully');
		if (typeof responseMessage == 'number') {
			setNewContractId(responseMessage);
			return toggleNewContractDialog(true);
		}
		if (responseMessage) return toast.error(responseMessage);
	};

	const createContract = async (values: z.infer<typeof formSchema>) => {
		const orgHasExistingLevel = selectedLevel?.isOrgs;

		if (!orgHasExistingLevel && values.level) {
			const localLevelSelected = selectedLevel?.level;

			const level: TablesInsert<'employee_levels'> = {
				level: localLevelSelected?.level || 'New band',
				role: localLevelSelected?.role,
				org: params.org,
				min_salary: Number(values.salary),
				max_salary: Number(values.salary) + 1,
				max_signing_bonus: Number(values.signing_bonus) + 1,
				min_signing_bonus: Number(values.signing_bonus),
				fixed_allowance: values.fixed_allowance
			};
			const response = await createEmployeeLevel(level);
			if (response !== true) return;
		}

		return formType === 'contract' ? createEmployeeContract(values) : createRole(values);
	};

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		toggleSubmitState(true);
		// does user have adequate permission for this?
		const userHasPermission = await doesUserHaveAdequatePermissions({ orgId: params.org });
		if (userHasPermission !== true) {
			toggleSubmitState(false);
			return toast.error(userHasPermission);
		}

		// does contract require EOR?
		const entityData = await isEntityEOR(Number(values.entity));
		if (entityData?.is_eor !== true) return createContract(values);

		// if the contract requires EOR contract, does the or have an existing contract
		const eorAgreement = await getEORAgreementByCountry(entityData?.incorporation_country as string);
		if (eorAgreement.error) {
			toggleSubmitState(false);
			return toast.error(eorAgreement.error.message);
		}

		// if org does not have an existing contract, create one and prompt to sign
		if (!eorAgreement.data.length) {
			const res = await createEORAgreement({ org: params.org });
			if (typeof res !== 'number') return toast.error(res);
			setAgreementId(res);

			return toggleAgreementDialog(true);
		}

		// if org has a contract and hasn't signed, prompt to sign contract
		if (!eorAgreement.data[0].signed_by) {
			setAgreementId(eorAgreement.data[0].id);
			return toggleAgreementDialog(true);
		}

		// if contract exists and signed, create contract
		return createContract(values);
	};

	const onSignAgreement = () => {
		const values = form.getValues();
		if (values) createContract(values);
	};

	useEffect(() => {
		if (formType == 'contract') getCountries();
		getEntities();
	}, [getEntities, formType]);

	const validateSalary = (salary: number) => {
		const level = selectedLevel?.level;

		if (!level?.min_salary || !level?.max_salary) return;
		if (salary < level?.min_salary || salary > level?.max_salary) toggleSalaryCustomError(true);
		else toggleSalaryCustomError(false);
	};

	const validateBonus = (bonus: number) => {
		const level = selectedLevel?.level;

		if (!level?.min_signing_bonus || !level?.min_signing_bonus) return;
		if (bonus < level?.min_signing_bonus || bonus > level?.min_signing_bonus) toggleSigningCustomError(true);
		else toggleSigningCustomError(false);
	};

	const onSetLevel = () => {
		toggleShowFixedIncome(!!form.getValues('fixed_allowance')?.length);
		toggleShowSigningBonus(!!form.getValues('signing_bonus')?.length);
	};

	return (
		<>
			{isAlertOpen && (
				<EORAgreementDrawer
					agreementId={agreementId}
					completeContract={onSignAgreement}
					eorEntities={eorEntities}
					entities={entities}
					entity={String(entities[0]?.id)}
					eor_entity={Number(form.getValues('entity'))}
					isAlertOpen={isAlertOpen}
					toggleAgreementDialog={toggleAgreementDialog}
					onCancel={() => toggleAgreementDialog(false)}
				/>
			)}

			<NewContractDialog isAlertOpen={isNewContractDialogOpen} toggleDialog={toggleNewContractDialog} contractId={newContractId} isLevelCreated={isLevelCreated} />

			<Form {...form}>
				<form className="grid w-full gap-6" onSubmit={form.handleSubmit(onSubmit)}>
					{/* entity details */}
					<div className="grid grid-cols-2 border-t border-t-border pt-10">
						<div>
							<h2 className="font-semibold">Legal entity </h2>
							<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">You can hire employee through one of your legal entity or through aveer.hr&apos;s, we&apos;ll sort out the compliance for you in that region automatically</p>
						</div>

						<div className="mb-10 grid gap-8">
							<SelectLegalEntity form={form} entities={entities} eorEntities={eorEntities} />
						</div>
					</div>

					{/* employee details */}
					{formType === 'contract' && (
						<div className="grid grid-cols-2 border-t border-t-border pt-10">
							<div>
								<h2 className="font-semibold">{contractData ? 'Employee details' : 'Personal details'}</h2>
								<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">This should be the public name of your entire organisation. This is mostly an organisation identifier.</p>
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
													<Input disabled={!!contractData} type="text" placeholder="Enter first name" {...field} required />
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
													<Input disabled={!!contractData} type="text" placeholder="Enter last name" {...field} required />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="grid grid-cols-2 gap-6">
									<FormField
										control={form.control}
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Email</FormLabel>
												<FormControl>
													<Input disabled={!!contractData} type="email" placeholder="Enter email" {...field} required />
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
												<FormLabel>Country</FormLabel>
												<Popover open={isNationalityOpen} onOpenChange={toggleNationalityDropdown}>
													<PopoverTrigger asChild>
														<FormControl>
															<Button disabled={!!contractData} variant="outline" role="combobox" className={cn('w-full justify-between bg-input-bg', !field.value && 'text-muted-foreground')}>
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
																			value={country?.name}
																			key={country.country_code}
																			onSelect={() => {
																				form.setValue('nationality', country.country_code);
																				toggleNationalityDropdown(false);
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
							</div>
						</div>
					)}

					{/* employment details */}
					<div className="grid grid-cols-2 border-t border-t-border pt-10">
						<div>
							<h2 className="font-semibold">Employment details</h2>
							<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">This should be the public name of your entire organisation. This is mostly an organisation identifier.</p>
						</div>

						<div className="mb-10 grid gap-8">
							<div className="grid grid-cols-2 gap-6">
								<FormField
									control={form.control}
									name="job_title"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Job title</FormLabel>
											<FormControl>
												<Input type="text" placeholder="Enter job title" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<SelectLevel
									form={form}
									org={params.org}
									setLevelDetails={event => {
										setActiveLevel(event);
										onSetLevel();
									}}
								/>
							</div>

							<FormField
								control={form.control}
								name="employment_type"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Employment type</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Is employee full-time or part-time?" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="full-time">Full-time</SelectItem>
												<SelectItem value="part-time">Part-time</SelectItem>
												<SelectItem value="contract">Contract</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid w-full gap-3">
								<Label>Work schedule</Label>
								<div className="grid w-full grid-cols-2 gap-6">
									<FormField
										control={form.control}
										name="work_schedule"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<div className="relative h-fit w-full">
														<Input type="text" placeholder="40" {...field} required />
														<div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-thin text-foreground">hours</div>
													</div>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="work_shedule_interval"
										render={({ field }) => (
											<FormItem>
												<Select onValueChange={field.onChange} defaultValue={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Daily, weekly or monthly?" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="weekly">Weekly</SelectItem>
														<SelectItem value="monthly">Monthly</SelectItem>
														<SelectItem value="daily">Daily</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>

							<JobResponsibilities form={form} />
						</div>
					</div>

					{/* job requirements */}
					{formType == 'role' && (
						<div className="grid grid-cols-2 border-t border-t-border pt-10">
							<div>
								<h2 className="font-semibold">Job requirements</h2>
								<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">What are the things, skills or characteristics you expect from your new hire.</p>
							</div>

							<div className="mb-10 grid gap-10">
								<FormField
									control={form.control}
									name="years_of_experience"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Years of experience</FormLabel>
											<FormControl>
												<div className="relative h-fit w-full">
													<Input type="number" placeholder="Enter years of experience required" {...field} onChange={event => form.setValue('years_of_experience', Number(event.target.value))} />
													<div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-thin text-foreground">years</div>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<JobRequirements form={form} />
							</div>
						</div>
					)}

					{/* compensation */}
					<div className="grid grid-cols-2 border-t border-t-border pt-10">
						<div>
							<h2 className="font-semibold">Compensation</h2>
							<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">This should be the public name of your entire organisation. This is mostly an organisation identifier.</p>
						</div>

						<div className="mb-10 grid gap-8">
							<PayInput form={form} name="salary" label="Base salary" minValue={Number(selectedLevel?.level.min_salary)} maxValue={Number(selectedLevel?.level.max_salary)} validateSalary={validateSalary} salaryInvalid={showSalaryCostomError} />

							<FormField
								control={form.control}
								name="signing_bonus"
								render={() => (
									<FormItem className="grid w-full gap-3 rounded-lg bg-accent p-2">
										<div className="flex items-center justify-between space-x-2">
											<FormLabel>Add signing bonus</FormLabel>
											<Switch checked={showSigningBonus} onCheckedChange={event => toggleShowSigningBonus(event)} id="signin-bonus" className="scale-75" />
										</div>

										{showSigningBonus && (
											<PayInput form={form} name="signing_bonus" minValue={Number(selectedLevel?.level.min_signing_bonus)} maxValue={Number(selectedLevel?.level.max_signing_bonus)} validateSalary={validateBonus} salaryInvalid={showSigningCostomError} />
										)}
									</FormItem>
								)}
							/>

							<FixedAllowance toggle={toggleShowFixedIncome} isToggled={showFixedIncome} form={form} />

							<AdditionalOffering toggle={toggleAdditionalOffering} isToggled={showAdditionalOffering} form={form} />
						</div>
					</div>

					{/* job schedule */}
					<div className="grid grid-cols-2 border-t border-t-border pt-10">
						<div>
							<h2 className="font-semibold">Job Schedule</h2>
							<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">This should be the public name of your entire organisation. This is mostly an organisation identifier.</p>
						</div>

						<div className="mb-10 grid gap-8">
							{formType === 'contract' && (
								<>
									<FormField
										control={form.control}
										name="start_date"
										render={({ field }) => (
											<FormItem className="flex flex-col">
												<FormLabel>Employment start date</FormLabel>
												<DatePicker onSetDate={field.onChange} selected={field.value} />
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="end_date"
										render={({ field }) => (
											<FormItem className="grid gap-1">
												<FormLabel>Employment end date</FormLabel>
												<div className="grid w-full gap-3 rounded-lg bg-accent px-2 py-2">
													<div className="flex items-center justify-between space-x-2">
														<Label htmlFor="indefinite">Indefinite</Label>
														<Switch checked={indefiniteEndDate} onCheckedChange={event => toggleIndefiniteEndDate(event)} id="indefinite" className="scale-75" />
													</div>

													{!indefiniteEndDate && <DatePicker onSetDate={field.onChange} selected={field.value} />}
												</div>
												<FormMessage />
											</FormItem>
										)}
									/>
								</>
							)}

							<div className="grid grid-cols-2 gap-6">
								<FormField
									control={form.control}
									name="paid_leave"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Leave</FormLabel>
											<FormControl>
												<div className="relative h-fit w-full">
													<Input type="number" placeholder="20" {...field} onChange={event => form.setValue('paid_leave', Number(event.target.value))} required />
													<div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-thin text-foreground">days/year</div>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="sick_leave"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Sick leave</FormLabel>
											<FormControl>
												<div className="relative h-fit w-full">
													<Input type="number" placeholder="20" {...field} onChange={event => form.setValue('sick_leave', Number(event.target.value))} required />
													<div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-thin text-foreground">days/year</div>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="probation_period"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Probation period</FormLabel>
										<FormControl>
											<div className="relative h-fit w-full">
												<Input type="number" placeholder="90" {...field} onChange={event => form.setValue('probation_period', Number(event.target.value))} required />
												<div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-thin text-foreground">days</div>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>

					{/* location */}
					<div className="grid grid-cols-2 border-t border-t-border pt-10">
						<div>
							<h2 className="font-semibold">Location</h2>
							<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">Where will your new hire be working from: remote, office, or hybrid?</p>
						</div>

						<div className="mb-10 grid gap-10">
							<FormField
								control={form.control}
								name="work_location"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Work location</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Office, hybrid or remote" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="on-site">On-Site</SelectItem>
												<SelectItem value="hybrid">Hybrid</SelectItem>
												<SelectItem value="remote">Remote</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>

					<div className="flex items-center justify-end border-t border-t-border pt-10">
						<Button disabled={isSubmiting} type="submit" size={'sm'} className="gap-3 px-6 text-sm font-light">
							{isSubmiting && <LoadingSpinner />}
							{formType == 'contract' && <>{isSubmiting ? (contractData ? 'Updating person' : 'Adding person') : contractData ? 'Update person' : 'Add person'}</>}
							{formType == 'role' && <>{isSubmiting ? (openRoleData ? 'Updating role' : 'Creating role') : openRoleData ? 'Update role' : 'Create role'}</>}
						</Button>
					</div>
				</form>
			</Form>
		</>
	);
};

const levels = [
	{ id: 'fks', level: 'IC Level 1', role: 'Entry', min_salary: 50000, max_salary: 50000 },
	{ id: 'ldb', level: 'IC Level 2', role: 'Mid I', min_salary: 72000, max_salary: 50000 },
	{ id: 'jff', level: 'IC Level 3', role: 'Mid II', min_salary: 92000, max_salary: 50000 },
	{ id: 'dfu', level: 'IC Level 4', role: 'Mid II', min_salary: 110000, max_salary: 50000 },
	{ id: 'oia', level: 'IC Level 5', role: 'Senior I', min_salary: 160000, max_salary: 50000 },
	{ id: 'ejd', level: 'IC Level 6', role: 'Senior II', min_salary: 180000, max_salary: 50000 },
	{ id: 'fou', level: 'IC Level 7', role: 'Staff', min_salary: 240000, max_salary: 50000 },
	{ id: 'elj', level: 'IC Level 8', role: 'Principal', min_salary: 280000, max_salary: 50000 },
	{ id: 'euw', level: 'IC Level 9', role: 'VP', min_salary: 350000, max_salary: 50000 },
	{ id: 'ale', level: 'IC Level 10', role: 'Executive', min_salary: 400000, max_salary: 50000 }
];
