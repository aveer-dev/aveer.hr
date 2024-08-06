export interface PERSON {
	first_name: string;
	last_name: string;
	email: string;
	agreement_type?: 'employee' | 'contractor';
	payment_type?: 'fixed' | 'payg' | 'milestone' | '';
	status: string;
	country: string;
	start_date: string;
	employment_type: string;
	id: string;
	job_title?: string;
}
