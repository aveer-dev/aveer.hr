import { Database, Tables } from '@/type/database.types';

export type FileType = Database['public']['Enums']['file_type'];
export type FileOwnershipType = Database['public']['Enums']['file_ownership_type'];
export type AccessLevel = Database['public']['Enums']['access_level'];

export interface File extends Tables<'files'> {}

export interface Folder extends Tables<'folders'> {}

export interface ResourceAccess extends Tables<'resource_access'> {}

export interface FileWithAccess extends File {
	access_level: AccessLevel | null;
}

export interface FolderWithAccess extends Folder {
	access_level: AccessLevel | null;
}

export interface FileManagementFilters {
	org: string;
	entity?: number;
	folder_id?: number;
	owner_type?: FileOwnershipType;
	owner_id?: string;
	document?: number;
	search?: string;
}

export interface AccessControlFilters {
	profile_id: string;
	access_level?: AccessLevel;
}

export interface ResourceAccessListItem extends Tables<'resource_access'> {}

export type UpdateFilePayload = Partial<File>;
export type UpdateFolderPayload = Partial<Folder>;
