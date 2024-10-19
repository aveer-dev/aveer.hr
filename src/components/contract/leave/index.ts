import { LeaveRequests } from './requests-dialog';
import { LeaveRequestDialog } from './leave-request-dialog';
import { Database, Tables } from '@/type/database.types';

export const getChartData = (data: Tables<'contracts'>): { label: Database['public']['Enums']['leave_type_enum']; total: number; days: number }[] => [
	{ label: 'paid', total: data.paid_leave as number, days: data.paid_leave_used as number },
	{ label: 'sick', total: data.sick_leave as number, days: data.sick_leave_used as number },
	{ label: 'paternity', total: data.paternity_leave as number, days: data.paternity_leave_used as number },
	{ label: 'maternity', total: data.maternity_leave as number, days: data.maternity_leave_used as number }
];

export { LeaveRequests, LeaveRequestDialog };
