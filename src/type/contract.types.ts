export interface CONTRACT {
	org: { name: string; id: string; subdomain: string };
	entity: { name: string; id: string; incorporation_country: { country_code: string; name: string } };
	salary: number;
	start_date: string;
	employment_type: string;
	job_title: string;
	level: string;
	status: string;
	id: string;
	profile_signed: string;
}
