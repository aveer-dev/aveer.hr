'use server';

import { sendEmail } from '@/api/email';
import LeaveRequestEmail from '@/components/emails/leave-update';
import { format } from 'date-fns';

export const emailEmployee = async ({ from, to, contract, org, status, leaveType, profile }: { profile: { first_name: string; email: string }; leaveType: string; from: string; to: string; contract: number; org: { name: string; subdomain: string }; status: string }) => {
	sendEmail({
		to: profile?.email,
		from: `${org.name} on Aveer.hr <support@notification.aveer.hr>`,
		subject: `${org.name} | Leave request ${status}`,
		react: LeaveRequestEmail({
			name: `${profile.first_name}`,
			org,
			leaveType,
			contract: contract,
			from: format(from, 'PPPP'),
			to: format(to, 'PPPP'),
			status
		})
	});
};
