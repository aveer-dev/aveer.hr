import { Tables } from './database.types';

export interface LEVEL {
	action?: string;
	id: string;
	level: number;
	type: string;
	first_name?: string;
	last_name?: string;
	created_at?: Date;
	feedback?: string;
	is_employee?: boolean;
}

export type APPLICANT = Tables<'job_applications'> & {
	org: {
		name: string;
		subdomain: string;
	};
	role: Tables<'open_roles'> & {
		policy: Tables<'approval_policies'>;
	};
	levels: LEVEL[];
};

export interface DOCUMENT {
	name: string;
	url?: string;
	text?: string;
	format?: string;
}
