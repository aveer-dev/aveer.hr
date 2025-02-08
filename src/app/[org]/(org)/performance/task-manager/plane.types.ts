export interface PLANE_RESPONSE {
	next_cursor: string;
	prev_cursor: string;
	next_page_results: boolean;
	prev_page_results: boolean;
	count: number;
	total_pages: number;
	total_results: number;
	extra_stats: any;
	results: any;
	detail: string;
	error: string;
}

export interface PLANE_PROJECT {
	id: string;
	total_members: number;
	total_cycles: number;
	total_modules: number;
	is_member: boolean;
	member_role: number;
	is_deployed: boolean;
	created_at: string;
	updated_at: string;
	name: string;
	description: string;
	description_text: string;
	description_html: string;
	network: number;
	identifier: string;
	emoji: string;
	icon_prop: string;
	module_view: boolean;
	cycle_view: boolean;
	issue_views_view: boolean;
	page_view: boolean;
	inbox_view: boolean;
	cover_image: string;
	archive_in: number;
	close_in: number;
	created_by: string;
	updated_by: string;
	workspace: string;
	default_assignee: string;
	project_lead: string;
	estimate: string;
	default_state: string;
}

export interface PLANE_CYCLE {
	id: string;
	created_at: string;
	updated_at: string;
	name: string;
	description: string;
	start_date: string;
	end_date: string;
	view_props: any;
	sort_order: number;
	created_by: string;
	updated_by: string;
	project: string;
	workspace: string;
	owned_by: string;
}

export interface PLANE_ISSUE {
	id: string;
	created_at: string;
	updated_at: string;
	estimate_point: string;
	name: string;
	description_html: string;
	description_stripped: string;
	priority: string;
	start_date: string;
	target_date: string;
	sequence_id: number;
	sort_order: number;
	completed_at: string;
	archived_at: string;
	is_draft: boolean;
	created_by: string;
	updated_by: string;
	project: string;
	workspace: string;
	parent: string;
	state: PLANE_STATE;
	assignees: string[];
	labels: string[];
}

export interface PLANE_STATE {
	color: string;
	created_at: string;
	created_by: string;
	default: boolean;
	deleted_at: string;
	description: string;
	external_id: string;
	external_source: string;
	group: string;
	id: string;
	is_triage: false;
	name: string;
	project: string;
	sequence: number;
	slug: string;
	updated_at: string;
	updated_by: string;
	workspace: string;
}

export interface PLANE_ASSIGNEE {
	id: string;
	first_name: string;
	last_name: string;
	email: string;
	avatar: string;
	avatar_url: string;
	display_name: string;
}
