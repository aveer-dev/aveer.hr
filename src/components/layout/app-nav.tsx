import { createClient } from '@/utils/supabase/server';
import { NavMenu } from '@/components/ui/nav-menu';
import { Inbox } from './inbox/messages';
import { Database } from '@/type/database.types';

export const AppNav = async ({ orgId, userId }: { orgId: string; userId: string }) => {
	const supabase = await createClient();

	const { data } = await supabase.from('profiles_roles').select('role').match({ profile: userId, organisation: orgId });

	return (
		<div className="no-scrollbar flex items-center justify-between overflow-x-auto px-6 pt-4">
			<NavMenu orgId={orgId} role={data?.[0]?.role as Database['public']['Enums']['app_role']} />

			{data?.[0]?.role == 'admin' && <Inbox org={orgId} sender={userId} />}
		</div>
	);
};
