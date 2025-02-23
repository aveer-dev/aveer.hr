import { CircleHelp } from 'lucide-react';
import { NavMenu } from '@/components/ui/nav-menu';
import { LogoutButton } from './logout-button';
import { AccountTypeToggle } from './account-type-toggle';
import { createClient } from '@/utils/supabase/server';
import { NavLink } from '@/components/ui/link';
import { Inbox } from './inbox/messages';
import { PushNotificationBanner } from './push-notification-banner';
import { Tables } from '@/type/database.types';

export const Header = async ({ orgId, messages }: { orgId?: string; messages?: Tables<'inbox'>[] | null }) => {
	const supabase = await createClient();

	const { data } = await supabase.auth.getUser();

	messages = !messages
		? (
				await supabase
					.from('inbox')
					.select('*, sender_profile:profiles!inbox_sender_profile_fkey(id, first_name, last_name)')
					.or(`and(org.eq.${orgId},draft.eq.false),and(org.eq.${orgId},draft.eq.true,sender_profile.eq.${data.user?.id})`)
					.order('created_at', { ascending: false })
			).data
		: messages;

	const updateFCMToken = async (token: string) => {
		'use server';

		if (!data?.user?.id) return;

		const supabase = await createClient();

		const { data: profile } = await supabase.from('profiles').select('fcm_token').eq('id', data.user?.id).single();
		const existingTokens = profile!.fcm_token || [];
		existingTokens.push(token);

		const { error } = await supabase.from('profiles').update({ fcm_token: existingTokens }).eq('id', data.user?.id);
		if (error) return error;
	};

	return (
		<header className="sticky top-0 z-20 w-full bg-background shadow-sm">
			{orgId === 'employee' && <PushNotificationBanner updateToken={updateFCMToken} />}

			<div className="flex items-center justify-between px-6 py-4">
				<div className="flex items-center gap-3">
					<NavLink org={orgId} href={'/app'} className="font-logo text-xl font-light">
						aveer.hr
					</NavLink>

					{data?.user && orgId && orgId !== 'app' && <AccountTypeToggle orgId={orgId} />}
				</div>

				<div className="flex items-center gap-4">
					<button className="flex items-center gap-2 text-xs">
						<CircleHelp className="text-muted-foreground" size={16} />
					</button>

					{data?.user && (
						<>
							<div className="h-3 w-px bg-muted-foreground"></div>
							<LogoutButton />
						</>
					)}
				</div>
			</div>

			{orgId && orgId !== 'employee' && orgId !== 'app' && data?.user && (
				<div className="no-scrollbar flex items-center justify-between overflow-x-auto px-6 pt-4">
					<NavMenu orgId={orgId} />

					<Inbox dbMessages={messages || []} org={orgId} sender={data.user.id} />
				</div>
			)}
		</header>
	);
};
