import { createClient } from '@/utils/supabase/server';
import { Database, TablesInsert } from '@/type/database.types';
import { File, Folder, ResourceAccess, FileWithAccess, FolderWithAccess, FileManagementFilters, AccessControlFilters, AccessLevel, ResourceAccessListItem, UpdateFilePayload, UpdateFolderPayload } from '../interfaces/file-management.types';
import { PostgrestError } from '@supabase/supabase-js';

export class FileManagementRepository {
	/**
	 * Create a folder and grant owner access
	 * @param folder Folder payload
	 * @param select Custom select string (default '*')
	 */
	async createFolder(folder: Folder, select: string = '*'): Promise<{ data: { resource: Folder; access: ResourceAccess | null } | null; error: PostgrestError | null }> {
		const supabase = await createClient();
		const { data, error } = await supabase.from('folders').insert(folder).select(select).single();
		if (error || !data || typeof data !== 'object') return { data: null, error };

		const folderData = data as Folder;
		// Grant owner access
		const { data: access, error: accessError } = await this.grantAccess({ resource_id: folderData.id, resource_type: 'folder', profiles: [folderData.created_by], access_level: 'owner' });

		if (accessError) return { data: null, error: accessError };
		return { data: { resource: folderData, access: access ? access[0] : null }, error: null };
	}

	/**
	 * Helper to get the current user's profile id
	 */
	private async getCurrentUserId(supabase: any): Promise<{ id: string | null; error: PostgrestError | null }> {
		const {
			data: { user },
			error
		} = await supabase.auth.getUser();
		if (!user || error) return { id: null, error: error || new Error('No user found') };
		return { id: user.id, error: null };
	}

	/**
	 * Get a folder by id and profile access
	 * @param id Folder id
	 * @param select Custom select string (default '*, resource_access!inner (access_level)')
	 */
	async getFolder(id: number, select: string = '*, resource_access!inner (access_level)'): Promise<{ data: FolderWithAccess | null; error: PostgrestError | null }> {
		const supabase = await createClient();
		const { id: userId, error: userError } = await this.getCurrentUserId(supabase);
		if (!userId || userError) return { data: null, error: userError };

		// Step 1: Check if user has access to this folder
		const { data: accessRows, error: accessError } = await supabase.from('resource_access').select('folder').eq('profile', userId).eq('folder', id).single();
		if (accessError || !accessRows) return { data: null, error: accessError || new Error('No access to folder') };

		// Step 2: Fetch the folder
		const { data, error } = await supabase.from('folders').select(select).eq('id', id).single();
		if (error || !data || typeof data !== 'object') return { data: null, error };
		return { data, error: null };
	}

	/**
	 * List folders with filters and access
	 * @param filters Filtering options
	 * @param select Custom select string (default '*, resource_access!left (access_level)')
	 */
	async listFolders(filters: FileManagementFilters, select: string = '*'): Promise<{ data: FolderWithAccess[]; error: PostgrestError | null }> {
		const supabase = await createClient();

		const { id: userId, error: userError } = await this.getCurrentUserId(supabase);
		if (!userId || userError) return { data: [], error: userError };

		// Step 1: Get all folder IDs the user has access to
		const { data: accessRows, error: accessError } = await supabase.from('resource_access').select('folder, access_level').eq('profile', userId).not('folder', 'is', null);
		if (accessError) return { data: [], error: accessError };
		const folderIds = (accessRows || []).map((row: any) => row.folder).filter(Boolean);
		if (folderIds.length === 0) return { data: [], error: null };

		// Step 2: Query folders with those IDs and other filters
		let query = supabase.from('folders').select(select).in('id', folderIds).eq('org', filters.org);
		if (filters.entity) query = query.eq('entity', filters.entity);
		if ((filters as any).parent_id) query = query.eq('parent_id', (filters as any).parent_id);
		if (filters.owner_type) query = query.eq('owner_type', filters.owner_type);
		if (filters.owner_id) query = query.eq('owner_id', filters.owner_id);
		if (filters.search) query = query.ilike('name', `%${filters.search}%`);
		const { data, error } = await query;
		if (error || !Array.isArray(data)) return { data: [], error };
		const result: FolderWithAccess[] = data.map((folder: any) => ({
			...folder,
			access_level: accessRows.find(row => row.folder == folder.id)?.access_level
		}));
		return { data: result, error: null };
	}

	/**
	 * Create a file and grant owner access
	 * @param file File payload
	 * @param select Custom select string (default '*')
	 */
	async createFile(file: Omit<File, 'id' | 'created_at' | 'updated_at'>, select: string = '*'): Promise<{ data: { resource: File; access: ResourceAccess | null } | null; error: PostgrestError | null }> {
		const supabase = await createClient();
		const { data, error } = await supabase.from('files').insert(file).select(select).single();
		if (error || !data || typeof data !== 'object') return { data: null, error };

		const fileData = data as File;
		// Grant owner access
		const { data: access, error: accessError } = await this.grantAccess({ resource_id: fileData.id, resource_type: 'file', profiles: [fileData.created_by], access_level: 'owner' });
		if (accessError) return { data: null, error: accessError };
		return { data: { resource: fileData, access: access ? access[0] : null }, error: null };
	}

	/**
	 * Get a file by id and profile access
	 * @param id File id
	 * @param select Custom select string (default '*, resource_access!inner (access_level)')
	 */
	async getFile(id: number, select: string = '*, resource_access!inner (access_level)'): Promise<{ data: FileWithAccess | null; error: PostgrestError | null }> {
		const supabase = await createClient();
		const { id: userId, error: userError } = await this.getCurrentUserId(supabase);
		if (!userId || userError) return { data: null, error: userError };

		// Step 1: Check if user has access to this file
		const { data: accessRows, error: accessError } = await supabase.from('resource_access').select('file').eq('profile', userId).eq('file', id).single();
		if (accessError || !accessRows) return { data: null, error: accessError || new Error('No access to file') };

		// Step 2: Fetch the file
		const { data, error } = await supabase.from('files').select(select).eq('id', id).single();
		if (error || !data || typeof data !== 'object') return { data: null, error };
		return { data, error: null };
	}

	/**
	 * List files with filters and access
	 * @param filters Filtering options
	 * @param select Custom select string (default '*, resource_access!left (access_level)')
	 */
	async listFiles(filters: FileManagementFilters, select: string = '*'): Promise<{ data: FileWithAccess[]; error: PostgrestError | null }> {
		const supabase = await createClient();

		const { id: userId, error: userError } = await this.getCurrentUserId(supabase);
		if (!userId || userError) return { data: [], error: userError };

		// Step 1: Get all file IDs the user has access to
		const { data: accessRows, error: accessError } = await supabase.from('resource_access').select('file, access_level').eq('profile', userId).not('file', 'is', null);
		if (accessError) return { data: [], error: accessError };
		const fileIds = (accessRows || []).map((row: any) => row.file).filter(Boolean);
		if (fileIds.length === 0) return { data: [], error: null };

		// Step 2: Query files with those IDs and other filters
		let query = supabase.from('files').select(select).in('id', fileIds).eq('org', filters.org);
		if (filters.entity) query = query.eq('entity', filters.entity);
		if (filters.folder_id) query = query.eq('folder_id', filters.folder_id);
		if (filters.owner_type) query = query.eq('owner_type', filters.owner_type);
		if (filters.owner_id) query = query.eq('owner_id', filters.owner_id);
		if (filters.search) query = query.ilike('name', `%${filters.search}%`);
		const { data, error } = await query;
		if (error || !Array.isArray(data)) return { data: [], error };
		const result = data.map((file: any) => ({
			...file,
			access_level: accessRows.find(row => row.file == file.id)?.access_level
		}));
		return { data: result, error: null };
	}

	/**
	 * Grant access to a resource
	 * @param resource_id Folder or file id
	 * @param resource_type 'folder' | 'file'
	 * @param profiles Profile ids
	 * @param access_level Access level
	 * @param select Custom select string (default '*')
	 * @param teams Team ids
	 */
	async grantAccess({
		resource_id,
		resource_type,
		profiles,
		select = '*',
		teams,
		access_level
	}: {
		resource_id: number;
		resource_type: 'folder' | 'file';
		profiles: string[];
		teams?: number[];
		access_level: AccessLevel;
		select?: string;
	}): Promise<{ data: ResourceAccess[] | null; error: PostgrestError | null }> {
		const payloadEmployees: TablesInsert<'resource_access'>[] = profiles.map(profile => ({ profile, [resource_type === 'folder' ? 'folder' : 'file']: resource_id, access_level }));
		const payloadTeams: TablesInsert<'resource_access'>[] = teams?.length ? teams?.map(team => ({ [resource_type === 'folder' ? 'folder' : 'file']: resource_id, team, access_level })) : [];

		const supabase = await createClient();
		const { data, error } = await supabase
			.from('resource_access')
			.insert([...payloadEmployees, ...payloadTeams])
			.select(select);

		if (error || !data || typeof data !== 'object') return { data: null, error };

		return { data: data as any, error: null };
	}

	/**
	 * Revoke access to a resource
	 * @param resourceId Folder or file id
	 * @param resourceType 'folder' | 'file'
	 * @param profile Profile id
	 * @param team Team id
	 */
	async revokeAccess({ resourceId, resourceType, profile, team }: { resourceId: number; resourceType: 'folder' | 'file'; profile?: string; team?: number }): Promise<{ data: boolean; error: PostgrestError | null }> {
		const supabase = await createClient();

		const request = supabase
			.from('resource_access')
			.delete()
			.eq(resourceType === 'folder' ? 'folder' : 'file', resourceId);
		if (profile) request.eq('profile', profile);
		if (team) request.eq('team', team);

		const { error } = await request;
		return { data: !error, error };
	}

	/**
	 * Update access to a resource
	 * @param resource_id Folder or file id
	 * @param resource_type 'folder' | 'file'
	 * @param profile_id Profile id
	 * @param access_level Access level
	 * @param select Custom select string (default '*')
	 */
	async updateAccess({
		resourceId,
		resourceType,
		profile,
		accessLevel,
		select = '*',
		team
	}: {
		resourceId: number;
		resourceType: 'folder' | 'file';
		profile?: string;
		accessLevel: AccessLevel;
		select: string;
		team?: number;
	}): Promise<{ data: ResourceAccess | null; error: PostgrestError | null }> {
		const supabase = await createClient();

		const query = supabase
			.from('resource_access')
			.update({ access_level: accessLevel })
			.eq(resourceType === 'folder' ? 'folder' : 'file', resourceId);
		if (profile) query.eq('profile', profile);
		if (team) query.eq('team', team);

		const { data, error } = await query.select(select).single();
		if (error || !data || typeof data !== 'object') return { data: null, error };
		return { data, error: null };
	}

	/**
	 * Check access level for a resource
	 * @param resource_id Folder or file id
	 * @param resource_type 'folder' | 'file'
	 * @param profile_id Profile id
	 * @param required_level Required access level
	 */
	async checkAccess(resource_id: number, resource_type: 'folder' | 'file', profile_id: string, required_level: AccessLevel): Promise<{ data: boolean; error: PostgrestError | null }> {
		const supabase = await createClient();
		const { data, error } = await supabase
			.from('resource_access')
			.select('access_level')
			.eq(resource_type === 'folder' ? 'folder_id' : 'file_id', resource_id)
			.eq('profile_id', profile_id)
			.single();
		if (error || !data || typeof data !== 'object') return { data: false, error };
		const levels: AccessLevel[] = ['read', 'write', 'delete', 'full'];
		const requiredIndex = levels.indexOf(required_level);
		const userIndex = levels.indexOf(data.access_level);
		return { data: userIndex >= requiredIndex, error: null };
	}

	/**
	 * List access for a file or folder
	 * @param resourceId File or folder id
	 * @param resourceType 'file' | 'folder'
	 */
	async listResourceAccess(resourceId: number, resourceType: 'file' | 'folder', select: string = '*'): Promise<{ data: ResourceAccessListItem[]; error: PostgrestError | null }> {
		const supabase = await createClient();

		const { data, error } = await supabase
			.from('resource_access')
			.select(select)
			.eq(resourceType === 'folder' ? 'folder' : 'file', resourceId);

		if (error || !Array.isArray(data)) return { data: [], error };

		return { data: data as any, error: null };
	}

	/**
	 * Update a file by id
	 * @param id File id
	 * @param payload Partial file fields
	 */
	async updateFile(id: number, payload: UpdateFilePayload): Promise<{ data: File | null; error: PostgrestError | null }> {
		const supabase = await createClient();
		const { data, error } = await supabase.from('files').update(payload).eq('id', id).select().single();
		if (error || !data || typeof data !== 'object') return { data: null, error };
		return { data: data as File, error: null };
	}

	/**
	 * Update a folder by id
	 * @param id Folder id
	 * @param payload Partial folder fields
	 */
	async updateFolder(id: number, payload: UpdateFolderPayload): Promise<{ data: Folder | null; error: PostgrestError | null }> {
		const supabase = await createClient();
		const { data, error } = await supabase.from('folders').update(payload).eq('id', id).select().single();
		if (error || !data || typeof data !== 'object') return { data: null, error };
		return { data: data as Folder, error: null };
	}

	/**
	 * Delete a file by id
	 * @param id File id
	 */
	async deleteFile(id: number): Promise<{ data: boolean; error: any }> {
		const supabase = await createClient();
		const { error } = await supabase.from('files').delete().eq('id', id);
		return { data: !error, error };
	}

	/**
	 * Delete a folder by id
	 * @param id Folder id
	 */
	async deleteFolder(id: number): Promise<{ data: boolean; error: PostgrestError | null }> {
		const supabase = await createClient();
		const { error } = await supabase.from('folders').delete().eq('id', id);
		return { data: !error, error };
	}

	/**
	 * Revoke all access to a file
	 * @param resourceId File or folder id
	 * @param resourceType 'file' | 'folder'
	 */
	async revokeAllAccess(resourceId: number, resourceType: 'folder' | 'file'): Promise<{ data: boolean; error: PostgrestError | null }> {
		const supabase = await createClient();
		const { error } = await supabase.from('resource_access').delete().eq(resourceType, resourceId);
		return { data: !error, error };
	}
}
