'use server';

import { createClient } from '@/utils/supabase/server';
import { FileManagementRepository } from '@/dal/repositories/file-management.repository';
import { revalidatePath } from 'next/cache';
import { ContractRepository } from '@/dal/repositories/contract.repository';
import { TeamRepository } from '@/dal/repositories/team.repository';
import { AccessLevel, FileWithAccess, FolderWithAccess } from '@/dal/interfaces/file-management.types';
import { DocumentRepository } from '@/dal/repositories/document.repository';
import { sendBulkEmail, sendEmail } from '@/api/email';
import DocumentInviteEmail from '@/components/emails/document-invite';
import { ProfileRepository } from '@/dal';

interface UploadFileArgs {
	file: File;
	org: string;
	ownerType: 'employee' | 'organisation';
	ownerId: string;
	parentFolderId?: number;
	entity?: number;
}

export async function uploadFileAndCreateRecord({ file, org, ownerType, ownerId, parentFolderId, entity }: UploadFileArgs) {
	function sanitizeFileName(name: string) {
		// Only allow safe characters, replace others with _
		return name.replace(/[^a-zA-Z0-9.\-_]/g, '_').replace(/_+/g, '_');
	}
	try {
		const supabase = await createClient();
		const sanitizedFileName = sanitizeFileName(file.name);
		const uniqueFileName = `${Date.now()}_${sanitizedFileName}`;
		const filePath = `${org}/${parentFolderId ?? 'root'}/${uniqueFileName}`;

		// Upload to storage
		const uploadRes = await supabase.storage.from('documents').upload(filePath, file, { upsert: false });
		if (uploadRes.error) throw uploadRes.error;
		// Create file record
		const repo = new FileManagementRepository();
		const filePayload = {
			name: file.name, // keep original name for display
			org,
			owner_id: ownerId,
			owner_type: ownerType,
			folder: parentFolderId ?? null,
			entity: entity ?? null,
			file_type: 'storage',
			storage_url: uploadRes.data.path
		};
		const { data, error } = await repo.createFile(filePayload as any);
		if (error) throw error;
		revalidatePath(`/app/${org}/files`);
		return { data, error: null };
	} catch (error: any) {
		return { data: null, error };
	}
}

interface CreateFolderArgs {
	name: string;
	org: string;
	ownerType: 'employee' | 'organisation';
	ownerId: string;
	parentFolderId?: number;
	entity?: number;
	createdBy?: string;
}

export async function createFolderServerAction({ name, org, ownerType, ownerId, parentFolderId, entity, createdBy }: CreateFolderArgs) {
	try {
		const repo = new FileManagementRepository();
		const folderPayload = {
			name,
			org,
			owner_id: ownerId,
			owner_type: ownerType,
			parent: parentFolderId ?? null,
			entity: entity ?? null
		};
		const { data, error } = await repo.createFolder(folderPayload as any);
		console.log(data, error);

		if (error) throw error;
		revalidatePath(`/app/${org}/files`);
		return { data, error: null };
	} catch (error: any) {
		return { data: null, error };
	}
}

export async function getResourceAccessList(resourceId: number, resourceType: 'file' | 'folder', select: string = '*') {
	try {
		const repo = new FileManagementRepository();
		const { data, error } = await repo.listResourceAccess(resourceId, resourceType, select);
		if (error) throw error;
		return { data, error: null };
	} catch (error: any) {
		return { data: null, error };
	}
}

export async function updateFolderServerAction(id: number, payload: Partial<{ name: string }>) {
	try {
		const repo = new FileManagementRepository();
		const { data, error } = await repo.updateFolder(id, payload);
		if (error) throw error;
		revalidatePath(`/files`); // Optionally, revalidate the path
		return { data, error: null };
	} catch (error: any) {
		return { data: null, error };
	}
}

export async function updateFileServerAction(id: number, payload: Partial<{ name: string }>) {
	try {
		const repo = new FileManagementRepository();
		const { data, error } = await repo.updateFile(id, payload);

		if (error) throw error;
		revalidatePath(`/files`); // Optionally, revalidate the path
		return { data, error: null };
	} catch (error: any) {
		return { data: null, error };
	}
}

export async function deleteFileOrFolderServerAction(resource: FileWithAccess | FolderWithAccess, resourceType: 'file' | 'folder') {
	try {
		const repo = new FileManagementRepository();
		await repo.revokeAllAccess(resource.id, resourceType);

		if (resourceType === 'folder') {
			const { data, error } = await repo.deleteFolder(resource.id);
			if (error) throw error;
			revalidatePath(`/files`);
			return { data, error: null };
		}

		if (resourceType === 'file') {
			// Fetch file details if not provided
			const file = resource as FileWithAccess;

			if (file.file_type === 'document' && file.document) {
				// Delete the document
				const docRepo = new DocumentRepository();
				const { error } = await docRepo.delete(file.document);
				if (error) throw error;
			}

			if (file.file_type === 'storage') {
				// Delete from storage
				const supabase = await createClient();
				if (file.storage_url) {
					const { error } = await supabase.storage.from('documents').remove([file.storage_url]);
					if (error) throw error;
				}
			}

			const { data, error } = await repo.deleteFile(file.id);
			if (error) throw error;
			revalidatePath(`/files`);
			return { data, error: null };
		}
		throw new Error('Invalid resource type');
	} catch (error: any) {
		return { data: null, error };
	}
}

/**
 * Fetch all employees by org with profile and team data
 */
export async function getAllEmployeesByOrgWithProfileAndTeam(org: string) {
	try {
		const repo = new ContractRepository();
		const data = await repo.getAllByOrgWithProfileAndTeam(org);
		return { data, error: null };
	} catch (error: any) {
		return { data: null, error };
	}
}

/**
 * Fetch all teams by org
 */
export async function getAllTeamsByOrg(org: string) {
	try {
		const repo = new TeamRepository();
		const data = await repo.getAllByOrg(org);
		return { data, error: null };
	} catch (error: any) {
		return { data: null, error };
	}
}

interface GrantAccessArgs {
	resource_id: number;
	resource_type: 'file' | 'folder';
	profiles: string[];
	access_level: AccessLevel;
	select?: string;
	teams: number[];
	org?: string;
	resourceName: string;
}

export async function grantResourceAccessAction({ resource_id, resource_type, profiles, access_level, teams, org, resourceName }: GrantAccessArgs & { org?: string }) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
			error: userError
		} = await supabase.auth.getUser();
		if (userError) throw userError;

		const repo = new FileManagementRepository();
		const profileRepo = new ProfileRepository();

		const [{ data, error }, { data: profile, error: profileError }] = await Promise.all([
			repo.grantAccess({ resource_id, resource_type, profiles, access_level, teams, select: '*, profile:profiles!resource_access_profile_fkey(email, first_name, last_name, id), team:teams!resource_access_team_fkey(id, name), org' }),
			profileRepo.getById(user!.id, 'first_name, last_name, id')
		]);
		if (error) throw error;

		const senderName = `${profile.first_name} ${profile.last_name}`;

		// Collect all emails to send invites to
		let emailList: { to: string; from: string; react: any; subject: string }[] = [];
		// 1. Add direct profile invites
		if (data?.length) {
			for (const r of data) {
				const profile: { email: string; first_name: string; last_name: string; id: string } = r.profile as any;
				if (profile && typeof profile === 'object' && profile.email) {
					emailList.push({
						to: profile.email,
						from: `Aveer.hr <support@notification.aveer.hr>`,
						react: DocumentInviteEmail({
							receiver: { name: `${profile.first_name} ${profile.last_name}`, id: profile.id },
							from: 'Aveer.hr <support@aveer.hr>',
							to: profile.email,
							file: { access_level, name: resourceName },
							senderName
						}),
						subject: 'You have been granted access'
					});
				}
			}
		}
		// 2. For each team, fetch employees and add their emails
		if (data?.length) {
			const contractRepo = new ContractRepository();
			for (const r of data) {
				// r.org may not exist, fallback to org param if needed
				const orgId = (r as any).org || org;
				const team: { name: string; id: number } = r.team as any;
				if (team && typeof team === 'object' && team.id && orgId) {
					// Fetch all employees in this team
					const teamContracts = await contractRepo.getAllByOrgWithProfileAndTeam(orgId);
					const teamMembers = teamContracts.filter(tc => tc.team && tc.team.id === team.id && tc.profile && tc.profile.email);
					for (const member of teamMembers) {
						if (member.profile && member.profile.email) {
							emailList.push({
								to: member.profile.email,
								from: `Aveer.hr <support@notification.aveer.hr>`,
								react: DocumentInviteEmail({
									receiver: { name: `${member.profile.first_name} ${member.profile.last_name}`, id: member.id },
									from: 'Aveer.hr',
									to: member.profile.email,
									file: { access_level, name: resourceName },
									senderName
								}),
								subject: `${senderName} Just gave you access to ${resourceName}`
							});
						}
					}
				}
			}
		}
		if (emailList.length) await sendBulkEmail(emailList);
		return { data, error: null };
	} catch (error: any) {
		return { data: null, error };
	}
}

interface UpdateAccessArgs {
	resourceId: number;
	resourceType: 'file' | 'folder';
	accessLevel: AccessLevel;
	profile?: string;
	team?: number;
	select?: string;
}

export async function updateResourceAccessAction({ resourceId, resourceType, accessLevel, profile, team, select = '*' }: UpdateAccessArgs) {
	try {
		const repo = new FileManagementRepository();
		const { data, error } = await repo.updateAccess({ resourceId, resourceType, accessLevel, profile, team, select });
		if (error) throw error;
		return { data, error: null };
	} catch (error: any) {
		return { data: null, error };
	}
}

interface RevokeAccessArgs {
	resourceId: number;
	resourceType: 'file' | 'folder';
	profile?: string;
	team?: number;
}

export async function revokeResourceAccessAction({ resourceId, resourceType, profile, team }: RevokeAccessArgs) {
	try {
		const repo = new FileManagementRepository();
		const result = await repo.revokeAccess({ resourceId, resourceType, profile, team });

		if (result.error) throw result.error;
		return { data: result.data, error: null };
	} catch (error: any) {
		return { data: null, error };
	}
}

export async function getFileDownloadUrl(file: FileWithAccess) {
	try {
		if (file.file_type === 'storage' && file.storage_url) {
			const supabase = await createClient();
			// Generate a signed URL for download (valid for 1 hour)
			const { data, error } = await supabase.storage.from('documents').download(file.storage_url);
			if (error) throw error;
			return { data, error: null };
		}
		// For document files, you may implement PDF/HTML export/download in the future
		return { data: null, error: null };
	} catch (error: any) {
		return { data: null, error };
	}
}

export async function getFileUrl(file: FileWithAccess) {
	try {
		if (file.file_type === 'storage' && file.storage_url) {
			const supabase = await createClient();
			// Generate a signed URL
			const { data, error } = await supabase.storage.from('documents').createSignedUrl(file.storage_url, 60);
			if (error) throw error;
			return { data, error: null };
		}

		return { data: null, error: null };
	} catch (error: any) {
		return { data: null, error };
	}
}
