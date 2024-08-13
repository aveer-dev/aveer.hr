export interface PERSON {
	status: string;
	job_title: string;
	employment_type: string;
	start_date: string;
	profile: { last_name: string; first_name: string; nationality: { name: string } };
	id: string;
	org?: string;
}
