import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/server';
import { format, isPast } from 'date-fns';
import { Copy, EllipsisVertical, FilePenLine, InfoIcon } from 'lucide-react';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { TablesUpdate } from '@/type/database.types';
import { SignatureDrawer } from './signature-drawer';
import { redirect } from 'next/navigation';
import { ScheduleTermination } from './schedule-termination';
import { TerminateContract } from './terminate-contract';
import { BackButton } from '@/components/ui/back-button';
import { doesUserHaveAdequatePermissions } from '@/utils/api';
import { sendEmail } from '@/api/email';
import { TerminateContractEmail } from '@/components/emails/terminated-contract-email';
import { ScheduleTerminationContractEmail } from '@/components/emails/schedule-terminate-contract-email';
import { ContractStatus } from '@/components/ui/status-badge';
import { Details } from '@/components/ui/details';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContractOverview } from './contract-overview';
import { Profile } from './profile';
import { Teams } from './teams';
import { Timeoff } from './time-off';
import { Applicants } from './applicants';
import { Boardings } from './boarding';
import { BoardingsReview } from './boarding-review';
import { EmployeeAppraisals } from './contract-appraisals';
import { ResendInviteButton } from './resend-invite-button';

export const Contract = async ({ org, id, signatureType }: { org: string; id: string; signatureType: 'profile' | 'org' }) => {
	const supabase = createClient();
	const { data, error } = await supabase
		.from('contracts')
		.select(
			`*, org:organisations!contracts_org_fkey(id, name, subdomain),
            level:employee_levels!contracts_level_fkey(level, role),
            entity:legal_entities!contracts_entity_fkey(incorporation_country:countries!legal_entities_incorporation_country_fkey(currency_code, name), address_state, street_address, address_code),
            profile:profiles!contracts_profile_fkey(*, nationality:countries!profiles_nationality_fkey(*)),
            signed_by:profiles!contracts_signed_by_fkey(first_name, last_name, email),
            terminated_by:profiles!contracts_terminated_by_fkey(first_name, last_name, email),
            team:teams!contracts_team_fkey(id, name)`
		)
		.match({ org, id })
		.single();

	if (error) {
		return (
			<div>
				<p className="text-center text-xs text-muted-foreground">Unable to fetch contract details. Please refresh page</p>
				<p className="mx-auto mt-3 w-fit rounded-sm bg-accent p-1 text-center text-xs font-thin text-muted-foreground">{error.message}</p>
			</div>
		);
	}

	const manager = (await supabase.from('managers').select().match({ org, person: id, team: data.team?.id })).data;

	const signContract = async (payload: FormData): Promise<string> => {
		'use server';
		const supabase = createClient();

		const {
			data: { user },
			error: authError
		} = await supabase.auth.getUser();
		if (authError) return authError.message;
		if (!user) return 'User auth not found';

		const signatureString = payload.get('signature-string') as string;
		let signatureDetails: TablesUpdate<'contracts'>;
		if (signatureType === 'org') {
			const { data, error } = await supabase.from('profiles_roles').select().match({ organisation: org, profile: user.id });
			if (error || !data.length) return `You do not have adequate org permission to execute contracts`;

			signatureDetails = { org_signed: new Date() as any, signed_by: user.id, org_signature_string: signatureString };
			const { error: contractError } = await supabase.from('contracts').update(signatureDetails).match({ org, id });

			if (contractError) return contractError.message;
			return redirect(`/${org}/people/${id}`);
		}

		const { data, error } = await supabase.from('contracts').select().match({ org, profile: user.id, id });
		if (error || !data.length) return `You do not have adequate permission to execute contracts`;

		signatureDetails = { profile_signed: new Date() as any, profile_signature_string: signatureString };
		const { error: contractError } = await supabase.from('contracts').update(signatureDetails).match({ org, id });

		if (contractError) return contractError.message;
		return redirect(`/employee/${org}/${id}`);
	};

	const sendTerminationScheduleEmail = async (endDate: string) => {
		'use server';

		if (!data.profile) return;

		await sendEmail({
			from: 'Aveer.hr <contract@notification.aveer.hr>',
			to: [data.profile?.email],
			subject: `Contract terminated`,
			react: <ScheduleTerminationContractEmail orgName={data.org?.name} endDate={endDate} />
		});

		return;
	};

	const scheduleTermination = async (date: Date): Promise<string> => {
		'use server';
		if (!date) return 'Termination date not provided';
		const supabase = createClient();

		const hasPermission = await doesUserHaveAdequatePermissions({ orgId: org });
		if (hasPermission !== true) return hasPermission;

		const {
			data: { user }
		} = await supabase.auth.getUser();

		const { error: contractError } = await supabase
			.from('contracts')
			.update({ terminated_by: user?.id, end_date: date as any, status: 'scheduled termination' })
			.match({ org, id });
		if (contractError) return contractError.message;

		sendTerminationScheduleEmail(date as any);
		return redirect(`/${org}/people/${id}`);
	};

	const sendTerminationEmail = async () => {
		'use server';

		if (!data.profile) return;

		await sendEmail({
			from: 'Aveer.hr <contract@notification.aveer.hr>',
			to: [data.profile?.email],
			subject: `Contract terminated`,
			react: <TerminateContractEmail orgName={data.org?.name} />
		});

		return;
	};

	const terminateContract = async (): Promise<string> => {
		'use server';
		const supabase = createClient();

		const hasPermission = await doesUserHaveAdequatePermissions({ orgId: org });
		if (hasPermission !== true) return hasPermission;

		const {
			data: { user }
		} = await supabase.auth.getUser();

		const { error: contractError } = await supabase
			.from('contracts')
			.update({ terminated_by: user?.id, end_date: new Date() as any, status: 'terminated' })
			.match({ org, id });
		if (contractError) return contractError.message;

		sendTerminationEmail();
		return redirect(`/${org}/people/${id}`);
	};

	const deleteContract = async (): Promise<string> => {
		'use server';
		const supabase = createClient();

		const {
			data: { user },
			error: authError
		} = await supabase.auth.getUser();
		if (authError) return authError.message;
		if (!user) return 'User auth not found';

		const { data, error } = await supabase.from('profiles_roles').select().match({ organisation: org, profile: user.id });
		if (error || !data.length) return `You do not have adequate org permission to terminate contracts`;

		const { error: contractError } = await supabase.from('contracts').delete().match({ org, id });
		if (contractError) return contractError.message;
		return redirect(`/${org}`);
	};

	return (
		<div className="container max-w-4xl space-y-10 px-0 pb-6 pt-0">
			<div className="relative">
				<BackButton className="mb-6" />

				<div className="flex items-center justify-between">
					<h1 className="flex items-center gap-4 text-2xl font-bold">{data?.job_title}</h1>

					<div className="fixed bottom-0 left-0 flex w-full justify-between gap-3 border-t bg-background p-4 sm:relative sm:w-fit sm:border-t-0 sm:p-0">
						{data.profile && (
							<>
								{((signatureType === 'org' && !data.org_signed) || (signatureType === 'profile' && !data.profile_signed)) && <SignatureDrawer first_name={data.profile.first_name} job_title={data.job_title} signatureAction={signContract} />}

								{signatureType === 'org' && (
									<Popover>
										<PopoverTrigger asChild>
											<Button variant="secondary" size={'sm'} className="w-9">
												<EllipsisVertical size={14} />
											</Button>
										</PopoverTrigger>

										<PopoverContent align="end" className="w-48 p-2">
											{(data.status == 'awaiting signatures' || data.status == 'awaiting signature') && <ResendInviteButton email={data.profile.email} last_name={data.profile.last_name} first_name={data.profile.first_name} org={org} />}

											{data.status !== 'inactive' && data.status !== 'terminated' && (
												<Link href={`./${id}/edit`} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-full justify-start gap-3')}>
													<FilePenLine size={12} />
													Edit Contract
												</Link>
											)}

											<Link href={`./new?duplicate=${id}`} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-full justify-start gap-3')}>
												<Copy size={12} />
												Duplicate
											</Link>

											{data.status !== 'terminated' && data.status !== 'inactive' && (
												<TerminateContract first_name={data.profile.first_name} job_title={data.job_title} deleteContract={deleteContract} terminateContract={terminateContract} action={data.status === 'signed' ? 'terminate' : 'delete'} />
											)}

											{data.status === 'signed' && <ScheduleTermination first_name={data.profile.first_name} job_title={data.job_title} formAction={scheduleTermination} />}
										</PopoverContent>
									</Popover>
								)}
							</>
						)}
					</div>
				</div>

				<div className="mt-4 flex items-center gap-3 text-xs font-light">
					<ContractStatus state={data.status} start_date={data.start_date || ''} end_date={data?.end_date} />•
					{data?.status == 'scheduled termination' && data?.end_date && (
						<>
							<Badge className="h-fit gap-3 py-1 text-xs font-light" variant={data?.status.includes('term') ? 'secondary-destructive' : 'secondary'}>
								{format(data?.end_date, 'PP')}
							</Badge>
							•
						</>
					)}
					<span className="capitalize">{data?.org?.name}</span> • <span className="capitalize">{data?.employment_type}</span>
				</div>
			</div>

			<Tabs defaultValue={data.profile_signed && data.org_signed ? 'overview' : 'contract'} className="space-y-6">
				{data.profile_signed && data.org_signed && (
					<div className="no-scrollbar flex items-center overflow-x-auto">
						<TabsList className={cn('flex')}>
							<TabsTrigger value="overview">Overview</TabsTrigger>
							<TabsTrigger value="profile">Profile</TabsTrigger>
							{data.team && (!data.terminated_by || (data.end_date && !isPast(data.end_date))) && <TabsTrigger value="team">Team</TabsTrigger>}
							{signatureType == 'profile' && (!data.terminated_by || (data.end_date && !isPast(data.end_date))) && <TabsTrigger value="requests">Requests</TabsTrigger>}
							<TabsTrigger value="contract">Contract</TabsTrigger>
							<TabsTrigger value="appraisal">Appraisal</TabsTrigger>
							<TabsTrigger value="onboarding">Boarding</TabsTrigger>
						</TabsList>
					</div>
				)}

				<TabsContent value="overview">
					<ContractOverview reviewType={manager?.length ? 'manager' : 'employee'} data={data as any} />
				</TabsContent>

				<TabsContent value="onboarding">
					<Boardings contract={data} org={org} onboardingId={data.onboarding} offboardingId={data.offboarding} reviewType={signatureType == 'org' ? 'admin' : manager?.length ? 'manager' : 'employee'} />
				</TabsContent>

				<TabsContent value="profile">
					<Profile type={signatureType} data={data.profile as any} />
				</TabsContent>

				{signatureType == 'profile' && (!data.terminated_by || (data.end_date && !isPast(data.end_date))) && (
					<TabsContent value="requests">
						<Timeoff manager={manager && manager[0]} reviewType={manager?.length ? 'manager' : 'employee'} contract={data} org={org} team={data?.team?.id} />

						<Applicants contract={data as any} org={org} manager={manager && manager[0]} />

						<BoardingsReview manager={manager && manager[0]} contract={data} org={org} />
					</TabsContent>
				)}

				<TabsContent value="team">
					{data.team && (!data.terminated_by || (data.end_date && !isPast(data.end_date))) && <Teams isManager={!!manager?.length} currentUser={signatureType} name={data.team.name} contractId={data.id} org={org} team={data.team.id} />}
				</TabsContent>

				<TabsContent value="appraisal">
					<EmployeeAppraisals formType={'employee'} role={signatureType == 'profile' ? 'employee' : 'admin'} org={org} contract={data} group={'employee'} />
				</TabsContent>

				<TabsContent value="contract">
					<section className="grid gap-14">
						{signatureType === 'profile' && (
							<div className="-mb-6 flex w-fit items-center gap-3 rounded-sm border border-accent bg-accent px-3 py-2 text-xs font-thin">
								<InfoIcon size={12} />
								{`You can not edit your contract details. You'd need to reachout to your contact or manager to request an edit/change`}
							</div>
						)}

						<Details formType="contract" data={data} isManager={!!(manager && manager?.length > 0)} />
					</section>
				</TabsContent>
			</Tabs>
		</div>
	);
};
