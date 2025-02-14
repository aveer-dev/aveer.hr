import { createClient } from '@/utils/supabase/server';
import { ReactNode } from 'react';
import { Org404Wrapper } from './org-404';
import { buttonVariants } from '@/components/ui/button';
import { Undo2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { redirect } from 'next/navigation';

export const OrgWrapper = async ({ org, children }: { org: string; children: ReactNode }) => {
	if (org == 'app') return children;

	const supabase = await createClient();

	const { data: user, error: userError } = await supabase.auth.getUser();

	if (!user || userError) return redirect('/app/login');

	const [{ data, error }, { data: adminUser, error: adminUserError }] = await Promise.all([supabase.from('organisations').select().match({ subdomain: org }), supabase.from('profiles_roles').select().match({ organisation: org, profile: user.user?.id })]);

	if (adminUserError || !adminUser || !adminUser.length) return redirect('/app/');

	if (error || (data && !data.length))
		return (
			<div className="fixed bottom-0 left-0 right-0 top-0 z-20 flex flex-col justify-center bg-white/20 backdrop-blur-md">
				<Org404Wrapper>
					<div className="mx-auto max-w-xl">
						<h1 className="mb-3 text-7xl font-extrabold">404</h1>

						<h3 className="mb-3 text-lg font-bold">Organisation not found</h3>
						<p className="text-sm">Unable to find your organisation, make sure you have the correct URL and try again</p>

						<Link href={'/app'} className={cn(buttonVariants(), 'mt-6 gap-4')}>
							<Undo2 size={12} />
							Back home
						</Link>
					</div>
				</Org404Wrapper>
			</div>
		);

	return children;
};
