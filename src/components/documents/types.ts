import { Tables } from '@/type/database.types';

export interface SHARED_WITH {
	access: 'editor' | 'viewer';
	profile: string;
	contract?: number | undefined;
}

export type DOCUMENT_ACCESS_TYPE = 'editor' | 'viewer';

export interface DocumentState {
	isSaving: boolean;
	isSaved: boolean;
	lastSavedVersion: string | null;
	error: string | null;
}

export interface DocumentVersion {
	version: string;
	content: string;
	timestamp: string;
}

export interface SignatoryInfo {
	id: string;
	contract?: number;
	profile?: string;
}

// Extend the database document type with our custom fields
export type DocumentMetadata = Tables<'documents'> & {
	org: {
		subdomain: string;
	};
	version?: string;
	shared_with: SHARED_WITH[];
	signed_lock: boolean;
	private: boolean;
	signatures?: SignatoryInfo[];
};
