import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/server';
import { format } from 'date-fns';
import { ChevronLeft, Copy, EllipsisVertical, FilePenLine, InfoIcon } from 'lucide-react';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { TablesUpdate } from '@/type/database.types';
import { SignatureDrawer } from './signature-drawer';
import { redirect } from 'next/navigation';
import { ScheduleTermination } from './schedule-termination';
import { TerminateContract } from './terminate-contract';

export const Contract = async ({ org, id, signatureType }: { org: string; id: string; signatureType: 'profile' | 'org' }) => {
	const supabase = createClient();
	const { data, error } = await supabase
		.from('contracts')
		.select(
			'*, organisations(id, name), entity:legal_entities!contracts_entity_fkey(incorporation_country, address_state, street_address, address_code), profile:profiles!contracts_profile_fkey(first_name, last_name, email, nationality), signed_by:profiles!contracts_signed_by_fkey(first_name, last_name, email), terminated_by:profiles!contracts_terminated_by_fkey(first_name, last_name, email)'
		)
		.match({ org, id })
		.single();

	if (error) {
		return (
			<div>
				<p className="text-center text-xs text-muted-foreground">Unable to fetch contract details. Please refresh page</p>
			</div>
		);
	}

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
		return redirect(`/contractor/${org}/${id}`);
	};

	const scheduleTermination = async (date: Date): Promise<string> => {
		'use server';
		if (!date) return 'Termination date not provided';
		const supabase = createClient();

		const {
			data: { user },
			error: authError
		} = await supabase.auth.getUser();
		if (authError) return authError.message;
		if (!user) return 'User auth not found';

		const { data, error } = await supabase.from('profiles_roles').select().match({ organisation: org, profile: user.id });
		if (error || !data.length) return `You do not have adequate org permission to terminate contracts`;

		const { error: contractError } = await supabase
			.from('contracts')
			.update({ terminated_by: user.id, end_date: date as any, status: 'scheduled termination' })
			.match({ org, id });
		if (contractError) return contractError.message;
		return redirect(`/${org}/people/${id}`);
	};

	const terminateContract = async (): Promise<string> => {
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

		const { error: contractError } = await supabase
			.from('contracts')
			.update({ terminated_by: user.id, end_date: new Date() as any, status: 'terminated' })
			.match({ org, id });
		if (contractError) return contractError.message;
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
		<section className="mx-auto -mt-6 grid max-w-4xl gap-10 p-6 pt-0">
			<div className="flex justify-between">
				<div className="flex gap-8">
					<Link href={`/${signatureType == 'org' ? org : 'contractor'}`} className={cn(buttonVariants({ variant: 'outline', size: 'icon' }), 'rounded-full')}>
						<ChevronLeft size={12} />
					</Link>

					<div className="grid gap-2">
						<h1 className="flex items-center gap-4 text-2xl font-bold">
							{data?.job_title}
							<div className="flex gap-1">
								<Badge className="h-fit gap-2 py-1 text-xs font-light" variant={data?.status.includes('term') ? 'secondary-destructive' : 'secondary'}>
									{data?.status}
								</Badge>
								{data?.status == 'scheduled termination' && data?.end_date && (
									<Badge className="h-fit gap-2 py-1 text-xs font-light" variant={data?.status.includes('term') ? 'secondary-destructive' : 'secondary'}>
										{format(data?.end_date, 'PP')}
									</Badge>
								)}
							</div>
						</h1>
						<p className="flex gap-2 text-xs font-light">
							<span className="capitalize">{data?.organisations?.name}</span> • <span className="capitalize">{data?.employment_type}</span>
						</p>
					</div>
				</div>

				<div className="flex gap-3">
					{data.profile && (
						<>
							{signatureType === 'org' && data.status !== 'inactive' && data.status !== 'terminated' && (
								<Link href={`/${org}/people/${id}/edit`} className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'gap-4')}>
									Edit Contract
									<FilePenLine size={12} />
								</Link>
							)}

							{((signatureType === 'org' && !data.org_signed) || (signatureType === 'profile' && !data.profile_signed)) && <SignatureDrawer first_name={data.profile.first_name} job_title={data.job_title} signatureAction={signContract} />}

							{signatureType === 'org' && (
								<Popover>
									<PopoverTrigger asChild>
										<Button variant="secondary" size={'sm'}>
											<EllipsisVertical size={14} />
										</Button>
									</PopoverTrigger>
									<PopoverContent align="end" className="w-48 p-2">
										<Link href={`/${org}/people/new?duplicate=${id}`} className={cn(buttonVariants({ variant: 'ghost' }), 'w-full justify-start gap-2 focus:!ring-0')}>
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

			{signatureType === 'profile' && (
				<div className="flex w-fit items-center gap-2 rounded-sm border border-accent bg-accent px-3 py-2 text-xs font-thin">
					<InfoIcon size={12} />
					{`You can not edit your contract details. You'd need to reachout to your contact or manager to request an edit/change`}
				</div>
			)}

			<div className="mt-5 grid gap-20">
				<div>
					<h1 className="mb-4 text-xl font-semibold">Parties</h1>
					<ul className="grid grid-cols-2 gap-x-5 gap-y-20 border-t border-t-border pt-6">
						<li>
							<h2 className="text-sm text-muted-foreground">Employer</h2>
							<div className="mt-4 grid gap-2 text-xs font-light">
								<p className="text-xl font-bold">{data?.organisations?.name}</p>
								{!data?.org_signed && <p className="mt-4 text-xs">Pending signature from company</p>}
								{data?.org_signed && (
									<>
										<p>
											{data?.signed_by?.first_name} {data?.signed_by?.last_name}
										</p>
										<p>{data?.signed_by?.email}</p>
										<p>
											{data?.entity.address_code} {data?.entity.street_address}, {data?.entity.address_state}, {data?.entity.incorporation_country}
										</p>
									</>
								)}
							</div>
						</li>

						<li>
							<h2 className="text-sm text-muted-foreground">Employee</h2>

							<div className="mt-4 grid gap-2 text-xs font-light">
								<p className="text-xl font-bold">
									{data?.profile?.first_name} {data?.profile?.last_name}
								</p>

								{!data?.profile_signed && <p className="mt-4 text-xs">Pending your signature</p>}
								{data?.profile_signed && (
									<>
										<p>Individual</p>
										<p>{data?.profile?.email}</p>
										<p>{data?.profile?.nationality}</p>
									</>
								)}
							</div>
						</li>

						{data.terminated_by && (
							<li>
								<h2 className="text-sm text-muted-foreground">Terminated by</h2>

								<div className="mt-4 grid gap-2 text-xs font-light">
									<p className="text-xl font-bold">
										{data?.terminated_by?.first_name} {data?.terminated_by?.last_name}
									</p>
									<p>{data?.terminated_by?.email}</p>
								</div>
							</li>
						)}
					</ul>
				</div>

				<div>
					<h1 className="mb-4 text-xl font-semibold">Employment Details</h1>
					<ul className="grid grid-cols-2 gap-x-5 gap-y-10 border-t border-t-border pt-8">
						<li className="grid gap-2">
							<p className="text-sm font-medium">Job Title</p>
							<p className="text-sm font-light">{data?.job_title}</p>
						</li>
						<li className="grid gap-2">
							<p className="text-sm font-medium">Seniority Level</p>
							<p className="text-sm font-light">{data?.level}</p>
						</li>
						<li className="grid gap-2">
							<p className="text-sm font-medium">Employment Type</p>
							<p className="text-sm font-light">{data?.employment_type}</p>
						</li>
						<li className="grid gap-2">
							<p className="text-sm font-medium">Work Schedule</p>
							<p className="text-sm font-light">
								{data?.work_schedule}hrs, {data?.work_shedule_interval}
							</p>
						</li>
					</ul>

					<div className="mt-10 grid gap-4">
						<h3 className="text-base font-bold">Job Responsibilities</h3>
						<ul className="ml-3 grid list-disc gap-4 text-sm font-light">{(data?.responsibilities as string[])?.map((responsibility, index) => <li key={index}>{responsibility}</li>)}</ul>
					</div>
				</div>

				<div>
					<h1 className="mb-4 text-xl font-semibold">Compensation</h1>
					<ul className="grid grid-cols-2 gap-x-5 gap-y-10 border-t border-t-border pt-8">
						<li className="grid gap-3">
							<p className="text-sm font-medium">Salary</p>
							<p className="text-sm font-light">
								{new Intl.NumberFormat('en-US', {
									style: 'currency',
									currency: 'USD'
								}).format(Number(data?.salary))}
							</p>
						</li>
						<li className="grid gap-3">
							<p className="text-sm font-medium">Signing Bonus</p>
							<p className="text-sm font-light">
								{data?.signing_bonus
									? new Intl.NumberFormat('en-US', {
											style: 'currency',
											currency: 'USD'
										}).format(Number(data?.signing_bonus))
									: '--'}
							</p>
						</li>
					</ul>

					{data?.fixed_allowance && (
						<div className="mt-10 grid grid-cols-2 gap-4">
							<p className="text-sm font-medium">Fixed Allowances</p>
							<ul className="grid list-disc gap-4 pl-3 text-sm font-light">
								{(data?.fixed_allowance as { name: string; frequency: string; amount: string }[])?.map((allowance, index) => (
									<li key={index}>
										<div className="flex items-baseline justify-between p-1 font-light">
											<div>
												{allowance.name} • <span className="text-xs font-light text-muted-foreground">${allowance.amount}</span>
											</div>
											<div className="text-xs text-muted-foreground">{allowance.frequency}</div>
										</div>
									</li>
								))}
							</ul>
						</div>
					)}
				</div>

				<div>
					<h1 className="mb-4 text-xl font-semibold">Job Schedule</h1>
					<ul className="grid grid-cols-2 gap-x-5 gap-y-10 border-t border-t-border pt-8">
						<li className="grid gap-3">
							<p className="text-sm font-medium">Employment Start Date</p>
							<p className="text-sm font-light">{format(data?.start_date as string, 'PP')}</p>
						</li>
						<li className="grid gap-3">
							<p className="text-sm font-medium">Paid Leave</p>
							<p className="text-sm font-light">{data?.paid_leave} Days</p>
						</li>
						<li className="grid gap-3">
							<p className="text-sm font-medium">Sick Leave</p>
							<p className="text-sm font-light">{data?.sick_leave} Days</p>
						</li>
						<li className="grid gap-3">
							<p className="text-sm font-medium">Probation Period</p>
							<p className="text-sm font-light">{data?.probation_period} Days</p>
						</li>
					</ul>
				</div>
			</div>
		</section>
	);
};
