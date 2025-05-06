'use server';

import { sendEmail } from '@/api/email';
import LeaveRequestEmail from '@/components/emails/leave-request';
import { createClient } from '@/utils/supabase/server';
import { format, parseISO } from 'date-fns';

export const emailAdmins = async ({ from, to, org, employeeName, leaveType }: { leaveType: string; from: Date; to: Date; org: { name: string; subdomain: string }; employeeName: string }) => {
	const supabase = await createClient();

	const { data, error } = await supabase.from('profiles_roles').select('profile(first_name, last_name, email)').match({ organisation: org.subdomain, disable: false, role: 'admin' });

	if (error) throw error;

	for (const admin of data) {
		sendEmail({
			to: admin.profile?.email,
			from: `${org.name} on Aveer.hr <support@notification.aveer.hr>`,
			subject: `${org.name} | New Leave Request`,
			react: LeaveRequestEmail({
				name: `${admin.profile.first_name}`,
				org,
				leaveType,
				from: format(parseISO(from.toISOString()), 'PPPP'),
				to: format(parseISO(to.toISOString()), 'PPPP'),
				employeeName
			})
		});
	}
};
