export interface Person {
	id: number;
	job_title: string;
	team: number;
	email_id?: string;
	profile: {
		first_name: string;
		last_name: string;
		id: string;
		email: string;
	};
}

export interface CalendarEvent {
	id: string;
	summary: string;
	org: string;
	location: string;
	meeting_link: string;
	start: { dateTime: string; timeZone: string };
	end: { dateTime: string; timeZone: string };
	contracts: number[];
	reminders: Array<{ minutes: number }>;
	attendees: AttendeeGroup[];
}

export interface AttendeeGroup {
	all?: Person[];
	team?: {
		id: number;
		name: string;
		people: Person[];
	};
	single?: Person;
}

export interface OrgDetails {
	subdomain: string;
	name: string;
}

export interface WebhookPayload {
	type: 'INSERT' | 'UPDATE';
	table: string;
	record: CalendarEvent;
	schema: 'public';
	old_record?: CalendarEvent;
}
