import { CircleHelp } from 'lucide-react';
import { LogoutButton } from './logout-button';
import { AccountTypeToggle } from './account-type-toggle';
import { createClient } from '@/utils/supabase/server';
import { NavLink } from '@/components/ui/link';
import { PushNotificationBanner } from './push-notification-banner';
import { AppNav } from './app-nav';

export const Header = async ({ params }: { params?: Promise<{ [key: string]: string }> }) => {
	const supabase = await createClient();
	const orgId = params ? (await params).org : 'employee';

	const { data } = await supabase.auth.getUser();

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
		<header className="sticky top-0 z-20 w-full shadow-sm backdrop-blur-2xl">
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

			{orgId && orgId !== 'employee' && orgId !== 'app' && data?.user && <AppNav orgId={orgId} userId={data.user.id} />}
		</header>
	);
};
