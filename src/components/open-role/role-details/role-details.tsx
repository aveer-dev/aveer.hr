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
import { JobApplicationForm } from '@/components/job-application/application-form';
import { submitApplication } from '@/components/forms/contract/role.action';
import { Badge } from '@/components/ui/badge';
import { Details } from '@/components/ui/details';

interface props {
	role: string;
	orgId: string;
	type: 'job' | 'role';
}

export const RoleDetails = async ({ role, orgId, type }: props) => {
	const supabase = createClient();
	let { data, error } = await supabase.from('open_roles').select('*, entity:legal_entities!profile_contract_entity_fkey(id, name, incorporation_country), level:employee_levels!profile_contract_level_fkey(level, role)').match({ id: role, org: orgId }).single();
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
		<>
			<section className="mx-auto grid max-w-4xl gap-10 pb-6 pt-0">
				<div className="flex justify-between">
					<div className="relative">
						<BackButton />

						<div className="mt-6 grid gap-3 lg:mt-0">
							<h1 className="flex items-center gap-4 text-2xl font-bold">
								{data?.job_title}{' '}
								{data.state == 'closed' && type == 'job' && (
									<Badge className="font-light text-muted-foreground" variant={'secondary'}>
										{data.state}
									</Badge>
								)}
							</h1>
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

					<div className="lg: fixed bottom-0 left-0 flex w-full gap-3 border-t bg-background p-4 lg:relative lg:w-fit lg:border-t-0 lg:p-0">
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
										<Link href={`./${role}/edit`} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-full justify-start gap-3')}>
											<FilePenLine size={12} />
											Edit Role
										</Link>
										<Link href={`./new?duplicate=${role}`} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-full justify-start gap-3')}>
											<Copy size={12} />
											Duplicate
										</Link>
										<TerminateOpening deleteRole={deleteRole} />
									</PopoverContent>
								</Popover>
							</>
						)}

						{type == 'job' && data.state == 'open' && (
							<Link href={'#application-form'} className={cn(buttonVariants())}>
								Apply to role
							</Link>
						)}
					</div>
				</div>

				<Details data={data} formType={'role'} />
			</section>

			{data.state == 'open' && <JobApplicationForm roleId={Number(role)} org={orgId} submit={submitApplication} />}
		</>
	);
};
