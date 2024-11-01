'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { messaging } from '@/lib/firebase-hook';
import { getToken } from 'firebase/messaging';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useEffect, useState } from 'react';
import { PostgrestError } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loader';

const checkNotificationPermission = () => {
	if (!('Notification' in window)) return 'unsupported';

	return Notification.permission;
};

export const PushNotificationBanner = ({ updateToken }: { updateToken: (token: string) => Promise<PostgrestError | undefined> }) => {
	const [open, setOpen] = useState(false);
	const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>();
	const [isUpdatingToken, setUpdateState] = useState(false);

	const requestPermission = async () => {
		const permission = await Notification.requestPermission();
		if (permission === 'granted') {
			const token = await getToken(messaging, {
				vapidKey: process.env.NEXT_PUBLIC_VAPID
			});

			setUpdateState(true);
			const error = await updateToken(token);
			setUpdateState(false);
			if (error) toast.error(error.message);

			setPermission(checkNotificationPermission());
		}
	};

	useEffect(() => {
		setPermission(checkNotificationPermission());
	}, []);

	return permission === 'granted' || permission === undefined ? null : (
		<div className="flex w-full items-center justify-center gap-4 bg-muted p-2">
			<p className="text-sm font-light">Hi, will you like to be notified about company wide reminders, messages and notifications?</p>

			<AlertDialog open={open} onOpenChange={setOpen}>
				<AlertDialogTrigger asChild>
					<Button className="gap-3" variant={'outline'} onClick={() => setOpen(true)}>
						{isUpdatingToken ? <LoadingSpinner /> : <Bell size={12} />} Enable notifications
					</Button>
				</AlertDialogTrigger>

				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Hey, just some info</AlertDialogTitle>
						<AlertDialogDescription>
							We know lot of platforms miss use the push notification feature, but that&apos;s not us. We promise to only send notifications when necessary.
							<br /> <br />
							Soon we&apos;ll let you set the kind of notifications you&apos;ll like to receive.
							<br />
							<br />
						</AlertDialogDescription>
					</AlertDialogHeader>

					<AlertDialogFooter className="sm:justify-start">
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction className="gap-2" onClick={requestPermission}>
							<Bell size={12} /> Enable notifications
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};
