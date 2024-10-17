'use client';

import { Redo2 } from 'lucide-react';
import { Button } from '../ui/button';
import { generateInvite } from '../forms/contract/invite-user.action';
import { useState } from 'react';
import { toast } from 'sonner';
import { LoadingSpinner } from '../ui/loader';

export const ResendInviteButton = ({ email, first_name, last_name, org }: { email: string; first_name: string; last_name: string; org: string }) => {
	const [isSendingInvite, setInviteState] = useState(false);

	const resendInvite = async () => {
		setInviteState(true);
		const response = await generateInvite({ email, org, first_name, last_name });
		setInviteState(false);

		if (typeof response === 'string') return toast.error('Unable to resend invite', { description: response });

		toast.success('Invite link sent', { description: `Invite link has been sent to ${first_name} successfully` });
	};

	return (
		<>
			<Button variant={'ghost'} onClick={resendInvite} disabled={isSendingInvite} className="w-full justify-start gap-2 focus:!ring-0">
				{!isSendingInvite && <Redo2 size={12} />}
				{isSendingInvite && <LoadingSpinner />}
				Resend invite
			</Button>
		</>
	);
};
