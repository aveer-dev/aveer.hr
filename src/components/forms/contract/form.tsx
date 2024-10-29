'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
import { inviteUser, updateContract } from './invite-user.action';
import { EORAgreementDrawer } from '@/components/eor/eor-agreement';
import { createEORAgreement, doesUserHaveAdequatePermissions, getEORAgreementByCountry } from '@/utils/api';
import { NewContractDialog } from './new-contract-dialog';
import { SelectLegalEntity } from '@/components/forms/legal-entity';
import { SelectLevel } from '@/components/forms/level-option';
import { JobResponsibilities } from '@/components/forms/job-responsibilities';
import { JobRequirements } from '@/components/forms/job-requirements';
import { createOpenRole, updateRole } from './role.action';
import { NewRoleDialog } from './new-role-dialog';
import { ArrowUpRight, Info, PanelRightOpen } from 'lucide-react';
import Link from 'next/link';
import { ContractDetails } from './contract-details';
import { cn } from '@/lib/utils';
import { FormSection, FormSectionDescription, InputsContainer } from '../form-section';
import { CustomFields } from './custom-fields';
import { PayInput } from '../pay-input';
import { FixedAllowance } from '../fixed-allowance';
import { AdditionalOffering } from '../additional-offering';
import { Team } from '@/components/team/team';
import { ApprovalPolicy } from '@/components/approval-policies/approval-policy';
import { NavLink } from '@/components/ui/link';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loader';
import { PostgrestSingleResponse } from '@supabase/supabase-js';

const supabase = createClient();

type ENTITY = Tables<'legal_entities'> & {
	incorporation_country: {
		currency_code: string;
		name: string;
	};
};

interface props {
	orgBenefits?: Tables<'org_settings'> | null;
	contractData?: TablesUpdate<'contracts'>;
	openRoleData?: TablesUpdate<'open_roles'>;
	formType?: 'role' | 'contract';
	entitiesData: { eorEntities: ENTITY[] | null; entities: ENTITY[] | null };
	levels: PostgrestSingleResponse<Tables<'employee_levels'>[]>;
	teamsData: PostgrestSingleResponse<Tables<'teams'>[]>;
	rolesData?: PostgrestSingleResponse<Tables<'open_roles'>[]>;
	manager?: PostgrestSingleResponse<Tables<'managers'>[]>;
	policiesData?: PostgrestSingleResponse<Tables<'approval_policies'>[]>;
	employeesData?: PostgrestSingleResponse<Tables<'contracts'>[]>;
}

export const ContractForm = ({ employeesData, contractData, openRoleData, orgBenefits, levels, formType = 'contract', entitiesData, teamsData, rolesData, manager, policiesData }: props) => {
	const [entities] = useState<ENTITY[]>(entitiesData?.entities ? entitiesData.entities : []);
	const [entityCurrency, setCurrency] = useState('');
	const [roles] = useState<Tables<'open_roles'>[]>(rolesData?.data ?? []);
	const [orgJobLevels] = useState<TablesInsert<'employee_levels'>[]>(levels.data ?? []);
	const [eorEntities] = useState<Tables<'legal_entities'>[]>(entitiesData?.eorEntities ? entitiesData.eorEntities : []);
	const [employees] = useState<Tables<'contracts'>[]>(employeesData?.data ? employeesData.data : []);
	const [showSigningBonus, toggleShowSigningBonus] = useState(!!contractData?.signing_bonus || !!openRoleData?.signing_bonus);
	const [showFixedIncome, toggleShowFixedIncome] = useState(!!contractData?.fixed_allowance || !!openRoleData?.fixed_allowance);
	const [indefiniteEndDate, toggleIndefiniteEndDate] = useState(!contractData?.end_date);
	const [isSubmiting, toggleSubmitState] = useState(false);
	const params = useParams<{ org: string }>();
	const [isAlertOpen, toggleAgreementDialog] = useState(false);
	const [agreementId, setAgreementId] = useState<number>();
	const [isNewContractDialogOpen, toggleNewContractDialog] = useState(false);
	const [showNewRoleDialog, toggleNewRoleDialog] = useState(false);
	const [newContractId, setNewContractId] = useState(0);
	const [newRoleId, setNewRoleId] = useState(0);
	const [showRolesOption, toggleRoleOption] = useState(formType == 'contract' ? !!contractData?.role : false);
	const [showFormDetails, toggleFormDetails] = useState(false);
	const [isManager, toggleManagerState] = useState(openRoleData ? !!openRoleData?.is_manager : false);
	const [teams, updateTeam] = useState<Tables<'teams'>[]>(teamsData.data ?? []);
	const [policies, setPolicies] = useState<Tables<'approval_policies'>[]>(policiesData?.data ?? []);
	const [selectedLevel, setActiveLevel] = useState<TablesInsert<'employee_levels'>>();
	const [showAdditionalOffering, toggleAdditionalOffering] = useState(!!contractData?.additional_offerings?.length || !!openRoleData?.additional_offerings?.length || !!orgBenefits?.additional_offerings?.length);
	const [showManualSystem, setManualSystem] = useState(!(contractData?.level || openRoleData?.level));

	const formSchema = z.object({
		first_name: formType == 'contract' ? z.string() : z.string().optional(),
		last_name: formType == 'contract' ? z.string() : z.string().optional(),
		email: formType == 'contract' ? z.string().email() : z.string().email().optional(),
		job_title: showRolesOption ? z.string().optional() : z.string().min(1),
		level: z.string().optional(),
		level_name: z.string().optional(),
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
		manager: z.boolean().optional(),
		department: z.string().optional(),
		role: showRolesOption ? z.string() : z.string().optional(),
		customFields: z.array(z.string()),
		team: z.string().optional(),
		policy: z.string().optional(),
		direct_report: z.string().optional()
	});

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			first_name: formType == 'contract' ? (contractData?.profile as any)?.first_name || '' : undefined,
			last_name: formType == 'contract' ? (contractData?.profile as any)?.last_name || '' : undefined,
			email: formType == 'contract' ? (contractData?.profile as any)?.email || '' : undefined,
			level_name: contractData?.level_name || '',
			additional_offerings: (contractData?.additional_offerings as string[]) || (openRoleData?.additional_offerings as string[]) || (orgBenefits?.additional_offerings as string[]) || [],
			responsibilities: (contractData?.responsibilities as string[]) || (openRoleData?.responsibilities as string[]) || [],
			fixed_allowance: (contractData?.fixed_allowance as any) || (openRoleData?.fixed_allowance as any) || [],
			start_date: contractData?.start_date ? new Date(contractData?.start_date) : new Date(),
			end_date: contractData?.end_date ? new Date(contractData?.end_date) : undefined,
			probation_period: contractData?.probation_period || openRoleData?.probation_period || orgBenefits?.probation || 90,
			paid_leave: contractData?.paid_leave || openRoleData?.paid_leave || orgBenefits?.paid_time_off || 20,
			sick_leave: contractData?.sick_leave || openRoleData?.sick_leave || orgBenefits?.sick_leave || 20,
			work_schedule: contractData?.work_schedule || openRoleData?.work_schedule || orgBenefits?.work_schedule || '8',
			work_shedule_interval: contractData?.work_shedule_interval || openRoleData?.work_shedule_interval || orgBenefits?.work_shedule_interval || 'daily',
			salary: formType == 'contract' ? (contractData?.salary ? String(contractData?.salary) : '') : openRoleData?.salary ? String(openRoleData?.salary) : '',
			signing_bonus: formType == 'contract' ? (contractData?.signing_bonus ? String(contractData?.signing_bonus) : undefined) : openRoleData?.signing_bonus ? String(openRoleData?.signing_bonus) : undefined,
			employment_type: contractData?.employment_type || openRoleData?.employment_type || undefined,
			job_title: contractData?.job_title || openRoleData?.job_title || '',
			entity: formType == 'contract' ? (contractData?.entity ? String(contractData?.entity) : entities?.length ? String(entities[0].id) : undefined) : openRoleData?.entity ? String(openRoleData?.entity) : entities?.length ? String(entities[0].id) : undefined,
			level: formType == 'contract' ? (contractData?.level ? String(contractData?.level) : undefined) : openRoleData?.level ? String(openRoleData?.level) : undefined,
			work_location: contractData?.work_location || openRoleData?.work_location || undefined,
			requirements: (openRoleData?.requirements as string[]) || [],
			years_of_experience: openRoleData?.years_of_experience || Number(''),
			customFields: [],
			team: String(contractData?.team || openRoleData?.team || ''),
			manager: formType == 'contract' ? (manager?.data ? !!manager?.data[0] : false) : openRoleData?.is_manager,
			policy: String(openRoleData?.policy || policies[0]?.id),
			direct_report: formType == 'contract' ? (contractData?.direct_report ? String(contractData?.direct_report) : '') : openRoleData?.direct_report ? String(openRoleData?.direct_report) : '',
			role: contractData?.role ? String(contractData?.role) : undefined
		}
	});

	const isEntityEOR = async (entityId: number) => {
		const entity = eorEntities.find(entity => entity.id === Number(entityId));
		return entity;
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
			level: form.getValues('level') ? Number(form.getValues('level')) : null,
			level_name: values.level_name,
			responsibilities: values.responsibilities,
			requirements: values.requirements,
			entity: Number(values.entity),
			org: params.org,
			work_location: values.work_location,
			years_of_experience: values.years_of_experience,
			state: 'closed',
			additional_offerings: values.additional_offerings,
			custom_fields: values.customFields,
			team: values.team ? Number(values.team) : null,
			is_manager: isManager,
			policy: Number(values.policy),
			direct_report: values.direct_report ? Number(values.direct_report) : null
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
			email: values.email as string,
			id: contractData ? (contractData?.profile as any).id : ''
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
			level: form.getValues('level') ? Number(form.getValues('level')) : null,
			level_name: values.level_name,
			responsibilities: values.responsibilities,
			profile: contractData ? (contractData?.profile as any).id : '',
			entity: Number(values.entity),
			org: params.org,
			role: values.role ? Number(values.role) : null,
			work_location: values.work_location,
			additional_offerings: values.additional_offerings,
			team: values.team ? Number(values.team) : null,
			direct_report: values.direct_report ? Number(values.direct_report) : null
		};

		if (showSigningBonus) contract.signing_bonus = Number(values.signing_bonus);
		if (showFixedIncome) contract.fixed_allowance = values.fixed_allowance;
		if (!indefiniteEndDate) contract.end_date = values.end_date as any;

		const responseMessage = contractData ? await updateContract(JSON.stringify(contract)) : await inviteUser(JSON.stringify(contract), JSON.stringify(profile), isManager);

		toggleSubmitState(false);
		if (responseMessage == 'update') return toast.success('Contract details updated successfully');
		if (typeof responseMessage == 'number') {
			setNewContractId(responseMessage);
			return toggleNewContractDialog(true);
		}
		if (responseMessage) return toast.error(responseMessage);
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
		if (entityData?.is_eor !== true) return formType === 'contract' ? createEmployeeContract(values) : createRole(values);

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
		return formType === 'contract' ? createEmployeeContract(values) : createRole(values);
	};

	const reviewFormDetails = () => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
		toggleFormDetails(true);
	};

	const onSignAgreement = () => {
		const values = form.getValues();
		if (values) return formType === 'contract' ? createEmployeeContract(values) : createRole(values);
	};

	useEffect(() => {
		if (manager?.data?.length) {
			toggleManagerState(true);
			form.setValue('manager', true);
		}

		if (entities.length) setCurrency(() => entities.find(ent => (contractData ? ent.id == contractData?.entity : openRoleData ? ent.id == openRoleData?.entity : entities[0].id))?.incorporation_country.currency_code || '');
	}, [contractData, entities, form, manager?.data, openRoleData]);

	const onSetLevel = (level: TablesInsert<'employee_levels'> | undefined) => {
		setActiveLevel(level);
		form.setValue('salary', String(level?.min_salary));
		form.setValue('signing_bonus', level?.min_signing_bonus ? String(level?.min_signing_bonus) : undefined);
		form.setValue('fixed_allowance', level?.fixed_allowance ? (level?.fixed_allowance as any) : undefined);

		toggleShowFixedIncome(() => !!form.getValues('fixed_allowance')?.length);
		toggleShowSigningBonus(() => !!form.getValues('signing_bonus')?.length);
	};

	const onSelectRole = (roleId: string) => {
		const role: Tables<'open_roles'> = roles.find(role => role.id == Number(roleId)) as Tables<'open_roles'>;

		form.setValue('job_title', role?.job_title || '');
		form.setValue('responsibilities', (role?.responsibilities as string[]) || []);
		form.setValue('employment_type', role?.employment_type || '');
		form.setValue('salary', role?.salary ? String(role.salary) : '');
		form.setValue('signing_bonus', role?.signing_bonus ? String(role.signing_bonus) : '');
		form.setValue('fixed_allowance', (role?.fixed_allowance as any) || []);
		form.setValue('additional_offerings', (role?.additional_offerings as any) || []);
		form.setValue('work_location', (role?.work_location as any) || '');
		form.setValue('work_schedule', (role?.work_schedule as string) || '');
		form.setValue('work_shedule_interval', (role?.work_shedule_interval as string) || '');
		form.setValue('probation_period', (role?.probation_period as number) || orgBenefits?.probation || 90);
		form.setValue('paid_leave', (role?.paid_leave as number) || orgBenefits?.paid_time_off || 20);
		form.setValue('sick_leave', (role?.sick_leave as number) || orgBenefits?.sick_leave || 20);
		form.setValue('years_of_experience', (role?.years_of_experience as number) || 0);
		form.setValue('team', role?.team ? String(role.team) : '');

		form.setValue('level', role?.level ? String(role.level) : '');
		form.setValue('level_name', role?.level_name ? String(role.level_name) : '');
		const activeLevel = orgJobLevels.find(level => level.id === role.level);
		setActiveLevel(activeLevel);

		toggleShowSigningBonus(!!role?.signing_bonus);
		toggleShowFixedIncome(!!role?.fixed_allowance);
		toggleAdditionalOffering(!!role?.additional_offerings);
	};

	const clearCompensationSection = useCallback(() => {
		form.setValue('salary', '');
		form.setValue('level', '');
		form.setValue('signing_bonus', '');
		form.setValue('fixed_allowance', []);
		form.setValue('additional_offerings', (orgBenefits?.additional_offerings as string[]) || []);

		toggleShowFixedIncome(() => false);
		toggleShowSigningBonus(() => false);

		setActiveLevel(undefined);
	}, [form, orgBenefits?.additional_offerings]);

	const resetForm = () => {
		toggleFormDetails(false);
		form.reset();
		setActiveLevel(undefined);
		window.scrollTo({ top: 0, behavior: 'smooth' });
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

			<NewContractDialog onClose={resetForm} isAlertOpen={isNewContractDialogOpen} toggleDialog={toggleNewContractDialog} contractId={newContractId} />

			<NewRoleDialog onClose={resetForm} isAlertOpen={showNewRoleDialog} toggleDialog={toggleNewRoleDialog} roleId={newRoleId} />

			{showFormDetails && (
				<ContractDetails isManager={isManager} team={teams.find(team => team.id == Number(form.getValues('team')))?.name} formType={formType} back={toggleFormDetails} level={selectedLevel} data={form.getValues()} currency={entityCurrency}>
					<Button onClick={onSubmit} disabled={isSubmiting} type="submit" size={'sm'} className="gap-3 px-6 text-sm font-light">
						{isSubmiting && <LoadingSpinner />}
						{formType == 'contract' && <>{isSubmiting ? (!!contractData ? 'Updating person' : 'Adding person') : !!contractData ? 'Update person' : 'Add person'}</>}
						{formType == 'role' && <>{isSubmiting ? (!!openRoleData ? 'Updating role' : 'Creating role') : !!openRoleData ? 'Update role' : 'Create role'}</>}
					</Button>
				</ContractDetails>
			)}

			{!showFormDetails && (
				<Form {...form}>
					<form className="grid w-full" onSubmit={form.handleSubmit(reviewFormDetails)}>
						{/* entity details */}
						<FormSection>
							<FormSectionDescription>
								<h2 className="font-semibold">Legal entity </h2>
								<p className="mt-3 w-full text-xs font-thin text-muted-foreground md:max-w-72">Aveer allows you to manage employees across your entities around the world. Select which entity this new hire will be under</p>
							</FormSectionDescription>

							<InputsContainer>
								<SelectLegalEntity onSelect={entity => entity.incorporation_country.currency_code && setCurrency(entity.incorporation_country.currency_code)} form={form} entities={entities as any} eorEntities={eorEntities as any} />
							</InputsContainer>
						</FormSection>

						{/* employee details */}
						{formType === 'contract' && (
							<FormSection>
								<FormSectionDescription>
									<h2 className="font-semibold">{contractData ? 'Employee details' : 'Personal details'}</h2>
									<p className="mt-3 w-full text-xs font-thin text-muted-foreground md:max-w-72">This should be the public name of your entire organisation. This is mostly an organisation identifier.</p>
								</FormSectionDescription>

								<InputsContainer>
									<div className="grid grid-cols-2 gap-6">
										<FormField
											control={form.control}
											name="first_name"
											render={({ field }) => (
												<FormItem>
													<FormLabel>First name</FormLabel>
													<FormControl>
														<Input disabled={!!(contractData?.profile as any)?.first_name} type="text" placeholder="Enter first name" {...field} required />
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
														<Input disabled={!!(contractData?.profile as any)?.last_name} type="text" placeholder="Enter last name" {...field} required />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="email"
											render={({ field }) => (
												<FormItem className="col-span-2">
													<FormLabel>Email</FormLabel>
													<FormControl>
														<Input disabled={!!(contractData?.profile as any)?.email} type="email" placeholder="Enter email" {...field} required />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</InputsContainer>
							</FormSection>
						)}

						{/* employment details */}
						<FormSection>
							<FormSectionDescription>
								<h2 className="font-semibold">Role details</h2>
								<p className="mt-3 w-full text-xs font-thin text-muted-foreground md:max-w-72">This should be the public name of your entire organisation. This is mostly an organisation identifier.</p>
							</FormSectionDescription>

							<InputsContainer>
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
												<FormLabel className="flex items-center justify-between">
													Role
													<Link href={'../open-roles'} className="inline-flex w-fit items-center gap-1 rounded-md bg-accent p-1">
														Manage roles <ArrowUpRight size={12} />
													</Link>
												</FormLabel>
												<Select
													onValueChange={(value: string) => {
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
												<FormDescription>You will be able to review and edit role details before sending contract{form.getValues('first_name') ? ' to ' + form.getValues('first_name') : ''}. </FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
								)}

								<div className={cn(formType == 'role' || !showRolesOption ? '' : 'pointer-events-none absolute opacity-0', 'grid gap-8')}>
									{
										<div className="grid grid-cols-2 gap-8">
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
												isManual={showManualSystem}
												setManualSystem={value => {
													setManualSystem(value);
													if (value) clearCompensationSection();
												}}
												orgJobLevels={orgJobLevels}
												form={form}
												selectedLevelId={form.getValues('level') || ''}
												setLevelDetails={onSetLevel}
											/>
										</div>
									}

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
							</InputsContainer>
						</FormSection>

						{/* job requirements */}
						{formType == 'role' && (
							<FormSection>
								<FormSectionDescription>
									<h2 className="font-semibold">Job requirements</h2>
									<p className="mt-3 w-full text-xs font-thin text-muted-foreground md:max-w-72">What are the things, skills or characteristics you expect from your new hire.</p>
								</FormSectionDescription>

								<InputsContainer>
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
								</InputsContainer>
							</FormSection>
						)}

						{/* team */}
						<FormSection>
							<FormSectionDescription>
								<h2 className="font-semibold">Team</h2>
								<p className="mt-3 w-full text-xs font-thin text-muted-foreground md:max-w-72">Will this person work with a team and will the person lead or manage the team in any capacity</p>
							</FormSectionDescription>

							<InputsContainer>
								<FormField
									control={form.control}
									name="team"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="flex items-center justify-between">
												Team
												<Team org={params.org} onCreate={team => team && updateTeam([...teams, team])} className="inline-flex w-fit items-center gap-2 rounded-md bg-accent px-2 py-1">
													Create team <PanelRightOpen size={12} />
												</Team>
											</FormLabel>

											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select an existing team" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{teams.map(team => (
														<SelectItem key={team.id} value={String(team.id)}>
															{team.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormDescription>
												<NavLink org={params.org} target="_blank" href={'/settings?type=org#teams'} className="inline-flex w-fit items-center gap-1 rounded-md bg-accent p-1">
													Manage teams <ArrowUpRight size={12} />
												</NavLink>
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								{!contractData && form.getValues('team') && (
									<div className="mb-1 flex items-center justify-between space-x-2 rounded-lg bg-accent p-2">
										<Label htmlFor="isManager">Is this employee a manager on the team?</Label>
										<Switch checked={isManager} onCheckedChange={toggleManagerState} id="isManager" className="scale-75" />
									</div>
								)}

								<FormField
									control={form.control}
									name="direct_report"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="flex items-center gap-2">
												Direct report
												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger asChild>
															<button>
																<Info size={12} />
															</button>
														</TooltipTrigger>
														<TooltipContent>
															<p>Who will this person report to?</p>
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>
											</FormLabel>

											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select a direct report" />
													</SelectTrigger>
												</FormControl>

												<SelectContent>
													{employees.map(employee => (
														<SelectItem key={employee.id} value={String(employee.id)}>
															{(employee.profile as unknown as Tables<'profiles'>)?.first_name} {(employee.profile as unknown as Tables<'profiles'>)?.first_name} - {employee.job_title}
														</SelectItem>
													))}
												</SelectContent>
											</Select>

											<FormMessage />
										</FormItem>
									)}
								/>
							</InputsContainer>
						</FormSection>

						{/* compensation */}
						<FormSection>
							<FormSectionDescription>
								<h2 className="font-semibold">Compensation</h2>
								<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">This should be the public name of your entire organisation. This is mostly an organisation identifier.</p>
							</FormSectionDescription>

							<InputsContainer>
								<PayInput currency={entityCurrency} form={form} name="salary" label="Gross annual salary" minValue={selectedLevel?.min_salary && Number(selectedLevel?.min_salary)} maxValue={selectedLevel?.max_salary && Number(selectedLevel?.max_salary)} />

								<FormField
									control={form.control}
									name="signing_bonus"
									render={() => (
										<FormItem className="grid w-full gap-3 rounded-lg bg-accent p-2">
											<div className="flex items-center justify-between space-x-2">
												<Label htmlFor="signin-bonus">Add signing bonus</Label>
												<Switch checked={showSigningBonus} onCheckedChange={toggleShowSigningBonus} id="signin-bonus" className="scale-75" />
											</div>

											{showSigningBonus && (
												<PayInput
													currency={entityCurrency}
													form={form}
													name="signing_bonus"
													minValue={selectedLevel?.min_signing_bonus && Number(selectedLevel?.min_signing_bonus)}
													maxValue={selectedLevel?.max_signing_bonus && Number(selectedLevel?.max_signing_bonus)}
												/>
											)}
										</FormItem>
									)}
								/>

								<FixedAllowance currency={entityCurrency} toggle={toggleShowFixedIncome} isToggled={showFixedIncome} form={form} />

								<AdditionalOffering toggle={toggleAdditionalOffering} isToggled={showAdditionalOffering} form={form} />
							</InputsContainer>
						</FormSection>

						{/* job schedule */}
						{formType === 'contract' && (
							<FormSection>
								<FormSectionDescription>
									<h2 className="font-semibold">Job Schedule</h2>
									<p className="mt-3 w-full text-xs font-thin text-muted-foreground md:max-w-72">This should be the public name of your entire organisation. This is mostly an organisation identifier.</p>
								</FormSectionDescription>

								<InputsContainer>
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
															onCheckedChange={(event: boolean) => {
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
								</InputsContainer>
							</FormSection>
						)}

						{/* location */}
						{!showRolesOption && (
							<FormSection>
								<FormSectionDescription>
									<h2 className="font-semibold">Location</h2>
									<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">Where will your new hire be working from: remote, office, or hybrid?</p>
								</FormSectionDescription>

								<InputsContainer>
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
								</InputsContainer>
							</FormSection>
						)}

						{/* policy */}
						{formType === 'role' && (
							<FormSection>
								<FormSectionDescription>
									<h2 className="font-semibold">Review/approval policy</h2>
									<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">This will enable automated flow of candidate review, from one person to the other</p>
								</FormSectionDescription>

								<InputsContainer>
									<FormField
										control={form.control}
										name="policy"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="flex items-center justify-between">
													Policy
													<ApprovalPolicy type="role_application" org={params.org} onCreate={policy => setPolicies([...policies, policy])} className="inline-flex w-fit items-center gap-2 rounded-md bg-accent px-2 py-1">
														Create policy <PanelRightOpen size={12} />
													</ApprovalPolicy>
												</FormLabel>

												<Select onValueChange={field.onChange} defaultValue={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select an existing policy" />
														</SelectTrigger>
													</FormControl>

													<SelectContent>
														{policies.map(policy => (
															<SelectItem key={policy.id} value={String(policy.id)}>
																{policy.name}
																{policy.is_default && (
																	<Badge variant={'outline'} className="ml-2 h-5 text-[10px]">
																		default
																	</Badge>
																)}
															</SelectItem>
														))}
													</SelectContent>
												</Select>

												<FormDescription>
													<NavLink org={params.org} target="_blank" href={'/settings?type=org#poicies'} className="inline-flex w-fit items-center gap-1 rounded-md bg-accent p-1">
														Manage policies <ArrowUpRight size={12} />
													</NavLink>
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
								</InputsContainer>
							</FormSection>
						)}

						{formType == 'role' && <CustomFields updateCustomFields={event => form.setValue('customFields', event)} customFields={form.getValues('customFields') as any} />}

						<div className="flex items-center justify-end border-t border-t-border pt-10">
							{!contractData && !openRoleData && (
								<Button disabled={isSubmiting} type="submit" size={'sm'} className="gap-3 px-6 text-sm font-light">
									Review details
								</Button>
							)}

							{(contractData || openRoleData) && (
								<Button onClick={onSubmit} disabled={isSubmiting} type="submit" size={'sm'} className="gap-3 px-6 text-sm font-light">
									{isSubmiting && <LoadingSpinner />}
									{formType == 'contract' && <>{isSubmiting ? (!!contractData ? 'Updating person' : 'Adding person') : !!contractData ? 'Update person' : 'Add person'}</>}
									{formType == 'role' && <>{isSubmiting ? (!!openRoleData ? 'Updating role' : 'Creating role') : !!openRoleData ? 'Update role' : 'Create role'}</>}
								</Button>
							)}
						</div>
					</form>
				</Form>
			)}
		</>
	);
};
