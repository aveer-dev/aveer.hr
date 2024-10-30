import { LeaveRequests } from './requests-dialog';
import { LeaveRequestDialog } from './leave-request-dialog';
import { Database, Tables } from '@/type/database.types';

export const getChartData = (data: Tables<'contracts'>, orgSettings: Tables<'org_settings'> | null): { label: Database['public']['Enums']['leave_type_enum']; total: number; days: number }[] => [
	{ label: 'paid', total: (data.paid_leave || orgSettings?.paid_leave || 0) as number, days: data.paid_leave_used as number },
	{ label: 'sick', total: (data.sick_leave || orgSettings?.sick_leave || 0) as number, days: data.sick_leave_used as number },
	{ label: 'paternity', total: (data.paternity_leave || orgSettings?.paternity_leave || 0) as number, days: data.paternity_leave_used as number },
	{ label: 'maternity', total: (data.maternity_leave || orgSettings?.maternity_leave || 0) as number, days: data.maternity_leave_used as number }
];

export { LeaveRequests, LeaveRequestDialog };
