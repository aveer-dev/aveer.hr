import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

export const OrgWrapper = async ({ org, children }: { org: string; children: ReactNode }) => {
	const supabase = await createClient();

	const { data: user, error: userError } = await supabase.auth.getUser();

	if (userError) redirect('/login');

	const { data, error } = await supabase.from('profiles_roles').select().match({ organisation: org, profile: user.user?.id });

	if (error)
		return (
			<div className="flex h-[50vh] flex-col items-center justify-center text-center">
				<p className="text-xs">Unable to find your organisation, make sure you have the correct URL and try again</p>
				<p className="mt-6 text-xs text-muted-foreground">{error.message}</p>
			</div>
		);

	if (data && !data.length) redirect('/');

	return children;
};
