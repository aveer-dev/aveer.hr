'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DatePicker } from '@/components/ui/date-picker';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/type/database.types';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import { createLevel, inviteUser, updateContract } from './invite-user.action';
import { EORAgreementDrawer } from '@/components/eor/eor-agreement';
import { createEORAgreement, doesUserHaveAdequatePermissions, getEORAgreementByCountry } from '@/utils/api';
import { NewContractDialog } from './new-contract-dialog';
import { SelectLegalEntity } from '@/components/forms/legal-entity';
import { SelectLevel } from '@/components/forms/level-option';
import { JobResponsibilities } from '@/components/forms/job-responsibilities';
import { JobRequirements } from '@/components/forms/job-requirements';
import { createOpenRole, updateRole } from './role.action';
import { SelectCountry } from '../countries-option';
import { NewRoleDialog } from './new-role-dialog';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { ContractDetails } from './contract-details';
import { cn } from '@/lib/utils';
import { CompensationDialog } from './compensation-dialog';
import { AdditionalOfferingDialog } from './additional-offering-dialog';
import { JobScheduleDialog } from './job-schedule';

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
	const [entities, setEntities] = useState<Tables<'legal_entities'>[]>([]);
	const [roles, setRoles] = useState<Tables<'open_roles'>[]>([]);
	const [orgJobLevels, updateOrgJobLevels] = useState<TablesInsert<'employee_levels'>[]>([]);
	const [eorEntities, setEorEntities] = useState<Tables<'legal_entities'>[]>([]);
	const [showSigningBonus, toggleShowSigningBonus] = useState(!!contractData?.signing_bonus || !!contractDuplicate?.signing_bonus || !!openRoleData?.signing_bonus || !!openRoleDuplicate?.signing_bonus);
	const [showFixedIncome, toggleShowFixedIncome] = useState(!!contractData?.fixed_allowance || !!contractDuplicate?.fixed_allowance || !!openRoleData?.fixed_allowance || !!openRoleDuplicate?.fixed_allowance);
	const [indefiniteEndDate, toggleIndefiniteEndDate] = useState(!contractData?.end_date);
	const [isSubmiting, toggleSubmitState] = useState(false);
	const params = useParams<{ org: string }>();
	const [isAlertOpen, toggleAgreementDialog] = useState(false);
	const [agreementId, setAgreementId] = useState<number>();
	const [isNewContractDialogOpen, toggleNewContractDialog] = useState(false);
	const [showNewRoleDialog, toggleNewRoleDialog] = useState(false);
	const [newContractId, setNewContractId] = useState(0);
	const [newRoleId, setNewRoleId] = useState(0);
	const [isLevelCreated, setLevelCreationState] = useState(false);
	const [showRolesOption, toggleRoleOption] = useState(formType == 'contract' ? !!(contractData || contractDuplicate)?.role : false);
	const [showFormDetails, toggleFormDetails] = useState(false);
	const [showCompensationDialog, toggleCompensationDialog] = useState(false);
	const [showBenefitsDialog, toggleBenefitsDialog] = useState(false);
	const [showScheduleDialog, toggleScheduleDialog] = useState(false);
	const [employeeNationality, setEmployeeNationality] = useState<Tables<'countries'>>();
	const [selectedLevel, setActiveLevel] = useState<{ level?: TablesInsert<'employee_levels'>; isOrgs: boolean }>();

	const formSchema = z.object({
		first_name: formType == 'contract' ? z.string() : z.string().optional(),
		last_name: formType == 'contract' ? z.string() : z.string().optional(),
		email: formType == 'contract' ? z.string().email() : z.string().email().optional(),
		nationality: formType == 'contract' ? z.string() : z.string().optional(),
		job_title: showRolesOption ? z.string().optional() : z.string().min(1),
		level: showRolesOption ? z.string().optional() : z.string(),
		employment_type: showRolesOption ? z.enum(['full-time', 'part-time', 'contract']).optional() : z.enum(['full-time', 'part-time', 'contract']),
		work_schedule: z.string().optional(),
		work_shedule_interval: z.string().optional(),
		responsibilities: showRolesOption ? z.array(z.string()).optional() : z.array(z.string()),
		salary: z.string(),
		signing_bonus: z.string().optional(),
		fixed_allowance: z.array(z.object({ name: z.string(), amount: z.string(), frequency: z.string() })).optional(),
		start_date: formType == 'contract' ? z.date() : z.date().optional(),
		end_date: z.date().optional(),
		probation_period: z.number(),
		paid_leave: z.number(),
		sick_leave: z.number(),
		years_of_experience: z.number().optional(),
		additional_offerings: z.array(z.string()),
		requirements: z.array(z.string()).optional(),
		work_location: z.enum(['remote', 'hybrid', 'on-site']),
		entity: z.string(),
		manager: z.string().optional(),
		department: z.string().optional(),
		role: showRolesOption ? z.string() : z.string().optional()
	});

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			first_name: formType == 'contract' ? (contractData?.profile as any)?.first_name || '' : undefined,
			last_name: formType == 'contract' ? (contractData?.profile as any)?.last_name || '' : undefined,
			email: formType == 'contract' ? (contractData?.profile as any)?.email || '' : undefined,
			additional_offerings:
				(contractData?.additional_offerings as string[]) ||
				(contractDuplicate?.additional_offerings as string[]) ||
				(openRoleData?.additional_offerings as string[]) ||
				(openRoleDuplicate?.additional_offerings as string[]) ||
				(orgBenefits?.additional_offerings as string[]) ||
				[],
			nationality: formType == 'contract' ? (contractData?.profile as any)?.nationality || '' : undefined,
			responsibilities: (contractData?.responsibilities as string[]) || (contractDuplicate?.responsibilities as string[]) || (openRoleData?.responsibilities as string[]) || (openRoleDuplicate?.responsibilities as string[]) || [],
			fixed_allowance: (contractData?.fixed_allowance as any) || (contractDuplicate?.fixed_allowance as any) || (openRoleData?.fixed_allowance as any) || (openRoleDuplicate?.fixed_allowance as any) || [],
			start_date: contractData?.start_date ? new Date(contractData?.start_date) : new Date(),
			end_date: contractData?.end_date ? new Date(contractData?.end_date) : contractDuplicate?.end_date ? new Date(contractDuplicate?.end_date) : undefined,
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

	const getRoles = useCallback(async () => {
		const { data, error } = await supabase.from('open_roles').select().eq('org', params.org);
		if (!error) setRoles(data);
	}, [params.org]);

	const getOrgLevels = useCallback(async () => {
		const { data, error } = await supabase.from('employee_levels').select().match({ org: params.org });
		if (error) toast.error('🫤 Error', { description: `Unable to fetch existing org levels ${error.message}` });
		if (data?.length) updateOrgJobLevels(data);
	}, [params]);

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
			employment_type: values.employment_type as any,
			salary: Number(values.salary),
			sick_leave: values.sick_leave,
			paid_leave: values.paid_leave,
			probation_period: values.probation_period,
			work_schedule: values.work_schedule,
			work_shedule_interval: values.work_shedule_interval,
			job_title: values.job_title as string,
			level: Number(form.getValues('level')),
			responsibilities: values.responsibilities,
			requirements: values.requirements,
			entity: Number(values.entity),
			org: params.org,
			work_location: values.work_location,
			years_of_experience: values.years_of_experience,
			state: 'open',
			additional_offerings: values.additional_offerings
		};

		if (showSigningBonus) role.signing_bonus = Number(values.signing_bonus);
		if (showFixedIncome) role.fixed_allowance = values.fixed_allowance;

		const responseMessage = openRoleData ? await updateRole(role, params.org, openRoleData.id as number) : await createOpenRole(role);

		toggleSubmitState(false);
		if (responseMessage == 'update') return toast.success('Role details updated successfully');
		if (typeof responseMessage == 'number') {
			setNewRoleId(responseMessage);
			return toggleNewRoleDialog(true);
		}
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
			employment_type: values.employment_type as any,
			start_date: values.start_date as unknown as string,
			salary: Number(values.salary),
			sick_leave: values.sick_leave,
			paid_leave: values.paid_leave,
			probation_period: values.probation_period,
			work_schedule: values.work_schedule,
			work_shedule_interval: values.work_shedule_interval,
			job_title: values.job_title as string,
			level: Number(form.getValues('level')),
			responsibilities: values.responsibilities,
			profile: contractData ? (contractData?.profile as any).id : '',
			entity: Number(values.entity),
			org: params.org,
			role: Number(values.role),
			work_location: values.work_location,
			additional_offerings: values.additional_offerings
		};

		if (showSigningBonus) contract.signing_bonus = Number(values.signing_bonus);
		if (showFixedIncome) contract.fixed_allowance = values.fixed_allowance;
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

	const onSubmit = async () => {
		const values = form.getValues();

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

	const reviewFormDetails = () => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
		toggleFormDetails(true);
	};

	const onSignAgreement = () => {
		const values = form.getValues();
		if (values) createContract(values);
	};

	useEffect(() => {
		getEntities();
		getRoles();
		getOrgLevels();
	}, [getEntities, getRoles, getOrgLevels]);

	const onSetLevel = (event: { level: TablesInsert<'employee_levels'>; isOrgs: boolean } | undefined) => {
		setActiveLevel(event);
		toggleShowFixedIncome(() => !!form.getValues('fixed_allowance')?.length);
		toggleShowSigningBonus(() => !!form.getValues('signing_bonus')?.length);
		form.setValue('salary', String(event?.level.min_salary));
		form.setValue('signing_bonus', event?.level.min_signing_bonus ? String(event?.level.min_signing_bonus) : undefined);
		form.setValue('fixed_allowance', event?.level.fixed_allowance ? (event?.level.fixed_allowance as any) : undefined);
	};

	const onSelectRole = (roleId: string) => {
		const role: Tables<'open_roles'> = roles.find(role => role.id == Number(roleId)) as Tables<'open_roles'>;
		form.setValue('job_title', role.job_title);
		form.setValue('responsibilities', role.responsibilities as string[]);
		form.setValue('employment_type', role.employment_type);
		form.setValue('salary', String(role.salary));
		form.setValue('signing_bonus', String(role.signing_bonus));
		form.setValue('fixed_allowance', role.fixed_allowance as any);
		form.setValue('additional_offerings', role.additional_offerings as any);
		form.setValue('work_location', role.work_location as any);
		form.setValue('work_schedule', role.work_schedule as string);
		form.setValue('work_shedule_interval', role.work_shedule_interval as string);
		form.setValue('probation_period', role.probation_period as number);
		form.setValue('paid_leave', role.paid_leave as number);
		form.setValue('sick_leave', role.sick_leave as number);
		form.setValue('years_of_experience', role.years_of_experience as number);

		form.setValue('level', String(role.level));
		const activeLevel = orgJobLevels.find(level => level.id === role.level);
		setActiveLevel({ isOrgs: true, level: activeLevel });
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
			<NewRoleDialog isAlertOpen={showNewRoleDialog} toggleDialog={toggleNewRoleDialog} roleId={newRoleId} />

			{showFormDetails && (
				<ContractDetails
					isSubmiting={isSubmiting}
					formType={formType}
					update={!!contractData}
					openBenefitsDialog={toggleBenefitsDialog}
					openCompensationDialog={toggleCompensationDialog}
					nationality={employeeNationality}
					back={toggleFormDetails}
					submit={onSubmit}
					level={selectedLevel?.level}
					data={form.getValues()}
					openScheduleDialog={toggleScheduleDialog}
				/>
			)}

			<CompensationDialog updateOrgJobLevels={updateOrgJobLevels} isDialogOpen={showCompensationDialog} openDialog={toggleCompensationDialog} selectedLevelId={form.getValues('level') || ''} orgJobLevels={orgJobLevels} setLevelDetails={onSetLevel} form={form} />

			{showBenefitsDialog && <AdditionalOfferingDialog orgBenefits={orgBenefits?.additional_offerings as string[]} isDialogOpen={showBenefitsDialog} openDialog={toggleBenefitsDialog} form={form} />}

			{showScheduleDialog && <JobScheduleDialog isDialogOpen={showScheduleDialog} openDialog={toggleScheduleDialog} form={form} />}

			{!showFormDetails && (
				<Form {...form}>
					<form className="grid w-full gap-6" onSubmit={form.handleSubmit(reviewFormDetails)}>
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

										{formType == 'contract' && <SelectCountry onSelectCountry={setEmployeeNationality} name="nationality" label="Country" form={form} disabled={!!contractData} />}
									</div>
								</div>
							</div>
						)}

						{/* employment details */}
						<div className="grid grid-cols-2 border-t border-t-border pt-10">
							<div>
								<h2 className="font-semibold">Role details</h2>
								<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">This should be the public name of your entire organisation. This is mostly an organisation identifier.</p>
							</div>

							<div className="mb-10 grid gap-8">
								{formType == 'contract' && (
									<div className="mb-1 flex items-center justify-between space-x-2 rounded-lg bg-accent p-2">
										<Label htmlFor="existing-role">Use existing role details</Label>
										<Switch checked={showRolesOption} onCheckedChange={toggleRoleOption} id="existing-role" className="scale-75" />
									</div>
								)}

								{formType == 'contract' && showRolesOption && (
									<FormField
										control={form.control}
										name="role"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Role</FormLabel>
												<Select
													onValueChange={value => {
														field.onChange(value);
														onSelectRole(value);
													}}
													defaultValue={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select an existing role" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{roles.map(role => (
															<SelectItem key={role.id} value={String(role.id)}>
																{role.job_title}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormDescription>
													You will be able to review and edit role details before sending contract{form.getValues('first_name') ? ' to ' + form.getValues('first_name') : ''}.{' '}
													<Link href={'../open-roles'} className="inline-flex w-fit items-center gap-1 rounded-md bg-accent px-1">
														Manage roles <ArrowUpRight size={12} />
													</Link>
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
								)}

								<div className={cn(formType == 'role' || !showRolesOption ? '' : 'pointer-events-none absolute opacity-0', 'mb-10 grid gap-8')}>
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

									<SelectLevel updateOrgJobLevels={updateOrgJobLevels} orgJobLevels={orgJobLevels} form={form} selectedLevelId={form.getValues('level') || ''} setLevelDetails={onSetLevel} />

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

									<JobResponsibilities form={form} />
								</div>
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
												<div className="relative h-fit w-full">
													<FormControl>
														<Input type="number" placeholder="Enter years of experience required" {...field} onChange={event => form.setValue('years_of_experience', Number(event.target.value))} />
													</FormControl>
													<div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-thin text-foreground">years</div>
												</div>
												<FormMessage />
											</FormItem>
										)}
									/>

									<JobRequirements form={form} />
								</div>
							</div>
						)}

						{/* job schedule */}
						{formType === 'contract' && (
							<div className="grid grid-cols-2 border-t border-t-border pt-10">
								<div>
									<h2 className="font-semibold">Job Schedule</h2>
									<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">This should be the public name of your entire organisation. This is mostly an organisation identifier.</p>
								</div>

								<div className="mb-10 grid gap-8">
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
															<Switch
																checked={indefiniteEndDate}
																onCheckedChange={event => {
																	toggleIndefiniteEndDate(event);
																	if (event == true) form.setValue('end_date', undefined);
																}}
																id="indefinite"
																className="scale-75"
															/>
														</div>

														<div className={cn(!indefiniteEndDate ? '' : 'pointer-events-none absolute opacity-0')}>
															<DatePicker onSetDate={field.onChange} selected={field.value} />
														</div>
													</div>
													<FormMessage />
												</FormItem>
											)}
										/>
									</>
								</div>
							</div>
						)}

						{/* location */}
						{!showRolesOption && (
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
						)}

						<div className="flex items-center justify-end border-t border-t-border pt-10">
							<Button disabled={isSubmiting} type="submit" size={'sm'} className="gap-3 px-6 text-sm font-light">
								Review details
							</Button>
						</div>
					</form>
				</Form>
			)}
		</>
	);
};
