import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/server';
import { format } from 'date-fns';
import { Copy, EllipsisVertical, FilePenLine } from 'lucide-react';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { SignatureDrawer } from './signature/signature-drawer';
import { redirect } from 'next/navigation';
import { ScheduleTermination } from './schedule-termination';
import { TerminateContract } from './terminate-contract';
import { BackButton } from '@/components/ui/back-button';
import { doesUserHaveAdequatePermissions } from '@/utils/api';
import { sendEmail } from '@/api/email';
import { TerminateContractEmail } from '@/components/emails/terminated-contract-email';
import { ScheduleTerminationContractEmail } from '@/components/emails/schedule-terminate-contract-email';
import { ContractStatus } from '@/components/ui/status-badge';
import { ResendInviteButton } from './resend-invite-button';
import { EmployeeTabs } from './employee-tabs';

export const Contract = async ({ org, id, signatureType }: { org: string; id: string; signatureType: 'profile' | 'org' }) => {
	const supabase = await createClient();
	const [{ data, error }, { data: orgSettings }] = await Promise.all([
		supabase
			.from('contracts')
			.select(
				`*, org:organisations!contracts_org_fkey(id, name, subdomain),
                level:employee_levels!contracts_level_fkey(level, role),
                entity:legal_entities!contracts_entity_fkey(incorporation_country:countries!legal_entities_incorporation_country_fkey(currency_code, name), address_state, street_address, address_code),
                profile:profiles!contracts_profile_fkey(*, nationality:countries!profiles_nationality_fkey(*)),
                signed_by:profiles!contracts_signed_by_fkey(first_name, last_name, email),
                terminated_by:profiles!contracts_terminated_by_fkey(first_name, last_name, email),
                team:teams!contracts_team_fkey(id, name),
                direct_report(job_title, id, profile(first_name, last_name))`
			)
			.match({ org, id })
			.single(),

		supabase.from('org_settings').select().match({ org })
	]);

	if (error) {
		return (
			<div>
				<p className="text-center text-xs text-muted-foreground">Unable to fetch contract details. Please refresh page</p>
				<p className="mx-auto mt-3 w-fit rounded-sm bg-accent p-1 text-center text-xs font-thin text-muted-foreground">{error.message}</p>
			</div>
		);
	}

	const manager = (await supabase.from('managers').select().match({ org, person: id, team: data.team?.id })).data;

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

	const scheduleTermination = async (_prev: any, date: Date): Promise<string> => {
		'use server';
		if (!date) return 'Termination date not provided';
		const supabase = await createClient();

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
		const supabase = await createClient();

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
		const supabase = await createClient();

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
					<div className="space-y-2">
						<h1 className="text-2xl font-bold">
							{data?.profile?.first_name} {data?.profile?.last_name}
						</h1>

						<p className="text-sm text-support">{data?.job_title}</p>
					</div>

					<div className="fixed bottom-0 left-0 flex w-full justify-between gap-3 border-t bg-background p-4 sm:relative sm:w-fit sm:border-t-0 sm:p-0">
						{data.profile && (
							<>
								{((signatureType === 'org' && !data.org_signed) || (signatureType === 'profile' && !data.profile_signed)) && (
									<SignatureDrawer org={org} id={Number(id)} signatureType={signatureType} first_name={data.profile.first_name} job_title={data.job_title} />
								)}

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

											{data.status === 'signed' && <ScheduleTermination first_name={data.profile.first_name} job_title={data.job_title} serverAction={scheduleTermination} />}
										</PopoverContent>
									</Popover>
								)}
							</>
						)}
					</div>
				</div>

				<div className="mt-4 flex items-center gap-3 text-xs font-light">
					<ContractStatus state={data.status} start_date={data.start_date || ''} probation_days={orgSettings?.[0]?.probation} end_date={data?.end_date} />•
					{data?.status == 'scheduled termination' && data?.end_date && (
						<>
							<Badge className="h-fit gap-3 py-1 text-xs font-light" variant={data?.status.includes('term') ? 'secondary-destructive' : 'secondary'}>
								{format(data?.end_date, 'PP')}
							</Badge>
							•
						</>
					)}
					{data?.team && (
						<>
							<span className="capitalize">{data?.team?.name}</span> •
						</>
					)}{' '}
					<span className="capitalize">{data?.employment_type}</span>
				</div>
			</div>

			<EmployeeTabs data={data} orgSettings={orgSettings} signatureType={signatureType} manager={manager} org={org} />
		</div>
	);
};
