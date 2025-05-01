export interface SHARED_WITH {
	access: 'editor' | 'viewer';
	profile: string;
	contract?: number | undefined;
}

export type DOCUMENT_ACCESS_TYPE = 'editor' | 'viewer';
