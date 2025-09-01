'use server';

import { sendEmail } from '@/api/email';
import LeaveRequestEmail from '@/components/emails/leave-update';
import { LeaveRepository } from '@/dal/repositories/leave.repository';
import { ContractRepository } from '@/dal/repositories/contract.repository';
import { differenceInBusinessDays, format } from 'date-fns';
import { parseDateOnly } from '@/lib/utils';
import { Tables, TablesUpdate } from '@/type/database.types';

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
			from: format(parseDateOnly(from), 'PPPP'),
			to: format(parseDateOnly(to), 'PPPP'),
			status
		})
	});
};

export const cancelLeave = async (data: Tables<'time_off'>) => {
	const leaveRepo = new LeaveRepository();
	const contractRepo = new ContractRepository();

	try {
		await leaveRepo.update(data.org, data.id, {
			status: 'cancelled'
		});

		if (data.status === 'approved') {
			const leaveTypeString = `${data.leave_type}_leave_used` as const;
			const leaveDays = differenceInBusinessDays(parseDateOnly(data.to), parseDateOnly(data.from)) + 1;

			// Fetch the contract to get the current leave used value
			const contractId = (data.contract as any)?.id || data.contract;
			const contractResult = await contractRepo.getById(data.org, contractId);
			const contractData = contractResult.data;
			if (contractData && typeof contractData[leaveTypeString] === 'number') {
				const payload: TablesUpdate<'contracts'> = {
					[leaveTypeString]: (contractData[leaveTypeString] as number) - leaveDays
				};
				await contractRepo.update(data.org, contractId, payload);
			}
		}

		// TODO: send email to admins, manager and employee
	} catch (error) {
		console.error(error);
		throw error;
	}
};
