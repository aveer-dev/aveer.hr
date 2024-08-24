'use server';

import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Building2, Copy, EllipsisVertical, FilePenLine, House } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ToggleRoleStatus } from './toggleRoleStatus';
import { redirect } from 'next/navigation';
import { TerminateOpening } from './delete-role-dialog';
import { BackButton } from '@/components/ui/back-button';

interface props {
	role: string;
	orgId: string;
	type: 'job' | 'role';
}

export const RoleDetails = async ({ role, orgId, type }: props) => {
	const supabase = createClient();
	let { data, error } = await supabase.from('open_roles').select('*, entity:legal_entities!profile_contract_entity_fkey(id, name, incorporation_country)').match({ id: role, org: orgId }).single();
	const {
		data: { user },
		error: authError
	} = await supabase.auth.getUser();

	if (error || !data) {
		return (
			<div className="flex h-[50vh] flex-col items-center justify-center text-center">
				<p className="text-xs">Unable to fetch roles, please refresh page to try again</p>
				<p className="mt-6 text-xs text-muted-foreground">{error?.message}</p>
			</div>
		);
	}

	const deleteRole = async (): Promise<string> => {
		'use server';
		const supabase = createClient();

		const {
			data: { user },
			error: authError
		} = await supabase.auth.getUser();
		if (authError) return authError.message;
		if (!user) return 'User auth not found';

		const { data, error } = await supabase.from('profiles_roles').select().match({ organisation: orgId, profile: user.id });
		if (error || !data.length) return `You do not have adequate org permission to terminate contracts`;

		const { error: roleError } = await supabase.from('open_roles').delete().match({ org: orgId, id: role });
		if (roleError) return roleError.message;

		return redirect(`/${orgId}/open-roles/`);
	};

	return (
		<section className="mx-auto -mt-6 grid max-w-4xl gap-10 p-6 pt-0">
			<div className="flex justify-between">
				<div className="relative flex">
					<BackButton className="absolute -left-16" />

					<div className="grid gap-2">
						<h1 className="flex items-center gap-4 text-2xl font-bold">{data?.job_title}</h1>
						<p className="flex gap-4 text-xs font-light">
							<span className="capitalize">{(data?.entity as any)?.name}</span> • <span className="capitalize">{data?.employment_type}</span> •{' '}
							<span className="flex items-center gap-1">
								{data.work_location === 'remote' && <House className="text-muted-foreground" size={10} />}
								{data.work_location === 'on-site' && <Building2 className="text-muted-foreground" size={12} />}
								{data.work_location}
							</span>
						</p>
					</div>
				</div>

				<div className="flex gap-3">
					{user && type == 'role' && (
						<>
							<ToggleRoleStatus status={data?.state} org={orgId} role={role} />

							<Popover>
								<PopoverTrigger asChild>
									<Button variant="secondary" className="h-[32px]" size={'sm'}>
										<EllipsisVertical size={14} />
									</Button>
								</PopoverTrigger>
								<PopoverContent align="end" className="w-48 p-2">
									<Link href={`./${role}/edit`} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-full justify-start gap-2')}>
										<FilePenLine size={12} />
										Edit Role
									</Link>
									<Link href={`./new?duplicate=${role}`} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-full justify-start gap-2')}>
										<Copy size={12} />
										Duplicate
									</Link>
									<TerminateOpening deleteRole={deleteRole} />
								</PopoverContent>
							</Popover>
						</>
					)}

					{type == 'job' && (
						<Link href={'#application-form'} className={cn(buttonVariants())}>
							Apply to role
						</Link>
					)}
				</div>
			</div>

			<div className="mt-5 grid gap-20">
				<div>
					<h1 className="mb-4 text-xl font-semibold">Job Details</h1>
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
					</ul>
					<div className="mt-10 grid gap-2">
						<p className="text-sm font-medium">Job Responsibilities</p>
						<ul className="ml-3 grid list-disc gap-4 text-sm font-light">{(data?.responsibilities as string[])?.map((responsibility, index) => <li key={index}>{responsibility}</li>)}</ul>
					</div>
				</div>

				<div>
					<h1 className="mb-4 text-xl font-semibold">Job Requirements</h1>
					<ul className="grid grid-cols-2 items-start gap-x-5 gap-y-10 border-t border-t-border pt-8">
						<li className="grid gap-2">
							<h3 className="text-sm font-medium">Job Requirements</h3>
							<ul className="ml-3 grid list-disc gap-4 text-sm font-light">{(data?.requirements as string[])?.map((requirement, index) => <li key={index}>{requirement}</li>)}</ul>
						</li>
						<li className="grid gap-2">
							<p className="text-sm font-medium">Experience</p>
							<p className="text-sm font-light">{data?.years_of_experience} years</p>
						</li>
					</ul>
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
						{(data.additional_offerings as string[])?.length > 0 && (
							<li className="grid items-start gap-4">
								<h3 className="h-fit text-sm font-medium">Additional offerings</h3>
								<ul className="ml-3 grid list-disc gap-4 text-sm font-light">
									{(data.additional_offerings as string[])?.map((offer, index) => (
										<li key={index} className="text-sm font-light">
											{offer}
										</li>
									))}
								</ul>
							</li>
						)}

						{(data?.fixed_allowance as []).length > 0 && (
							<li className="grid gap-4">
								<h3 className="text-sm font-medium">Fixed Allowances</h3>
								<ul className="grid list-disc gap-2 pl-3 text-sm font-light">
									{(data?.fixed_allowance as { name: string; frequency: string; amount: string }[])?.map((allowance, index) => (
										<li key={index}>
											<div className="flex items-baseline justify-between p-1 font-light">
												<div>
													{allowance?.name} • <span className="text-xs font-light text-muted-foreground">${allowance.amount}</span> • <span className="text-xs text-muted-foreground">{allowance.frequency}</span>
												</div>
											</div>
										</li>
									))}
								</ul>
							</li>
						)}
					</ul>
				</div>

				<div>
					<h1 className="mb-4 text-xl font-semibold">Job Schedule</h1>
					<ul className="grid grid-cols-2 gap-x-5 gap-y-10 border-t border-t-border pt-8">
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
						<li className="grid gap-3">
							<p className="text-sm font-medium">Work Schedule</p>
							<p className="text-sm font-light">
								{data?.work_schedule}hrs, {data?.work_shedule_interval}
							</p>
						</li>
					</ul>
				</div>
			</div>
		</section>
	);
};
