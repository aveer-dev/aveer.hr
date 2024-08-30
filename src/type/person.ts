import { Database } from './database.types';

export interface PERSON {
	status: Database['public']['Enums']['contract_state'];
	job_title: string;
	employment_type: string;
	start_date: string;
	profile: { last_name: string; first_name: string; nationality: { name: string } };
	id: string;
	org?: string;
	end_date?: string;
}
