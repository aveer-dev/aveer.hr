import { createClient } from '@/utils/supabase/server';
import { ReactNode } from 'react';
import { Error404Wrapper } from '@/components/ui/error-404-wrapper';
import { buttonVariants } from '@/components/ui/button';
import { Undo2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { redirect } from 'next/navigation';
import { RoleManagerWrapper } from './role-manager-wrapper';

export const OrgWrapper = async ({ params, children }: { params: Promise<{ [key: string]: string }>; children: ReactNode }) => {
	const org = (await params).org;
	if (org == 'app') return children;

	const supabase = await createClient();

	const { data: user, error: userError } = await supabase.auth.getUser();

	if (!user || userError) return redirect('/app/login');

	const [{ data, error }, { data: adminUser, error: adminUserError }] = await Promise.all([supabase.from('organisations').select().match({ subdomain: org }), supabase.from('profiles_roles').select().match({ organisation: org, profile: user.user?.id })]);

	if (error || (data && !data.length))
		return (
			<Error404Wrapper cursorText="404">
				<div className="mx-auto max-w-xl">
					<h1 className="mb-3 text-7xl font-extrabold">404</h1>

					<h3 className="mb-3 text-lg font-bold">Organisation not found</h3>
					<p className="text-sm">Unable to find your organisation, make sure you have the correct URL and try again</p>

					<Link href={'/app'} className={cn(buttonVariants(), 'mt-6 gap-4')}>
						<Undo2 size={12} />
						Back home
					</Link>
				</div>
			</Error404Wrapper>
		);

	if (adminUserError || !adminUser || !adminUser.length)
		return (
			<Error404Wrapper cursorText="error">
				<div className="mx-auto max-w-xl">
					<h1 className="mb-3 text-4xl font-extrabold">Unauthorized</h1>

					<h3 className="mb-3 text-lg font-bold">You do not have access</h3>
					<p className="text-sm">You do not have access to this organisation, or your access has been revoked. Contact your admin or HR.</p>

					<Link href={'/app'} className={cn(buttonVariants(), 'mt-6 gap-4')}>
						<Undo2 size={12} />
						Back home
					</Link>
				</div>
			</Error404Wrapper>
		);

	if (adminUser && adminUser.length) {
		if (adminUser[0].role == 'roles_manager') return <RoleManagerWrapper orgId={org}>{children}</RoleManagerWrapper>;
		if (adminUser[0].role == 'admin') return children;
	}

	return children;
};
