import { Database } from './database.types';

export interface CONTRACT {
	org: { name: string; id: string; subdomain: string };
	entity: { name: string; id: string; incorporation_country: { country_code: string; name: string; currency_code: string } };
	salary: number;
	start_date: string;
	employment_type: string;
	job_title: string;
	level: string;
	status: Database['public']['Enums']['contract_state'];
	id: string;
	profile_signed: string;
	end_date?: string;
}
