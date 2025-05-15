import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileManagementRepository } from '@/dal/repositories/file-management.repository';
import { FileFolderList } from './files-folders';
import { createClient } from '@/utils/supabase/server';

export const FileManagement = async ({ params }: { params: Promise<{ [key: string]: string }> }) => {
	const supabase = await createClient();
	const org = (await params).org;
	const repo = new FileManagementRepository();

	const { data: user } = await supabase.auth.getUser();

	// All files (created by user or accessible)
	const { data: files } = await repo.listFiles({ org });
	// Folders (accessible)
	const { data: folderData } = await repo.listFolders({ org });
	// Shared with me: files not created by user but accessible
	const shared = (files || []).filter(f => f.owner_id !== user?.user?.id && f.created_by !== user?.user?.id);
	const sharedFolders = (folderData || []).filter(f => f.owner_id !== user?.user?.id && f.created_by !== user?.user?.id);

	return (
		<Tabs defaultValue="all" className="w-full">
			<TabsList>
				<TabsTrigger value="all">All Files</TabsTrigger>
				<TabsTrigger value="shared">Shared with Me</TabsTrigger>
			</TabsList>

			<TabsContent value="all">
				<FileFolderList org={org} files={files} folders={folderData} />
			</TabsContent>

			<TabsContent value="shared">
				<FileFolderList org={org} files={shared} folders={sharedFolders} />
			</TabsContent>
		</Tabs>
	);
};
